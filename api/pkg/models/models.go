package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LedgerAccountType represents the type of a ledger account
type LedgerAccountType string

const (
	LedgerAccountTypeBank       LedgerAccountType = "bank"
	LedgerAccountTypeInvestment LedgerAccountType = "investment"
	LedgerAccountTypeCredit     LedgerAccountType = "credit"
)

// User represents a user in the system
type User struct {
	gorm.Model
	UUID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	Email       string    `gorm:"uniqueIndex;not null"`
	Password    string    `gorm:"not null"`
	FirstName   string
	LastName    string
	Phone       string
	DateOfBirth time.Time
	Role        string `gorm:"default:'user'"`
	IsActive    bool   `gorm:"default:true"`
	IsVerified  bool   `gorm:"default:false"`
	LastLogin   time.Time
}

// Account represents a financial account
type Account struct {
	gorm.Model
	UUID          uuid.UUID         `gorm:"type:uuid;default:uuid_generate_v4()"`
	UserID        uint              `gorm:"not null"`
	AccountNumber string            `gorm:"uniqueIndex;not null"`
	Type          LedgerAccountType `gorm:"not null"`
	Name          string            `gorm:"not null"`
	Description   string
	Balance       float64 `gorm:"not null;default:0"`
	Currency      string  `gorm:"not null;default:'USD'"`
	Status        string  `gorm:"not null;default:'active'"`
	User          User    `gorm:"foreignKey:UserID"`
}

// Transaction represents a financial transaction
type Transaction struct {
	gorm.Model
	UUID        uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	AccountID   uint      `gorm:"not null"`
	Type        string    `gorm:"not null"`
	Amount      float64   `gorm:"not null"`
	Currency    string    `gorm:"not null"`
	Status      string    `gorm:"not null;default:'pending'"`
	Reference   string
	Description string
	Account     Account `gorm:"foreignKey:AccountID"`
}

// KYCRecord represents a Know Your Customer record
type KYCRecord struct {
	gorm.Model
	UUID           uuid.UUID `gorm:"type:uuid;default:uuid_generate_v4()"`
	UserID         uint      `gorm:"not null"`
	Status         string    `gorm:"not null;default:'pending'"`
	DocumentType   string
	DocumentNumber string
	ExpiryDate     time.Time
	User           User `gorm:"foreignKey:UserID"`
}
