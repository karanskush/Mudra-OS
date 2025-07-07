package repository

import (
	"api/pkg/models"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// KYCRepository handles database operations for KYC records
type KYCRepository struct {
	db *gorm.DB
}

// NewKYCRepository creates a new KYC repository
func NewKYCRepository(db *gorm.DB) *KYCRepository {
	return &KYCRepository{
		db: db,
	}
}

// CreateKYCRecord creates a new KYC record
func (r *KYCRepository) CreateKYCRecord(record *models.KYCRecord) error {
	return r.db.Create(record).Error
}

// GetKYCRecord retrieves a KYC record by ID
func (r *KYCRepository) GetKYCRecord(id uuid.UUID) (*models.KYCRecord, error) {
	var record models.KYCRecord
	err := r.db.Where("uuid = ?", id).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// GetKYCRecordByUserID retrieves a KYC record by user ID
func (r *KYCRepository) GetKYCRecordByUserID(userID uint) (*models.KYCRecord, error) {
	var record models.KYCRecord
	err := r.db.Where("user_id = ?", userID).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// UpdateKYCRecord updates a KYC record
func (r *KYCRepository) UpdateKYCRecord(record *models.KYCRecord) error {
	return r.db.Save(record).Error
}

// DeleteKYCRecord deletes a KYC record
func (r *KYCRepository) DeleteKYCRecord(id uuid.UUID) error {
	return r.db.Where("uuid = ?", id).Delete(&models.KYCRecord{}).Error
}

// ListKYCRecords retrieves all KYC records with optional filters
func (r *KYCRepository) ListKYCRecords(filters map[string]interface{}) ([]models.KYCRecord, error) {
	var records []models.KYCRecord
	query := r.db

	// Apply filters
	for key, value := range filters {
		query = query.Where(key+" = ?", value)
	}

	err := query.Find(&records).Error
	return records, err
}

// GetKYCStats retrieves KYC statistics
func (r *KYCRepository) GetKYCStats() (map[string]interface{}, error) {
	var stats struct {
		Total     int64
		Pending   int64
		Approved  int64
		Rejected  int64
		LastMonth int64
	}

	// Get total count
	r.db.Model(&models.KYCRecord{}).Count(&stats.Total)

	// Get pending count
	r.db.Model(&models.KYCRecord{}).Where("status = ?", "pending").Count(&stats.Pending)

	// Get approved count
	r.db.Model(&models.KYCRecord{}).Where("status = ?", "approved").Count(&stats.Approved)

	// Get rejected count
	r.db.Model(&models.KYCRecord{}).Where("status = ?", "rejected").Count(&stats.Rejected)

	// Get last month count
	lastMonth := time.Now().AddDate(0, -1, 0)
	r.db.Model(&models.KYCRecord{}).Where("created_at >= ?", lastMonth).Count(&stats.LastMonth)

	return map[string]interface{}{
		"total":      stats.Total,
		"pending":    stats.Pending,
		"approved":   stats.Approved,
		"rejected":   stats.Rejected,
		"last_month": stats.LastMonth,
	}, nil
}
