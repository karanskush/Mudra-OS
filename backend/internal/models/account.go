package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AccountType represents the type of account
type AccountType string

const (
	AccountTypeSavings   AccountType = "savings"
	AccountTypeChecking  AccountType = "checking"
	AccountTypeInvestment AccountType = "investment"
	AccountTypeCredit    AccountType = "credit"
)

// AccountStatus represents the status of an account
type AccountStatus string

const (
	AccountStatusActive   AccountStatus = "active"
	AccountStatusInactive AccountStatus = "inactive"
	AccountStatusSuspended AccountStatus = "suspended"
	AccountStatusClosed   AccountStatus = "closed"
)

// Account represents a financial account
type Account struct {
	ID          uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID      `json:"user_id" gorm:"type:uuid;not null"`
	AccountNumber string       `json:"account_number" gorm:"uniqueIndex;not null"`
	Type        AccountType    `json:"type" gorm:"not null"`
	Status      AccountStatus  `json:"status" gorm:"default:'active'"`
	Balance     float64        `json:"balance" gorm:"default:0"`
	Currency    string         `json:"currency" gorm:"default:'USD'"`
	Name        string         `json:"name"`
	Description string         `json:"description"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	User         User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Transactions []Transaction `json:"transactions,omitempty" gorm:"foreignKey:AccountID"`
}

// TableName specifies the table name for Account
func (Account) TableName() string {
	return "account"
}

// BeforeCreate will set a UUID rather than numeric ID
func (a *Account) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}

// IsActive returns true if the account is active
func (a *Account) IsActive() bool {
	return a.Status == AccountStatusActive
}

// CanWithdraw checks if the account has sufficient balance for withdrawal
func (a *Account) CanWithdraw(amount float64) bool {
	return a.IsActive() && a.Balance >= amount
}

// Deposit adds money to the account
func (a *Account) Deposit(amount float64) {
	a.Balance += amount
}

// Withdraw removes money from the account
func (a *Account) Withdraw(amount float64) bool {
	if a.CanWithdraw(amount) {
		a.Balance -= amount
		return true
	}
	return false
} 