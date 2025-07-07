package response

import (
	"encoding/json"
	"net/http"
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

// writeJSON writes a JSON response
func writeJSON(w http.ResponseWriter, statusCode int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// Success sends a success response
func Success(w http.ResponseWriter, r *http.Request, data interface{}, message string) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	writeJSON(w, http.StatusOK, response)
}

// Created sends a created response
func Created(w http.ResponseWriter, r *http.Request, data interface{}, message string) {
	response := Response{
		Success: true,
		Message: message,
		Data:    data,
	}
	writeJSON(w, http.StatusCreated, response)
}

// Error sends an error response
func Error(w http.ResponseWriter, r *http.Request, statusCode int, message string, err string) {
	response := Response{
		Success: false,
		Message: message,
		Error:   err,
	}
	writeJSON(w, statusCode, response)
}

// BadRequest sends a bad request response
func BadRequest(w http.ResponseWriter, r *http.Request, message string) {
	Error(w, r, http.StatusBadRequest, message, "bad_request")
}

// Unauthorized sends an unauthorized response
func Unauthorized(w http.ResponseWriter, r *http.Request, message string) {
	Error(w, r, http.StatusUnauthorized, message, "unauthorized")
}

// Forbidden sends a forbidden response
func Forbidden(w http.ResponseWriter, r *http.Request, message string) {
	Error(w, r, http.StatusForbidden, message, "forbidden")
}

// NotFound sends a not found response
func NotFound(w http.ResponseWriter, r *http.Request, message string) {
	Error(w, r, http.StatusNotFound, message, "not_found")
}

// InternalServerError sends an internal server error response
func InternalServerError(w http.ResponseWriter, r *http.Request, message string) {
	Error(w, r, http.StatusInternalServerError, message, "internal_server_error")
}

// MethodNotAllowed sends a method not allowed response
func MethodNotAllowed(w http.ResponseWriter, r *http.Request) {
	Error(w, r, http.StatusMethodNotAllowed, "Method not allowed", "method_not_allowed")
}

// ValidationError sends a validation error response
func ValidationError(w http.ResponseWriter, r *http.Request, message string, errors interface{}) {
	response := Response{
		Success: false,
		Message: message,
		Error:   "validation_error",
		Data:    errors,
	}
	writeJSON(w, http.StatusUnprocessableEntity, response)
}

// Paginated sends a paginated response
func Paginated(w http.ResponseWriter, r *http.Request, data interface{}, page, limit, total int) {
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
	writeJSON(w, http.StatusOK, response)
}

// NoContent sends a no content response
func NoContent(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
} 