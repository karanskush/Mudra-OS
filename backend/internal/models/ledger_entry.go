package models

import (
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// EntryType represents the type of ledger entry
type EntryType string

const (
	EntryTypeDebit  EntryType = "debit"
	EntryTypeCredit EntryType = "credit"
)

// LedgerEntry represents a single entry in the double-entry ledger system
type LedgerEntry struct {
	ID              uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	TransactionID   uuid.UUID      `json:"transaction_id" gorm:"type:uuid;not null"`
	DebitAccountID  uuid.UUID      `json:"debit_account_id" gorm:"type:uuid;not null"`
	CreditAccountID uuid.UUID      `json:"credit_account_id" gorm:"type:uuid;not null"`
	Amount          float64        `json:"amount" gorm:"not null"`
	Currency        string         `json:"currency" gorm:"not null;default:'USD'"`
	EntryType       EntryType      `json:"entry_type" gorm:"not null"`
	Description     string         `json:"description"`
	Reference       string         `json:"reference"`
	ExchangeRate    float64        `json:"exchange_rate" gorm:"default:1.0"`
	BaseCurrency    string         `json:"base_currency" gorm:"default:'USD'"`
	BaseAmount      float64        `json:"base_amount" gorm:"default:0"`
	Timestamp       time.Time      `json:"timestamp" gorm:"not null"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `json:"-" gorm:"index"`

	// Relationships
	Transaction   LedgerTransaction `json:"transaction,omitempty" gorm:"foreignKey:TransactionID"`
	DebitAccount  LedgerAccount     `json:"debit_account,omitempty" gorm:"foreignKey:DebitAccountID"`
	CreditAccount LedgerAccount     `json:"credit_account,omitempty" gorm:"foreignKey:CreditAccountID"`
}

// TableName specifies the table name for LedgerEntry
func (LedgerEntry) TableName() string {
	return "ledger_entry"
}

// BeforeCreate will set a UUID rather than numeric ID
func (le *LedgerEntry) BeforeCreate(tx *gorm.DB) error {
	fmt.Printf("BeforeCreate: LedgerEntry ID before: %s\n", le.ID)
	if le.ID == uuid.Nil {
		le.ID = uuid.New()
	}
	fmt.Printf("BeforeCreate: LedgerEntry ID after: %s\n", le.ID)
	if le.Timestamp.IsZero() {
		le.Timestamp = time.Now()
	}
	return nil
}

// IsDebit returns true if this is a debit entry
func (le *LedgerEntry) IsDebit() bool {
	return le.EntryType == EntryTypeDebit
}

// IsCredit returns true if this is a credit entry
func (le *LedgerEntry) IsCredit() bool {
	return le.EntryType == EntryTypeCredit
}

// GetAccountID returns the account ID based on the entry type
func (le *LedgerEntry) GetAccountID() uuid.UUID {
	if le.IsDebit() {
		return le.DebitAccountID
	}
	return le.CreditAccountID
}

// GetAmount returns the amount for this entry
func (le *LedgerEntry) GetAmount() float64 {
	return le.Amount
}

// GetBaseAmount returns the amount converted to base currency
func (le *LedgerEntry) GetBaseAmount() float64 {
	if le.BaseAmount > 0 {
		return le.BaseAmount
	}
	return le.Amount * le.ExchangeRate
}
