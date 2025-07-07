package services

import (
	"api/pkg/models"
	"api/pkg/repository"
	"time"

	"github.com/google/uuid"
)

// KYCService provides KYC-related operations
type KYCService struct {
	repo *repository.KYCRepository
}

// NewKYCService creates a new KYC service
func NewKYCService(repo *repository.KYCRepository) *KYCService {
	return &KYCService{
		repo: repo,
	}
}

// CreateKYCRequest represents a request to create a KYC record
type CreateKYCRequest struct {
	UserID         uint      `json:"user_id"`
	DocumentType   string    `json:"document_type"`
	DocumentNumber string    `json:"document_number"`
	ExpiryDate     time.Time `json:"expiry_date"`
}

// DocumentVerificationRequest represents a document verification request
type DocumentVerificationRequest struct {
	DocumentType   string `json:"document_type"`
	DocumentNumber string `json:"document_number"`
	Country        string `json:"country"`
}

// KYCFilters represents filters for KYC records
type KYCFilters struct {
	Status   string `json:"status"`
	Country  string `json:"country"`
	Priority string `json:"priority"`
}

// CreateKYCRecord creates a new KYC record
func (s *KYCService) CreateKYCRecord(req *CreateKYCRequest) (*models.KYCRecord, error) {
	record := &models.KYCRecord{
		UUID:           uuid.New(),
		UserID:         req.UserID,
		Status:         "pending",
		DocumentType:   req.DocumentType,
		DocumentNumber: req.DocumentNumber,
		ExpiryDate:     req.ExpiryDate,
	}

	err := s.repo.CreateKYCRecord(record)
	if err != nil {
		return nil, err
	}

	return record, nil
}

// GetKYCRecord retrieves a KYC record by ID
func (s *KYCService) GetKYCRecord(id uuid.UUID) (*models.KYCRecord, error) {
	return s.repo.GetKYCRecord(id)
}

// GetKYCRecordByUserID retrieves a KYC record by user ID
func (s *KYCService) GetKYCRecordByUserID(userID uint) (*models.KYCRecord, error) {
	return s.repo.GetKYCRecordByUserID(userID)
}

// UpdateKYCRecord updates a KYC record
func (s *KYCService) UpdateKYCRecord(record *models.KYCRecord) error {
	return s.repo.UpdateKYCRecord(record)
}

// DeleteKYCRecord deletes a KYC record
func (s *KYCService) DeleteKYCRecord(id uuid.UUID) error {
	return s.repo.DeleteKYCRecord(id)
}

// ListKYCRecords retrieves all KYC records with optional filters
func (s *KYCService) ListKYCRecords(filters *KYCFilters) ([]models.KYCRecord, error) {
	filterMap := make(map[string]interface{})
	if filters.Status != "" {
		filterMap["status"] = filters.Status
	}
	if filters.Country != "" {
		filterMap["country"] = filters.Country
	}
	if filters.Priority != "" {
		filterMap["priority"] = filters.Priority
	}
	return s.repo.ListKYCRecords(filterMap)
}

// GetKYCStats retrieves KYC statistics
func (s *KYCService) GetKYCStats() (map[string]interface{}, error) {
	return s.repo.GetKYCStats()
}

// VerifyDocument verifies a document
func (s *KYCService) VerifyDocument(req *DocumentVerificationRequest) (bool, error) {
	// In a real application, this would integrate with a third-party KYC provider
	// For now, we'll just return true
	return true, nil
}
