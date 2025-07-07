package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Response represents a standard API response
type Response struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// Meta represents pagination metadata
type Meta struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// Success sends a success response
func Success(c *gin.Context, data interface{}, message string) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	c.JSON(http.StatusOK, response)
}

// Created sends a created response
func Created(c *gin.Context, data interface{}, message string) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	c.JSON(http.StatusCreated, response)
}

// Error sends an error response
func Error(c *gin.Context, statusCode int, message string, err string) {
	response := Response{
		Success: false,
		Message: message,
		Error:   err,
	}
	c.JSON(statusCode, response)
}

// BadRequest sends a bad request response
func BadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message, "bad_request")
}

// Unauthorized sends an unauthorized response
func Unauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message, "unauthorized")
}

// Forbidden sends a forbidden response
func Forbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message, "forbidden")
}

// NotFound sends a not found response
func NotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message, "not_found")
}

// InternalServerError sends an internal server error response
func InternalServerError(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, message, "internal_server_error")
}

// MethodNotAllowed sends a method not allowed response
func MethodNotAllowed(c *gin.Context) {
	Error(c, http.StatusMethodNotAllowed, "Method not allowed", "method_not_allowed")
}

// ValidationError sends a validation error response
func ValidationError(c *gin.Context, message string, errors interface{}) {
	response := Response{
		Success: false,
		Message: message,
		Error:   "validation_error",
		Data:    errors,
	}
	c.JSON(http.StatusUnprocessableEntity, response)
}

// Paginated sends a paginated response
func Paginated(c *gin.Context, data interface{}, page, limit, total int) {
	totalPages := (total + limit - 1) / limit // Ceiling division

	meta := &Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	response := Response{
		Success: true,
		Data:    data,
		Meta:    meta,
	}
	c.JSON(http.StatusOK, response)
}

// NoContent sends a no content response
func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}
