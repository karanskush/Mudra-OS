package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"fintech-backend/internal/database"
	"fintech-backend/internal/models"
	"fintech-backend/pkg/response"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWT Secret - In production, this should be an environment variable
var jwtSecret = []byte("your-secret-key-change-this-in-production")

// UserContext represents the authenticated user context
type UserContext struct {
	UserID    uuid.UUID `json:"user_id"`
	Email     string    `json:"email"`
	FirstName string    `json:"first_name"`
	LastName  string    `json:"last_name"`
	Role      string    `json:"role"`
}

// Claims represents JWT claims
type Claims struct {
	UserID    string `json:"user_id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Role      string `json:"role"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token for a user
func GenerateToken(user *models.User) (string, time.Time, error) {
	expirationTime := time.Now().Add(24 * time.Hour) // Token expires in 24 hours

	claims := &Claims{
		UserID:    user.ID.String(),
		Email:     user.Email,
		FirstName: user.FirstName,
		LastName:  user.LastName,
		Role:      user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expirationTime, nil
}

// ValidateToken validates and parses a JWT token
func ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

// AuthMiddleware validates JWT tokens and adds user context to requests
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			response.Unauthorized(w, r, "Authorization header required")
			return
		}

		// Extract token from "Bearer <token>" format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			response.Unauthorized(w, r, "Invalid authorization header format")
			return
		}

		tokenString := tokenParts[1]

		// Validate token
		claims, err := ValidateToken(tokenString)
		if err != nil {
			response.Unauthorized(w, r, "Invalid token: "+err.Error())
			return
		}

		// Parse user ID
		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			response.Unauthorized(w, r, "Invalid user ID in token")
			return
		}

		// Verify user still exists and is active
		var user models.User
		if err := database.GetDB().Where("id = ? AND is_active = ?", userID, true).First(&user).Error; err != nil {
			response.Unauthorized(w, r, "User not found or inactive")
			return
		}

		// Create user context
		userCtx := &UserContext{
			UserID:    userID,
			Email:     claims.Email,
			FirstName: claims.FirstName,
			LastName:  claims.LastName,
			Role:      claims.Role,
		}

		// Add user context to request context
		ctx := context.WithValue(r.Context(), "user", userCtx)
		r = r.WithContext(ctx)

		// Call next handler
		next.ServeHTTP(w, r)
	})
}

// GetUserFromContext extracts user context from request
func GetUserFromContext(r *http.Request) (*UserContext, error) {
	user, ok := r.Context().Value("user").(*UserContext)
	if !ok {
		return nil, fmt.Errorf("user not found in context")
	}
	return user, nil
}

// OptionalAuthMiddleware validates JWT tokens but doesn't require them
func OptionalAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			tokenParts := strings.Split(authHeader, " ")
			if len(tokenParts) == 2 && tokenParts[0] == "Bearer" {
				tokenString := tokenParts[1]
				if claims, err := ValidateToken(tokenString); err == nil {
					if userID, err := uuid.Parse(claims.UserID); err == nil {
						var user models.User
						if err := database.GetDB().Where("id = ? AND is_active = ?", userID, true).First(&user).Error; err == nil {
							userCtx := &UserContext{
								UserID:    userID,
								Email:     claims.Email,
								FirstName: claims.FirstName,
								LastName:  claims.LastName,
								Role:      claims.Role,
							}
							ctx := context.WithValue(r.Context(), "user", userCtx)
							r = r.WithContext(ctx)
						}
					}
				}
			}
		}
		next.ServeHTTP(w, r)
	})
}
