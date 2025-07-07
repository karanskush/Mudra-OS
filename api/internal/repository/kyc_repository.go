package repository

import (
	"fmt"
	"time"

	"fintech-api/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type KYCRepository struct {
	db *gorm.DB
}

func NewKYCRepository(db *gorm.DB) *KYCRepository {
	return &KYCRepository{db: db}
}

// CreateKYCSubmission creates a new KYC submission
func (r *KYCRepository) CreateKYCSubmission(submission *models.KYCSubmission) error {
	return r.db.Create(submission).Error
}

// GetKYCSubmissionByID retrieves a KYC submission by ID with documents
func (r *KYCRepository) GetKYCSubmissionByID(id uuid.UUID) (*models.KYCSubmission, error) {
	var submission models.KYCSubmission
	err := r.db.Preload("Documents").Preload("User").First(&submission, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &submission, nil
}

// GetKYCSubmissionByUserID retrieves a KYC submission by user ID
func (r *KYCRepository) GetKYCSubmissionByUserID(userID uuid.UUID) (*models.KYCSubmission, error) {
	var submission models.KYCSubmission
	err := r.db.Preload("Documents").Preload("User").First(&submission, "user_id = ?", userID).Error
	if err != nil {
		return nil, err
	}
	return &submission, nil
}

// GetAllKYCSubmissions retrieves all KYC submissions with optional filtering
func (r *KYCRepository) GetAllKYCSubmissions(filters map[string]interface{}) ([]models.KYCSubmission, error) {
	var submissions []models.KYCSubmission
	query := r.db.Preload("Documents").Preload("User")

	// Apply filters
	if status, ok := filters["status"].(string); ok && status != "" && status != "all" {
		query = query.Where("status = ?", status)
	}

	if search, ok := filters["search"].(string); ok && search != "" {
		searchTerm := "%" + search + "%"
		query = query.Where(
			"name ILIKE ? OR email ILIKE ? OR location ILIKE ?",
			searchTerm, searchTerm, searchTerm,
		)
	}

	if country, ok := filters["country"].(string); ok && country != "" {
		query = query.Where("country = ?", country)
	}

	if priority, ok := filters["priority"].(string); ok && priority != "" {
		query = query.Where("priority = ?", priority)
	}

	// Order by created_at desc
	err := query.Order("created_at DESC").Find(&submissions).Error
	return submissions, err
}

// UpdateKYCSubmission updates a KYC submission
func (r *KYCRepository) UpdateKYCSubmission(submission *models.KYCSubmission) error {
	return r.db.Save(submission).Error
}

// UpdateKYCStatus updates only the status of a KYC submission
func (r *KYCRepository) UpdateKYCStatus(id uuid.UUID, status models.KYCStatus) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}

	if status == models.KYCStatusVerified {
		updates["verified_at"] = time.Now()
	}

	return r.db.Model(&models.KYCSubmission{}).Where("id = ?", id).Updates(updates).Error
}

// DeleteKYCSubmission soft deletes a KYC submission
func (r *KYCRepository) DeleteKYCSubmission(id uuid.UUID) error {
	return r.db.Delete(&models.KYCSubmission{}, "id = ?", id).Error
}

// CreateKYCDocument creates a new KYC document
func (r *KYCRepository) CreateKYCDocument(document *models.KYCDocument) error {
	return r.db.Create(document).Error
}

// UpdateKYCDocument updates a KYC document
func (r *KYCRepository) UpdateKYCDocument(document *models.KYCDocument) error {
	return r.db.Save(document).Error
}

// GetKYCDocumentsBySubmissionID retrieves all documents for a submission
func (r *KYCRepository) GetKYCDocumentsBySubmissionID(submissionID uuid.UUID) ([]models.KYCDocument, error) {
	var documents []models.KYCDocument
	err := r.db.Where("kyc_submission_id = ?", submissionID).Find(&documents).Error
	return documents, err
}

// GetKYCStats calculates and returns KYC dashboard statistics
func (r *KYCRepository) GetKYCStats() (*models.KYCStats, error) {
	stats := &models.KYCStats{}

	// Get total submissions
	var totalSubmissions int64
	if err := r.db.Model(&models.KYCSubmission{}).Count(&totalSubmissions).Error; err != nil {
		return nil, err
	}
	stats.TotalSubmissions = int(totalSubmissions)

	// Get counts by status
	var verifiedCount, pendingCount, rejectedCount int64

	r.db.Model(&models.KYCSubmission{}).Where("status = ?", models.KYCStatusVerified).Count(&verifiedCount)
	r.db.Model(&models.KYCSubmission{}).Where("status IN ?", []models.KYCStatus{models.KYCStatusPending, models.KYCStatusUnderReview}).Count(&pendingCount)
	r.db.Model(&models.KYCSubmission{}).Where("status = ?", models.KYCStatusRejected).Count(&rejectedCount)

	stats.Verified = int(verifiedCount)
	stats.Pending = int(pendingCount)
	stats.Rejected = int(rejectedCount)

	// Calculate success rate
	if totalSubmissions > 0 {
		stats.SuccessRate = (float64(verifiedCount) / float64(totalSubmissions)) * 100
	}

	// Calculate average processing time for verified submissions
	var avgSeconds float64
	err := r.db.Model(&models.KYCSubmission{}).
		Where("status = ? AND verified_at IS NOT NULL", models.KYCStatusVerified).
		Select("AVG(EXTRACT(EPOCH FROM (verified_at - submitted_at)))").
		Scan(&avgSeconds).Error

	if err == nil && avgSeconds > 0 {
		avgHours := avgSeconds / 3600
		if avgHours < 1 {
			stats.AverageProcessingTime = fmt.Sprintf("%.1f minutes", avgSeconds/60)
		} else if avgHours < 24 {
			stats.AverageProcessingTime = fmt.Sprintf("%.1f hours", avgHours)
		} else {
			stats.AverageProcessingTime = fmt.Sprintf("%.1f days", avgHours/24)
		}
	} else {
		stats.AverageProcessingTime = "N/A"
	}

	// Calculate monthly growth (compared to previous month)
	now := time.Now()
	thisMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	lastMonth := thisMonth.AddDate(0, -1, 0)

	var thisMonthCount, lastMonthCount int64
	r.db.Model(&models.KYCSubmission{}).Where("created_at >= ?", thisMonth).Count(&thisMonthCount)
	r.db.Model(&models.KYCSubmission{}).Where("created_at >= ? AND created_at < ?", lastMonth, thisMonth).Count(&lastMonthCount)

	if lastMonthCount > 0 {
		stats.MonthlyGrowth = ((float64(thisMonthCount) - float64(lastMonthCount)) / float64(lastMonthCount)) * 100
	} else if thisMonthCount > 0 {
		stats.MonthlyGrowth = 100.0 // First month with data
	}

	return stats, nil
}

// GetRecentKYCActivity gets recent KYC activity for dashboard
func (r *KYCRepository) GetRecentKYCActivity(limit int) ([]models.KYCSubmission, error) {
	var submissions []models.KYCSubmission
	err := r.db.Preload("User").
		Order("updated_at DESC").
		Limit(limit).
		Find(&submissions).Error
	return submissions, err
}

// GetKYCSubmissionsByDateRange gets submissions within a date range
func (r *KYCRepository) GetKYCSubmissionsByDateRange(startDate, endDate time.Time) ([]models.KYCSubmission, error) {
	var submissions []models.KYCSubmission
	err := r.db.Preload("Documents").Preload("User").
		Where("created_at BETWEEN ? AND ?", startDate, endDate).
		Order("created_at DESC").
		Find(&submissions).Error
	return submissions, err
}

// GetKYCSubmissionsByRiskScore gets submissions filtered by risk score range
func (r *KYCRepository) GetKYCSubmissionsByRiskScore(minScore, maxScore int) ([]models.KYCSubmission, error) {
	var submissions []models.KYCSubmission
	err := r.db.Preload("Documents").Preload("User").
		Where("risk_score BETWEEN ? AND ?", minScore, maxScore).
		Order("risk_score DESC").
		Find(&submissions).Error
	return submissions, err
}

// BulkUpdateStatus updates multiple submissions with new status
func (r *KYCRepository) BulkUpdateStatus(ids []uuid.UUID, status models.KYCStatus) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}

	if status == models.KYCStatusVerified {
		updates["verified_at"] = time.Now()
	}

	return r.db.Model(&models.KYCSubmission{}).
		Where("id IN ?", ids).
		Updates(updates).Error
}
