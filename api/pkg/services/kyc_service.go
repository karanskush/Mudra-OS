package services

import (
	"errors"
	"fmt"
	"math/rand"
	"time"

	"fintech-api/pkg/models"
	"fintech-api/pkg/repository"

	"github.com/google/uuid"
)

type KYCService struct {
	kycRepo *repository.KYCRepository
}

func NewKYCService(kycRepo *repository.KYCRepository) *KYCService {
	return &KYCService{
		kycRepo: kycRepo,
	}
}

// CreateKYCSubmission creates a new KYC submission
func (s *KYCService) CreateKYCSubmission(req CreateKYCRequest) (*models.KYCSubmission, error) {
	// Validate required fields
	if req.UserID == uuid.Nil || req.Country == "" || req.Name == "" || req.Email == "" {
		return nil, errors.New("user_id, country, name, and email are required")
	}

	// Check if user already has a KYC submission
	existing, err := s.kycRepo.GetKYCSubmissionByUserID(req.UserID)
	if err == nil && existing != nil {
		return nil, errors.New("user already has a KYC submission")
	}

	// Create new submission
	submission := &models.KYCSubmission{
		UserID:             req.UserID,
		Name:               req.Name,
		Country:            req.Country,
		Email:              req.Email,
		Phone:              req.Phone,
		Status:             models.KYCStatusPending,
		SubmittedAt:        time.Now(),
		RiskScore:          s.calculateInitialRiskScore(req),
		Location:           req.Location,
		Amount:             req.Amount,
		Priority:           s.calculatePriority(req.Amount, req.Country),
		ProcessingTime:     "Processing...",
		LastActivity:       "Just submitted",
		VerificationMethod: "AI Processing",
		ComplianceFlags:    []string{},
		Avatar:             req.Avatar,
	}

	if err := s.kycRepo.CreateKYCSubmission(submission); err != nil {
		return nil, fmt.Errorf("failed to create KYC submission: %w", err)
	}

	// Create required documents based on country
	documents := s.getRequiredDocuments(req.Country)
	for _, docType := range documents {
		document := &models.KYCDocument{
			KYCSubmissionID: submission.ID,
			Type:            docType,
			Status:          "pending",
			UploadedAt:      time.Now(),
		}
		s.kycRepo.CreateKYCDocument(document)
	}

	return submission, nil
}

// GetAllKYCSubmissions retrieves all KYC submissions with filtering
func (s *KYCService) GetAllKYCSubmissions(filters KYCFilters) ([]models.KYCSubmission, error) {
	filterMap := map[string]interface{}{
		"status":   filters.Status,
		"search":   filters.Search,
		"country":  filters.Country,
		"priority": filters.Priority,
	}

	submissions, err := s.kycRepo.GetAllKYCSubmissions(filterMap)
	if err != nil {
		return nil, fmt.Errorf("failed to get KYC submissions: %w", err)
	}

	// Update calculated fields
	for i := range submissions {
		submissions[i].ProcessingTime = submissions[i].CalculateProcessingTime()
		submissions[i].LastActivity = submissions[i].GetTimeAgo()
	}

	return submissions, nil
}

// GetKYCSubmissionByID retrieves a single KYC submission
func (s *KYCService) GetKYCSubmissionByID(id uuid.UUID) (*models.KYCSubmission, error) {
	submission, err := s.kycRepo.GetKYCSubmissionByID(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get KYC submission: %w", err)
	}

	submission.ProcessingTime = submission.CalculateProcessingTime()
	submission.LastActivity = submission.GetTimeAgo()

	return submission, nil
}

// UpdateKYCStatus updates the status of a KYC submission
func (s *KYCService) UpdateKYCStatus(id uuid.UUID, status string, notes string) error {
	// Validate status
	var kycStatus models.KYCStatus
	switch status {
	case "pending":
		kycStatus = models.KYCStatusPending
	case "verified":
		kycStatus = models.KYCStatusVerified
	case "rejected":
		kycStatus = models.KYCStatusRejected
	case "under_review":
		kycStatus = models.KYCStatusUnderReview
	default:
		return errors.New("invalid status")
	}

	// Get current submission
	submission, err := s.kycRepo.GetKYCSubmissionByID(id)
	if err != nil {
		return fmt.Errorf("submission not found: %w", err)
	}

	// Update status
	if err := s.kycRepo.UpdateKYCStatus(id, kycStatus); err != nil {
		return fmt.Errorf("failed to update status: %w", err)
	}

	// Update notes if provided
	if notes != "" {
		submission.ReviewNotes = notes
		s.kycRepo.UpdateKYCSubmission(submission)
	}

	return nil
}

// VerifyDocument handles document verification
func (s *KYCService) VerifyDocument(req DocumentVerificationRequest) (*DocumentVerificationResponse, error) {
	// Simulate document verification logic
	response := &DocumentVerificationResponse{
		Status:    "success",
		Valid:     true,
		Timestamp: time.Now(),
	}

	// Mock verification based on document type
	switch req.DocumentType {
	case "aadhaar":
		if !s.validateAadhaarNumber(req.DocumentNumber) {
			response.Status = "error"
			response.Valid = false
			response.Details = map[string]interface{}{
				"error": "Invalid Aadhaar number format",
			}
		} else {
			response.Details = map[string]interface{}{
				"name":    "Verified User",
				"address": "Verified Address",
				"dob":     "1990-01-01",
			}
		}
	case "pan":
		if !s.validatePANNumber(req.DocumentNumber) {
			response.Status = "error"
			response.Valid = false
			response.Details = map[string]interface{}{
				"error": "Invalid PAN number format",
			}
		} else {
			response.Details = map[string]interface{}{
				"name":       "Verified User",
				"pan_number": req.DocumentNumber,
				"status":     "active",
			}
		}
	default:
		response.Status = "error"
		response.Valid = false
		response.Details = map[string]interface{}{
			"error": "Unsupported document type",
		}
	}

	return response, nil
}

// GetKYCStats returns dashboard statistics
func (s *KYCService) GetKYCStats() (*models.KYCStats, error) {
	return s.kycRepo.GetKYCStats()
}

// GetRecentActivity returns recent KYC activity
func (s *KYCService) GetRecentActivity(limit int) ([]models.KYCSubmission, error) {
	submissions, err := s.kycRepo.GetRecentKYCActivity(limit)
	if err != nil {
		return nil, err
	}

	// Update calculated fields
	for i := range submissions {
		submissions[i].ProcessingTime = submissions[i].CalculateProcessingTime()
		submissions[i].LastActivity = submissions[i].GetTimeAgo()
	}

	return submissions, nil
}

// BulkUpdateStatus updates multiple submissions
func (s *KYCService) BulkUpdateStatus(ids []uuid.UUID, status string) error {
	var kycStatus models.KYCStatus
	switch status {
	case "pending":
		kycStatus = models.KYCStatusPending
	case "verified":
		kycStatus = models.KYCStatusVerified
	case "rejected":
		kycStatus = models.KYCStatusRejected
	case "under_review":
		kycStatus = models.KYCStatusUnderReview
	default:
		return errors.New("invalid status")
	}

	return s.kycRepo.BulkUpdateStatus(ids, kycStatus)
}

// Helper functions

func (s *KYCService) calculateInitialRiskScore(req CreateKYCRequest) int {
	score := 0

	// Base score
	score += rand.Intn(20) + 10

	// Higher amounts increase risk score
	if req.Amount > 500000 { // 5 lakh+
		score += 20
	} else if req.Amount > 100000 { // 1 lakh+
		score += 10
	}

	// Country-based risk (can be customized)
	switch req.Country {
	case "IN":
		score += 5
	default:
		score += 15
	}

	if score > 100 {
		score = 100
	}

	return score
}

func (s *KYCService) calculatePriority(amount int64, country string) models.KYCPriority {
	if amount > 500000 { // 5 lakh+
		return models.KYCPriorityHigh
	} else if amount > 100000 { // 1 lakh+
		return models.KYCPriorityMedium
	}
	return models.KYCPriorityLow
}

func (s *KYCService) getRequiredDocuments(country string) []string {
	switch country {
	case "IN":
		return []string{"aadhaar", "pan"}
	case "US":
		return []string{"ssn", "drivers_license"}
	case "UK":
		return []string{"passport", "national_insurance"}
	default:
		return []string{"passport"}
	}
}

func (s *KYCService) validateAadhaarNumber(number string) bool {
	// Basic Aadhaar validation - 12 digits
	if len(number) != 12 {
		return false
	}
	for _, char := range number {
		if char < '0' || char > '9' {
			return false
		}
	}
	return true
}

func (s *KYCService) validatePANNumber(number string) bool {
	// Basic PAN validation - format: ABCDE1234F
	if len(number) != 10 {
		return false
	}

	// First 5 should be letters
	for i := 0; i < 5; i++ {
		if number[i] < 'A' || number[i] > 'Z' {
			return false
		}
	}

	// Next 4 should be digits
	for i := 5; i < 9; i++ {
		if number[i] < '0' || number[i] > '9' {
			return false
		}
	}

	// Last should be a letter
	if number[9] < 'A' || number[9] > 'Z' {
		return false
	}

	return true
}

// Request/Response types

type CreateKYCRequest struct {
	UserID   uuid.UUID `json:"user_id"`
	Name     string    `json:"name"`
	Country  string    `json:"country"`
	Email    string    `json:"email"`
	Phone    string    `json:"phone"`
	Location string    `json:"location"`
	Amount   int64     `json:"amount"`
	Avatar   string    `json:"avatar"`
}

type KYCFilters struct {
	Status   string `json:"status"`
	Search   string `json:"search"`
	Country  string `json:"country"`
	Priority string `json:"priority"`
}

type DocumentVerificationRequest struct {
	DocumentType   string    `json:"document_type"`
	DocumentNumber string    `json:"document_number"`
	UserID         uuid.UUID `json:"user_id"`
	Country        string    `json:"country"`
}

type DocumentVerificationResponse struct {
	Status    string      `json:"status"`
	Valid     bool        `json:"valid"`
	Details   interface{} `json:"details,omitempty"`
	Timestamp time.Time   `json:"timestamp"`
}
