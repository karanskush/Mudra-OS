package handler

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"fintech-api/pkg/database"
	"fintech-api/pkg/logger"
	"fintech-api/pkg/middleware"
	"fintech-api/pkg/models"
	"fintech-api/pkg/repository"
	"fintech-api/pkg/services"

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
	case r.Method == "POST" && path == "/verify/didit":
		handleDiditVerification(w, r)
	case r.Method == "GET" && path == "/status":
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
	// Get search query if provided
	searchQuery := r.URL.Query().Get("search")

	countries := getDiditSupportedCountries()

	// Filter countries based on search query
	if searchQuery != "" {
		filteredCountries := []CountryKYCRequirements{}
		searchLower := strings.ToLower(searchQuery)

		for _, country := range countries {
			if strings.Contains(strings.ToLower(country.Country), searchLower) ||
				strings.Contains(strings.ToLower(country.Description), searchLower) {
				filteredCountries = append(filteredCountries, country)
			}
		}
		countries = filteredCountries
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":   true,
		"countries": countries,
		"total":     len(countries),
	})
}

// getDiditSupportedCountries returns the comprehensive list of countries supported by Didit
func getDiditSupportedCountries() []CountryKYCRequirements {
	return []CountryKYCRequirements{
		{
			Country:     "Afghanistan",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "Afghanistan - Passport, National ID, Driver's License",
		},
		{
			Country:     "Albania",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Albania - Full document verification available",
		},
		{
			Country:     "Algeria",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "Algeria - Standard document verification",
		},
		{
			Country:     "Argentina",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "Argentina - Comprehensive ID verification",
		},
		{
			Country:     "Australia",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "Australia - Government-issued documents",
		},
		{
			Country:     "Austria",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Austria - EU standard verification",
		},
		{
			Country:     "Belgium",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Belgium - EU compliant verification",
		},
		{
			Country:     "Brazil",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "Brazil - National identity verification",
		},
		{
			Country:     "Canada",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Canada - Provincial and federal documents",
		},
		{
			Country:     "China",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "China - National ID and travel documents",
		},
		{
			Country:     "France",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "France - Carte Nationale d'Identité and more",
		},
		{
			Country:     "Germany",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Germany - Personalausweis and federal documents",
		},
		{
			Country:     "India",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "India - Aadhaar, Passport, PAN supported",
		},
		{
			Country:     "Italy",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Italy - Carta d'Identità and driving licenses",
		},
		{
			Country:     "Japan",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Japan - My Number Card and official documents",
		},
		{
			Country:     "Mexico",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "Mexico - INE and federal documents",
		},
		{
			Country:     "Netherlands",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Netherlands - Nederlandse identiteitskaart",
		},
		{
			Country:     "Nigeria",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "Nigeria - National Identity Management",
		},
		{
			Country:     "Poland",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Poland - Dowód osobisty and EU documents",
		},
		{
			Country:     "Portugal",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Portugal - Cartão de Cidadão verification",
		},
		{
			Country:     "Russia",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Russia - Federal passport and documents",
		},
		{
			Country:     "South Africa",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "South Africa - Smart ID Card and licenses",
		},
		{
			Country:     "Spain",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Spain - DNI and regional documents",
		},
		{
			Country:     "Sweden",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Sweden - Nationellt identitetskort",
		},
		{
			Country:     "Switzerland",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Switzerland - Federal and cantonal documents",
		},
		{
			Country:     "Turkey",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Turkey - Kimlik and official documents",
		},
		{
			Country:     "Ukraine",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "Ukraine - Passport and ID card verification",
		},
		{
			Country:     "United Arab Emirates",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "UAE - Emirates ID and federal documents",
		},
		{
			Country:     "United Kingdom",
			Documents:   []string{"passport", "idCard", "driverLicense"},
			Description: "United Kingdom - UK passport and driving licence",
		},
		{
			Country:     "United States of America",
			Documents:   []string{"passport", "idCard", "driverLicense", "residencePermit"},
			Description: "USA - State-issued IDs and federal documents",
		},
	}
}

// handleStartKYC initiates the KYC process for a user
func handleStartKYC(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromHTTPRequest(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	var req KYCRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Country == "" || req.Name == "" || req.Email == "" {
		http.Error(w, "country, name, and email are required", http.StatusBadRequest)
		return
	}

	// Create service request
	serviceReq := services.CreateKYCRequest{
		UserID:   user.UserID,
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
	// Get authenticated user
	user, err := middleware.GetUserFromHTTPRequest(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

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

	// Create service request
	serviceReq := services.DocumentVerificationRequest{
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		UserID:         user.UserID,
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

// handleGetUserKYCStatus returns authenticated user's KYC status
func handleGetUserKYCStatus(w http.ResponseWriter, r *http.Request, pathParts []string) {
	// Get authenticated user
	user, err := middleware.GetUserFromHTTPRequest(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	submission, err := kycService.GetKYCSubmissionByID(user.UserID)
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

// handleDiditVerification handles document verification through Didit API
func handleDiditVerification(w http.ResponseWriter, r *http.Request) {
	// Get authenticated user
	user, err := middleware.GetUserFromHTTPRequest(r)
	if err != nil {
		http.Error(w, "Authentication required", http.StatusUnauthorized)
		return
	}

	var req struct {
		DocumentImage string `json:"document_image"`
		DocumentType  string `json:"document_type"`
		CountryCode   string `json:"country_code"`
		FaceImage     string `json:"face_image,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.DocumentImage == "" || req.DocumentType == "" || req.CountryCode == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// Here you would integrate with the actual Didit API
	// For now, we'll return a mock successful response
	response := map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"verification_id": "didit_" + user.UserID.String() + "_" + req.DocumentType,
			"status":          "verified",
			"document_verification": map[string]interface{}{
				"document_type": req.DocumentType,
				"status":        "verified",
				"extracted_data": map[string]interface{}{
					"full_name":       "John Doe",
					"date_of_birth":   "1990-01-01",
					"document_number": "123456789",
					"nationality":     req.CountryCode,
				},
				"verification_checks": map[string]interface{}{
					"document_authenticity": true,
					"data_consistency":      true,
					"image_quality":         true,
					"document_liveness":     true,
				},
			},
			"risk_assessment": map[string]interface{}{
				"overall_score": 95,
				"risk_level":    "low",
				"flags":         []string{},
			},
			"processing_time_ms": 1200,
		},
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
