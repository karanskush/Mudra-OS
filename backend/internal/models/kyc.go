package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// KYCStatus represents the possible statuses of a KYC submission
type KYCStatus string

const (
	KYCStatusPending     KYCStatus = "pending"
	KYCStatusVerified    KYCStatus = "verified"
	KYCStatusRejected    KYCStatus = "rejected"
	KYCStatusUnderReview KYCStatus = "under_review"
)

// KYCPriority represents the priority level of a KYC submission
type KYCPriority string

const (
	KYCPriorityLow    KYCPriority = "low"
	KYCPriorityMedium KYCPriority = "medium"
	KYCPriorityHigh   KYCPriority = "high"
)

// StringArray type for handling arrays in PostgreSQL
type StringArray []string

func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return nil, nil
	}
	return json.Marshal(a)
}

func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = []string{}
		return nil
	}

	b, ok := value.([]byte)
	if !ok {
		return errors.New("type assertion to []byte failed")
	}

	return json.Unmarshal(b, a)
}

// KYCSubmission represents a complete KYC submission
type KYCSubmission struct {
	ID                 uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID             uuid.UUID      `json:"user_id" gorm:"type:uuid;not null;index"`
	Name               string         `json:"name" gorm:"not null"`
	Country            string         `json:"country" gorm:"not null"`
	Email              string         `json:"email" gorm:"not null"`
	Phone              string         `json:"phone"`
	Status             KYCStatus      `json:"status" gorm:"type:varchar(20);default:'pending'"`
	SubmittedAt        time.Time      `json:"submitted_at" gorm:"default:CURRENT_TIMESTAMP"`
	VerifiedAt         *time.Time     `json:"verified_at,omitempty"`
	RiskScore          int            `json:"risk_score" gorm:"default:0"`
	Notes              string         `json:"notes"`
	Avatar             string         `json:"avatar"`
	Location           string         `json:"location"`
	Amount             int64          `json:"amount"` // Amount in cents/paise
	Priority           KYCPriority    `json:"priority" gorm:"type:varchar(10);default:'low'"`
	ProcessingTime     string         `json:"processing_time"`
	LastActivity       string         `json:"last_activity"`
	VerificationMethod string         `json:"verification_method"`
	ComplianceFlags    StringArray    `json:"compliance_flags" gorm:"type:jsonb"`
	ReviewNotes        string         `json:"review_notes"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User      User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Documents []KYCDocument `json:"documents,omitempty" gorm:"foreignKey:KYCSubmissionID"`
}

// KYCDocument represents individual documents uploaded for KYC
type KYCDocument struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	KYCSubmissionID uuid.UUID      `json:"kyc_submission_id" gorm:"type:uuid;not null;index"`
	Type            string         `json:"type" gorm:"not null"` // aadhaar, pan, passport, etc.
	Status          string         `json:"status" gorm:"default:'pending'"`
	DocumentNumber  string         `json:"document_number"`
	FilePath        string         `json:"file_path"`
	UploadedAt      time.Time      `json:"uploaded_at" gorm:"default:CURRENT_TIMESTAMP"`
	VerifiedAt      *time.Time     `json:"verified_at,omitempty"`
	RejectionReason string         `json:"rejection_reason"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	KYCSubmission KYCSubmission `json:"-" gorm:"foreignKey:KYCSubmissionID"`
}

// KYCStats represents dashboard statistics
type KYCStats struct {
	TotalSubmissions      int     `json:"total_submissions"`
	Verified              int     `json:"verified"`
	Pending               int     `json:"pending"`
	Rejected              int     `json:"rejected"`
	AverageProcessingTime string  `json:"average_processing_time"`
	SuccessRate           float64 `json:"success_rate"`
	MonthlyGrowth         float64 `json:"monthly_growth"`
}

// TableName specifies the table name for KYCSubmission
func (KYCSubmission) TableName() string {
	return "kyc_submission"
}

// TableName specifies the table name for KYCDocument
func (KYCDocument) TableName() string {
	return "kyc_document"
}

// BeforeCreate will set a UUID rather than numeric ID
func (k *KYCSubmission) BeforeCreate(tx *gorm.DB) error {
	if k.ID == uuid.Nil {
		k.ID = uuid.New()
	}
	return nil
}

// BeforeCreate will set a UUID rather than numeric ID
func (k *KYCDocument) BeforeCreate(tx *gorm.DB) error {
	if k.ID == uuid.Nil {
		k.ID = uuid.New()
	}
	return nil
}

// GetFormattedAmount returns the amount in a readable format
func (k *KYCSubmission) GetFormattedAmount() string {
	// Convert from paise to rupees and format
	amount := float64(k.Amount) / 100
	return fmt.Sprintf("₹%.2f", amount)
}

// CalculateProcessingTime calculates the time taken to process the KYC
func (k *KYCSubmission) CalculateProcessingTime() string {
	if k.VerifiedAt == nil {
		return "Processing..."
	}

	duration := k.VerifiedAt.Sub(k.SubmittedAt)

	if duration.Hours() >= 24 {
		days := int(duration.Hours() / 24)
		return fmt.Sprintf("%dd %dh", days, int(duration.Hours())%24)
	} else if duration.Hours() >= 1 {
		return fmt.Sprintf("%dh %dm", int(duration.Hours()), int(duration.Minutes())%60)
	} else {
		return fmt.Sprintf("%dm %ds", int(duration.Minutes()), int(duration.Seconds())%60)
	}
}

// GetTimeAgo returns how long ago the submission was created
func (k *KYCSubmission) GetTimeAgo() string {
	duration := time.Since(k.SubmittedAt)

	if duration.Hours() >= 24 {
		days := int(duration.Hours() / 24)
		return fmt.Sprintf("%d days ago", days)
	} else if duration.Hours() >= 1 {
		return fmt.Sprintf("%d hours ago", int(duration.Hours()))
	} else {
		return fmt.Sprintf("%d minutes ago", int(duration.Minutes()))
	}
}
