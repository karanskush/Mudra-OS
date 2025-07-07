package middleware

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"fintech-api/pkg/database"
	"fintech-api/pkg/models"
	"fintech-api/pkg/response"

	"github.com/gin-gonic/gin"
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
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			response.Unauthorized(c, "Authorization header required")
			c.Abort()
			return
		}

		// Extract token from "Bearer <token>" format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			response.Unauthorized(c, "Invalid authorization header format")
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// Validate token
		claims, err := ValidateToken(tokenString)
		if err != nil {
			response.Unauthorized(c, "Invalid token: "+err.Error())
			c.Abort()
			return
		}

		// Parse user ID
		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			response.Unauthorized(c, "Invalid user ID in token")
			c.Abort()
			return
		}

		// Verify user still exists and is active
		var user models.User
		if err := database.GetDB().Where("id = ? AND is_active = ?", userID, true).First(&user).Error; err != nil {
			response.Unauthorized(c, "User not found or inactive")
			c.Abort()
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
		c.Set("user", userCtx)

		// Call next handler
		c.Next()
	}
}

// GetUserFromContext extracts user context from request
func GetUserFromContext(c *gin.Context) (*UserContext, error) {
	user, exists := c.Get("user")
	if !exists {
		return nil, fmt.Errorf("user not found in context")
	}

	userCtx, ok := user.(*UserContext)
	if !ok {
		return nil, fmt.Errorf("user context has unexpected type")
	}
	return userCtx, nil
}

// AuthMiddlewareHTTP validates JWT tokens and adds user context to HTTP requests
func AuthMiddlewareHTTP(next http.HandlerFunc) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Extract token from "Bearer <token>" format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			http.Error(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := tokenParts[1]

		// Validate token
		claims, err := ValidateToken(tokenString)
		if err != nil {
			http.Error(w, "Invalid token: "+err.Error(), http.StatusUnauthorized)
			return
		}

		// Parse user ID
		userID, err := uuid.Parse(claims.UserID)
		if err != nil {
			http.Error(w, "Invalid user ID in token", http.StatusUnauthorized)
			return
		}

		// Verify user still exists and is active
		var user models.User
		if err := database.GetDB().Where("id = ? AND is_active = ?", userID, true).First(&user).Error; err != nil {
			http.Error(w, "User not found or inactive", http.StatusUnauthorized)
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

// GetUserFromHTTPRequest extracts user context from HTTP request
func GetUserFromHTTPRequest(r *http.Request) (*UserContext, error) {
	// Try to get user from request context first (set by AuthMiddlewareHTTP)
	if user := r.Context().Value("user"); user != nil {
		if userCtx, ok := user.(*UserContext); ok {
			return userCtx, nil
		}
	}

	// Fallback: validate token manually if not in context
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return nil, fmt.Errorf("authorization header required")
	}

	// Extract token from "Bearer <token>" format
	tokenParts := strings.Split(authHeader, " ")
	if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
		return nil, fmt.Errorf("invalid authorization header format")
	}

	tokenString := tokenParts[1]

	// Validate token
	claims, err := ValidateToken(tokenString)
	if err != nil {
		return nil, fmt.Errorf("invalid token: %v", err)
	}

	// Parse user ID
	userID, err := uuid.Parse(claims.UserID)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID in token")
	}

	// Verify user still exists and is active
	var user models.User
	if err := database.GetDB().Where("id = ? AND is_active = ?", userID, true).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found or inactive")
	}

	// Create user context
	userCtx := &UserContext{
		UserID:    userID,
		Email:     claims.Email,
		FirstName: claims.FirstName,
		LastName:  claims.LastName,
		Role:      claims.Role,
	}

	return userCtx, nil
}

// OptionalAuthMiddleware validates JWT tokens but doesn't require them
func OptionalAuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
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
							c.Set("user", userCtx)
						}
					}
				}
			}
		}
		c.Next()
	}
}
