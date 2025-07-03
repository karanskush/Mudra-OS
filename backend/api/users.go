package api

import (
	"encoding/json"
	"net/http"

	"fintech-backend/internal/database"
	"fintech-backend/internal/middleware"
	"fintech-backend/internal/models"
	"fintech-backend/pkg/response"
)

// UpdateProfileRequest represents the profile update request
type UpdateProfileRequest struct {
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Phone     string `json:"phone"`
}

// GetProfile handles getting user profile
func GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.MethodNotAllowed(w, r)
		return
	}

	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		response.Unauthorized(w, r, "Authentication required")
		return
	}

	// Fetch full user data from database
	var userData models.User
	if err := database.GetDB().Where("id = ?", user.UserID).First(&userData).Error; err != nil {
		response.InternalServerError(w, r, "Failed to fetch user profile")
		return
	}

	profile := map[string]interface{}{
		"id":          userData.ID.String(),
		"email":       userData.Email,
		"first_name":  userData.FirstName,
		"last_name":   userData.LastName,
		"phone":       userData.Phone,
		"role":        userData.Role,
		"is_active":   userData.IsActive,
		"is_verified": userData.IsVerified,
		"created_at":  userData.CreatedAt,
		"updated_at":  userData.UpdatedAt,
	}

	response.Success(w, r, profile, "Profile retrieved successfully")
}

// UpdateProfile handles updating user profile
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		response.MethodNotAllowed(w, r)
		return
	}

	// Get authenticated user
	user, err := middleware.GetUserFromContext(r)
	if err != nil {
		response.Unauthorized(w, r, "Authentication required")
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, r, "Invalid request body")
		return
	}

	// Update user profile in database
	updates := map[string]interface{}{}
	if req.FirstName != "" {
		updates["first_name"] = req.FirstName
	}
	if req.LastName != "" {
		updates["last_name"] = req.LastName
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}

	if len(updates) == 0 {
		response.BadRequest(w, r, "No updates provided")
		return
	}

	var userData models.User
	if err := database.GetDB().Model(&userData).Where("id = ?", user.UserID).Updates(updates).Error; err != nil {
		response.InternalServerError(w, r, "Failed to update profile")
		return
	}

	// Fetch updated user data
	if err := database.GetDB().Where("id = ?", user.UserID).First(&userData).Error; err != nil {
		response.InternalServerError(w, r, "Failed to fetch updated profile")
		return
	}

	updatedProfile := map[string]interface{}{
		"id":          userData.ID.String(),
		"email":       userData.Email,
		"first_name":  userData.FirstName,
		"last_name":   userData.LastName,
		"phone":       userData.Phone,
		"role":        userData.Role,
		"is_active":   userData.IsActive,
		"is_verified": userData.IsVerified,
		"updated_at":  userData.UpdatedAt,
	}

	response.Success(w, r, updatedProfile, "Profile updated successfully")
}
