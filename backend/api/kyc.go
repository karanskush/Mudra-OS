package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"fintech-backend/internal/database"
	"fintech-backend/internal/models"
	"fintech-backend/internal/repository"
	"fintech-backend/internal/services"
	"fintech-backend/pkg/logger"

	"github.com/google/uuid"
)

// Global service instance (in a real app, this would be injected via DI)
var (
	kycService *services.KYCService
)

// Initialize KYC service
func init() {
	// This will be called when the package is imported
	// We'll initialize the service once the database is connected
}

// InitializeKYCService initializes the KYC service with database connection
func InitializeKYCService() {
	if database.GetDB() != nil {
		kycRepo := repository.NewKYCRepository(database.GetDB())
		kycService = services.NewKYCService(kycRepo)
		logger.Info("KYC service initialized successfully")
	}
}

// KYC data structures for API compatibility
type KYCRequest struct {
	UserID    string            `json:"user_id"`
	Country   string            `json:"country"`
	Documents map[string]string `json:"documents"`
	Step      string            `json:"step"`
	Name      string            `json:"name"`
	Email     string            `json:"email"`
	Phone     string            `json:"phone"`
	Location  string            `json:"location"`
	Amount    int64             `json:"amount"`
	Avatar    string            `json:"avatar"`
}

type DocumentVerificationRequest struct {
	DocumentType   string `json:"document_type"`
	DocumentNumber string `json:"document_number"`
	UserID         string `json:"user_id"`
	Country        string `json:"country"`
}

type DocumentVerificationResponse struct {
	Status    string      `json:"status"`
	Valid     bool        `json:"valid"`
	Details   interface{} `json:"details,omitempty"`
	Timestamp string      `json:"timestamp"`
}

type KYCStatusResponse struct {
	UserID    string                    `json:"user_id"`
	Country   string                    `json:"country"`
	Status    string                    `json:"status"`
	Progress  int                       `json:"progress"`
	Documents map[string]DocumentStatus `json:"documents"`
	NextSteps []string                  `json:"next_steps,omitempty"`
	UpdatedAt string                    `json:"updated_at"`
}

type DocumentStatus struct {
	Status     string `json:"status"`
	VerifiedAt string `json:"verified_at,omitempty"`
	Error      string `json:"error,omitempty"`
}

type CountryKYCRequirements struct {
	Country     string   `json:"country"`
	Documents   []string `json:"documents"`
	Description string   `json:"description"`
}

// Dashboard-specific structures
type DashboardRequest struct {
	Status   string `json:"status" form:"status"`
	Search   string `json:"search" form:"search"`
	Country  string `json:"country" form:"country"`
	Priority string `json:"priority" form:"priority"`
}

type UpdateStatusRequest struct {
	Status string `json:"status"`
	Notes  string `json:"notes"`
}

// KYCHandler handles all KYC-related API requests
func KYCHandler(w http.ResponseWriter, r *http.Request) {
	// Initialize service if not already done
	if kycService == nil {
		InitializeKYCService()
	}

	// Add CORS headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Parse the path
	path := strings.TrimPrefix(r.URL.Path, "/api/kyc")
	pathParts := strings.Split(strings.Trim(path, "/"), "/")

	logger.Infof("KYC Handler called with path: %s, method: %s", path, r.Method)

	switch {
	case r.Method == "GET" && (path == "" || path == "/"):
		handleGetKYCStatus(w, r)
	case r.Method == "GET" && path == "/countries":
		handleGetCountries(w, r)
	case r.Method == "POST" && path == "/start":
		handleStartKYC(w, r)
	case r.Method == "POST" && strings.HasPrefix(path, "/verify/"):
		handleDocumentVerification(w, r, pathParts)
	case r.Method == "GET" && strings.HasPrefix(path, "/status/"):
		handleGetUserKYCStatus(w, r, pathParts)
	case r.Method == "GET" && path == "/dashboard":
		handleGetDashboard(w, r)
	case r.Method == "GET" && path == "/dashboard/stats":
		handleGetDashboardStats(w, r)
	case r.Method == "PUT" && strings.HasPrefix(path, "/submissions/"):
		handleUpdateSubmissionStatus(w, r, pathParts)
	case r.Method == "POST" && path == "/submissions/bulk-update":
		handleBulkUpdateStatus(w, r)
	default:
		http.Error(w, "Not found", http.StatusNotFound)
	}
}

// handleGetCountries returns available countries and their KYC requirements
func handleGetCountries(w http.ResponseWriter, r *http.Request) {
	countries := []CountryKYCRequirements{
		{
			Country:     "IN",
			Documents:   []string{"aadhaar", "pan"},
			Description: "India - Aadhaar and PAN verification required",
		},
		{
			Country:     "US",
			Documents:   []string{"ssn", "drivers_license"},
			Description: "United States - SSN and Driver's License verification",
		},
		{
			Country:     "UK",
			Documents:   []string{"passport", "national_insurance"},
			Description: "United Kingdom - Passport and National Insurance verification",
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"countries": countries,
	})
}

// handleStartKYC initiates the KYC process for a user
func handleStartKYC(w http.ResponseWriter, r *http.Request) {
	var req KYCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.UserID == "" || req.Country == "" || req.Name == "" || req.Email == "" {
		http.Error(w, "user_id, country, name, and email are required", http.StatusBadRequest)
		return
	}

	// Parse user ID
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user_id format", http.StatusBadRequest)
		return
	}

	// Create service request
	serviceReq := services.CreateKYCRequest{
		UserID:   userID,
		Name:     req.Name,
		Country:  req.Country,
		Email:    req.Email,
		Phone:    req.Phone,
		Location: req.Location,
		Amount:   req.Amount,
		Avatar:   req.Avatar,
	}

	submission, err := kycService.CreateKYCSubmission(serviceReq)
	if err != nil {
		logger.Errorf("Failed to create KYC submission: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Convert to API response format
	response := KYCStatusResponse{
		UserID:    submission.UserID.String(),
		Country:   submission.Country,
		Status:    string(submission.Status),
		Progress:  0,
		Documents: make(map[string]DocumentStatus),
		NextSteps: getNextStepsForCountry(submission.Country),
		UpdatedAt: submission.UpdatedAt.Format(time.RFC3339),
	}

	// Add document statuses
	for _, doc := range submission.Documents {
		verifiedAt := ""
		if doc.VerifiedAt != nil {
			verifiedAt = doc.VerifiedAt.Format(time.RFC3339)
		}
		response.Documents[doc.Type] = DocumentStatus{
			Status:     doc.Status,
			VerifiedAt: verifiedAt,
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    response,
	})
}

// handleDocumentVerification handles document verification requests
func handleDocumentVerification(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 2 {
		http.Error(w, "Document type required", http.StatusBadRequest)
		return
	}

	documentType := pathParts[1]

	var req DocumentVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	req.DocumentType = documentType

	// Parse user ID
	userID, err := uuid.Parse(req.UserID)
	if err != nil {
		http.Error(w, "Invalid user_id format", http.StatusBadRequest)
		return
	}

	// Create service request
	serviceReq := services.DocumentVerificationRequest{
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		UserID:         userID,
		Country:        req.Country,
	}

	response, err := kycService.VerifyDocument(serviceReq)
	if err != nil {
		logger.Errorf("Document verification failed: %v", err)
		http.Error(w, "Document verification failed", http.StatusInternalServerError)
		return
	}

	// Convert to API response format
	apiResponse := DocumentVerificationResponse{
		Status:    response.Status,
		Valid:     response.Valid,
		Details:   response.Details,
		Timestamp: response.Timestamp.Format(time.RFC3339),
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    apiResponse,
	})
}

// handleGetDashboard returns all KYC submissions for dashboard
func handleGetDashboard(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	filters := services.KYCFilters{
		Status:   r.URL.Query().Get("status"),
		Search:   r.URL.Query().Get("search"),
		Country:  r.URL.Query().Get("country"),
		Priority: r.URL.Query().Get("priority"),
	}

	submissions, err := kycService.GetAllKYCSubmissions(filters)
	if err != nil {
		logger.Errorf("Failed to get KYC submissions: %v", err)
		http.Error(w, "Failed to get submissions", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    submissions,
	})
}

// handleGetDashboardStats returns dashboard statistics
func handleGetDashboardStats(w http.ResponseWriter, r *http.Request) {
	stats, err := kycService.GetKYCStats()
	if err != nil {
		logger.Errorf("Failed to get KYC stats: %v", err)
		http.Error(w, "Failed to get statistics", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    stats,
	})
}

// handleUpdateSubmissionStatus updates the status of a KYC submission
func handleUpdateSubmissionStatus(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 2 {
		http.Error(w, "Submission ID required", http.StatusBadRequest)
		return
	}

	submissionID, err := uuid.Parse(pathParts[1])
	if err != nil {
		http.Error(w, "Invalid submission ID", http.StatusBadRequest)
		return
	}

	var req UpdateStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err = kycService.UpdateKYCStatus(submissionID, req.Status, req.Notes)
	if err != nil {
		logger.Errorf("Failed to update KYC status: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Status updated successfully",
	})
}

// handleBulkUpdateStatus updates multiple submissions
func handleBulkUpdateStatus(w http.ResponseWriter, r *http.Request) {
	var req struct {
		IDs    []string `json:"ids"`
		Status string   `json:"status"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Parse UUIDs
	var ids []uuid.UUID
	for _, idStr := range req.IDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			http.Error(w, "Invalid submission ID: "+idStr, http.StatusBadRequest)
			return
		}
		ids = append(ids, id)
	}

	err := kycService.BulkUpdateStatus(ids, req.Status)
	if err != nil {
		logger.Errorf("Failed to bulk update KYC status: %v", err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Bulk status update completed",
	})
}

// handleGetKYCStatus returns general KYC status (legacy endpoint)
func handleGetKYCStatus(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "KYC service is running",
		"version": "v2.0-database",
	})
}

// handleGetUserKYCStatus returns specific user's KYC status
func handleGetUserKYCStatus(w http.ResponseWriter, r *http.Request, pathParts []string) {
	if len(pathParts) < 2 {
		http.Error(w, "User ID required", http.StatusBadRequest)
		return
	}

	userID, err := uuid.Parse(pathParts[1])
	if err != nil {
		http.Error(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	submission, err := kycService.GetKYCSubmissionByID(userID)
	if err != nil {
		http.Error(w, "KYC submission not found", http.StatusNotFound)
		return
	}

	// Convert to API response format
	response := KYCStatusResponse{
		UserID:    submission.UserID.String(),
		Country:   submission.Country,
		Status:    string(submission.Status),
		Progress:  calculateProgress(submission),
		Documents: make(map[string]DocumentStatus),
		NextSteps: getNextStepsForCountry(submission.Country),
		UpdatedAt: submission.UpdatedAt.Format(time.RFC3339),
	}

	// Add document statuses
	for _, doc := range submission.Documents {
		verifiedAt := ""
		if doc.VerifiedAt != nil {
			verifiedAt = doc.VerifiedAt.Format(time.RFC3339)
		}
		response.Documents[doc.Type] = DocumentStatus{
			Status:     doc.Status,
			VerifiedAt: verifiedAt,
		}
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    response,
	})
}

// Helper functions

func getNextStepsForCountry(country string) []string {
	switch country {
	case "IN":
		return []string{"Upload Aadhaar", "Upload PAN", "Verify identity"}
	case "US":
		return []string{"Upload SSN", "Upload Driver's License", "Verify identity"}
	case "UK":
		return []string{"Upload Passport", "Upload National Insurance", "Verify identity"}
	default:
		return []string{"Upload required documents", "Complete verification"}
	}
}

func calculateProgress(submission *models.KYCSubmission) int {
	if submission.Status == models.KYCStatusVerified {
		return 100
	}
	if submission.Status == models.KYCStatusRejected {
		return 0
	}

	totalDocs := len(submission.Documents)
	if totalDocs == 0 {
		return 0
	}

	verifiedDocs := 0
	for _, doc := range submission.Documents {
		if doc.Status == "verified" {
			verifiedDocs++
		}
	}

	return (verifiedDocs * 100) / totalDocs
}
