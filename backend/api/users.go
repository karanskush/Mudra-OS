package api

import (
	"encoding/json"
	"net/http"

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

	// TODO: Get user from JWT token
	// For now, return mock data
	profile := map[string]interface{}{
		"id":         "mock-user-id",
		"email":      "user@example.com",
		"first_name": "John",
		"last_name":  "Doe",
		"phone":      "+1234567890",
		"role":       "user",
		"is_active":  true,
		"is_verified": true,
	}

	response.Success(w, r, profile, "Profile retrieved successfully")
}

// UpdateProfile handles updating user profile
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		response.MethodNotAllowed(w, r)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, r, "Invalid request body")
		return
	}

	// TODO: Update user profile in database
	// For now, return mock response
	updatedProfile := map[string]interface{}{
		"id":         "mock-user-id",
		"email":      "user@example.com",
		"first_name": req.FirstName,
		"last_name":  req.LastName,
		"phone":      req.Phone,
		"role":       "user",
		"is_active":  true,
		"is_verified": true,
	}

	response.Success(w, r, updatedProfile, "Profile updated successfully")
} 