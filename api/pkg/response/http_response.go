package response

import (
	"net/http"
)

// HTTPResponse represents a standard API response for HTTP handlers
type HTTPResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Meta    *Meta       `json:"meta,omitempty"`
}

// HTTPSuccess sends a success response using http.ResponseWriter
func HTTPSuccess(w http.ResponseWriter, data interface{}, message string) {
	response := HTTPResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
	WriteJSON(w, http.StatusOK, response)
}

// HTTPCreated sends a created response using http.ResponseWriter
func HTTPCreated(w http.ResponseWriter, data interface{}, message string) {
	response := HTTPResponse{
		Success: true,
		Message: message,
		Data:    data,
	}
	WriteJSON(w, http.StatusCreated, response)
}

// HTTPError sends an error response using http.ResponseWriter
func HTTPError(w http.ResponseWriter, statusCode int, message string, err string) {
	response := HTTPResponse{
		Success: false,
		Message: message,
		Error:   err,
	}
	WriteJSON(w, statusCode, response)
}

// HTTPBadRequest sends a bad request response using http.ResponseWriter
func HTTPBadRequest(w http.ResponseWriter, message string) {
	HTTPError(w, http.StatusBadRequest, message, "bad_request")
}

// HTTPUnauthorized sends an unauthorized response using http.ResponseWriter
func HTTPUnauthorized(w http.ResponseWriter, message string) {
	HTTPError(w, http.StatusUnauthorized, message, "unauthorized")
}

// HTTPForbidden sends a forbidden response using http.ResponseWriter
func HTTPForbidden(w http.ResponseWriter, message string) {
	HTTPError(w, http.StatusForbidden, message, "forbidden")
}

// HTTPNotFound sends a not found response using http.ResponseWriter
func HTTPNotFound(w http.ResponseWriter, message string) {
	HTTPError(w, http.StatusNotFound, message, "not_found")
}

// HTTPInternalServerError sends an internal server error response using http.ResponseWriter
func HTTPInternalServerError(w http.ResponseWriter, message string) {
	HTTPError(w, http.StatusInternalServerError, message, "internal_server_error")
}

// HTTPMethodNotAllowed sends a method not allowed response using http.ResponseWriter
func HTTPMethodNotAllowed(w http.ResponseWriter) {
	HTTPError(w, http.StatusMethodNotAllowed, "Method not allowed", "method_not_allowed")
}

// HTTPValidationError sends a validation error response using http.ResponseWriter
func HTTPValidationError(w http.ResponseWriter, message string, errors interface{}) {
	response := HTTPResponse{
		Success: false,
		Message: message,
		Error:   "validation_error",
		Data:    errors,
	}
	WriteJSON(w, http.StatusUnprocessableEntity, response)
}

// HTTPPaginated sends a paginated response using http.ResponseWriter
func HTTPPaginated(w http.ResponseWriter, data interface{}, page, limit, total int) {
	totalPages := (total + limit - 1) / limit // Ceiling division

	meta := &Meta{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
	}

	response := HTTPResponse{
		Success: true,
		Data:    data,
		Meta:    meta,
	}
	WriteJSON(w, http.StatusOK, response)
}

// HTTPNoContent sends a no content response using http.ResponseWriter
func HTTPNoContent(w http.ResponseWriter) {
	w.WriteHeader(http.StatusNoContent)
}
