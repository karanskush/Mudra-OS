package api

import (
	"encoding/json"
	"net/http"
	"time"

	"fintech-backend/internal/database"
	"fintech-backend/internal/models"
	"fintech-backend/pkg/response"

	"golang.org/x/crypto/bcrypt"
)

// RegisterRequest represents the registration request
type RegisterRequest struct {
	Email       string    `json:"email" validate:"required,email"`
	Password    string    `json:"password" validate:"required,min=8"`
	FirstName   string    `json:"first_name" validate:"required"`
	LastName    string    `json:"last_name" validate:"required"`
	Phone       string    `json:"phone"`
	DateOfBirth time.Time `json:"date_of_birth"`
}

// LoginRequest represents the login request
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

// AuthResponse represents the authentication response
type AuthResponse struct {
	Token     string    `json:"token"`
	User      UserData  `json:"user"`
	ExpiresAt time.Time `json:"expires_at"`
}

// UserData represents user data in response
type UserData struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
}

// Register handles user registration
func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.MethodNotAllowed(w, r)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, r, "Invalid request body")
		return
	}

	// Check if user already exists
	var existingUser models.User
	if err := database.GetDB().Where("email = ?", req.Email).First(&existingUser).Error; err == nil {
		response.BadRequest(w, r, "User with this email already exists")
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		response.InternalServerError(w, r, "Failed to hash password")
		return
	}

	// Create new user
	user := models.User{
		Email:       req.Email,
		Password:    string(hashedPassword),
		FirstName:   req.FirstName,
		LastName:    req.LastName,
		Phone:       req.Phone,
		DateOfBirth: req.DateOfBirth,
		IsActive:    true,
		IsVerified:  false,
		Role:        "user",
	}

	// Save to database
	if err := database.GetDB().Create(&user).Error; err != nil {
		response.InternalServerError(w, r, "Failed to create user")
		return
	}

	// Return success response (without password)
	userResponse := map[string]interface{}{
		"id":          user.ID.String(),
		"email":       user.Email,
		"first_name":  user.FirstName,
		"last_name":   user.LastName,
		"role":        user.Role,
		"is_active":   user.IsActive,
		"is_verified": user.IsVerified,
	}

	response.Created(w, r, userResponse, "Registration successful")
}

// Login handles user login
func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.MethodNotAllowed(w, r)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, r, "Invalid request body")
		return
	}

	// Find user by email
	var user models.User
	if err := database.GetDB().Where("email = ?", req.Email).First(&user).Error; err != nil {
		response.BadRequest(w, r, "Invalid email or password")
		return
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		response.BadRequest(w, r, "Invalid email or password")
		return
	}

	// Check if user is active
	if !user.IsActive {
		response.BadRequest(w, r, "Account is deactivated")
		return
	}

	// Generate JWT token (for now, return a mock token)
	// TODO: Implement proper JWT token generation
	token := "mock-jwt-token-" + user.ID.String()

	userResponse := map[string]interface{}{
		"id":         user.ID.String(),
		"email":      user.Email,
		"first_name": user.FirstName,
		"last_name":  user.LastName,
		"role":       user.Role,
		"token":      token,
	}

	response.Success(w, r, userResponse, "Login successful")
}

// Logout handles user logout
func Logout(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.MethodNotAllowed(w, r)
		return
	}

	// TODO: Implement actual logout logic (invalidate token)
	response.Success(w, r, map[string]interface{}{
		"message": "Logged out successfully",
	}, "Logout successful")
}
