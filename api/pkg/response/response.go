package response

import (
	"encoding/json"
	"net/http"
)

// Response represents a standard API response
type Response struct {
	Status  string      `json:"status"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
}

// JSON sends a JSON response with the given status code
func JSON(w http.ResponseWriter, statusCode int, response Response) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(response)
}

// Success sends a success response
func Success(w http.ResponseWriter, message string, data interface{}) {
	JSON(w, http.StatusOK, Response{
		Status:  "success",
		Message: message,
		Data:    data,
	})
}

// Error sends an error response
func Error(w http.ResponseWriter, statusCode int, message string) {
	JSON(w, statusCode, Response{
		Status: "error",
		Error:  message,
	})
}

// ValidationError sends a validation error response
func ValidationError(w http.ResponseWriter, message string) {
	Error(w, http.StatusBadRequest, message)
}

// NotFound sends a not found error response
func NotFound(w http.ResponseWriter, message string) {
	Error(w, http.StatusNotFound, message)
}

// Unauthorized sends an unauthorized error response
func Unauthorized(w http.ResponseWriter, message string) {
	Error(w, http.StatusUnauthorized, message)
}

// InternalError sends an internal server error response
func InternalError(w http.ResponseWriter, message string) {
	Error(w, http.StatusInternalServerError, message)
}
