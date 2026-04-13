package models

import (
	"errors"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LedgerTransactionType represents the type of ledger transaction
type LedgerTransactionType string

const (
	LedgerTransactionTypeTransfer   LedgerTransactionType = "transfer"
	LedgerTransactionTypePayment    LedgerTransactionType = "payment"
	LedgerTransactionTypeDeposit    LedgerTransactionType = "deposit"
	LedgerTransactionTypeWithdrawal LedgerTransactionType = "withdrawal"
	LedgerTransactionTypeExchange   LedgerTransactionType = "exchange"
	LedgerTransactionTypeAdjustment LedgerTransactionType = "adjustment"
	LedgerTransactionTypeFee        LedgerTransactionType = "fee"
	LedgerTransactionTypeInterest   LedgerTransactionType = "interest"
	LedgerTransactionTypeRefund     LedgerTransactionType = "refund"
)

// LedgerTransactionStatus represents the status of a ledger transaction
type LedgerTransactionStatus string

const (
	LedgerTransactionStatusPending   LedgerTransactionStatus = "pending"
	LedgerTransactionStatusPosted    LedgerTransactionStatus = "posted"
	LedgerTransactionStatusReversed  LedgerTransactionStatus = "reversed"
	LedgerTransactionStatusCancelled LedgerTransactionStatus = "cancelled"
)

// LedgerTransaction represents a complete double-entry transaction
type LedgerTransaction struct {
	ID           uuid.UUID               `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID       uuid.UUID               `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_ledger_txn_user_ref"`
	Type         LedgerTransactionType   `json:"type" gorm:"not null"`
	Status       LedgerTransactionStatus `json:"status" gorm:"default:'pending'"`
	Description  string                  `json:"description"`
	Reference    string                  `json:"reference" gorm:"uniqueIndex:idx_ledger_txn_user_ref"`
	TotalAmount  float64                 `json:"total_amount" gorm:"not null"`
	Currency     string                  `json:"currency" gorm:"not null;default:'USD'"`
	ExchangeRate float64                 `json:"exchange_rate" gorm:"default:1.0"`
	BaseCurrency string                  `json:"base_currency" gorm:"default:'USD'"`
	BaseAmount   float64                 `json:"base_amount" gorm:"default:0"`
	PostedAt     *time.Time              `json:"posted_at"`
	Timestamp    time.Time               `json:"timestamp" gorm:"not null"`
	CreatedAt    time.Time               `json:"created_at"`
	UpdatedAt    time.Time               `json:"updated_at"`
	DeletedAt    gorm.DeletedAt          `json:"-" gorm:"index"`

	// Relationships (pointer so omitempty works for unloaded associations)
	User    *User         `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Entries []LedgerEntry `json:"entries,omitempty" gorm:"foreignKey:TransactionID"`
}

// TableName specifies the table name for LedgerTransaction
func (LedgerTransaction) TableName() string {
	return "ledger_transaction"
}

// BeforeCreate will set a UUID rather than numeric ID
func (lt *LedgerTransaction) BeforeCreate(tx *gorm.DB) error {
	if lt.ID == uuid.Nil {
		lt.ID = uuid.New()
	}
	if lt.Timestamp.IsZero() {
		lt.Timestamp = time.Now()
	}
	return nil
}

// IsPosted returns true if the transaction is posted
func (lt *LedgerTransaction) IsPosted() bool {
	return lt.Status == LedgerTransactionStatusPosted
}

// IsPending returns true if the transaction is pending
func (lt *LedgerTransaction) IsPending() bool {
	return lt.Status == LedgerTransactionStatusPending
}

// MarkPosted marks the transaction as posted
func (lt *LedgerTransaction) MarkPosted() {
	lt.Status = LedgerTransactionStatusPosted
	now := time.Now()
	lt.PostedAt = &now
}

// MarkReversed marks the transaction as reversed
func (lt *LedgerTransaction) MarkReversed() {
	lt.Status = LedgerTransactionStatusReversed
}

// ValidateBalance ensures that debits equal credits
func (lt *LedgerTransaction) ValidateBalance() error {
	var totalDebits, totalCredits float64

	for _, entry := range lt.Entries {
		if entry.IsDebit() {
			totalDebits += entry.Amount
		} else {
			totalCredits += entry.Amount
		}
	}

	if totalDebits != totalCredits {
		return errors.New("transaction is not balanced: debits must equal credits")
	}

	return nil
}

// GetTotalDebits returns the total debit amount
func (lt *LedgerTransaction) GetTotalDebits() float64 {
	var total float64
	for _, entry := range lt.Entries {
		if entry.IsDebit() {
			total += entry.Amount
		}
	}
	return total
}

// GetTotalCredits returns the total credit amount
func (lt *LedgerTransaction) GetTotalCredits() float64 {
	var total float64
	for _, entry := range lt.Entries {
		if entry.IsCredit() {
			total += entry.Amount
		}
	}
	return total
}

// AddEntry adds a new entry to the transaction
func (lt *LedgerTransaction) AddEntry(entry LedgerEntry) {
	entry.TransactionID = lt.ID
	lt.Entries = append(lt.Entries, entry)
}

// CreateReversal creates a reversal transaction
func (lt *LedgerTransaction) CreateReversal(userID uuid.UUID, description string) *LedgerTransaction {
	reversal := &LedgerTransaction{
		UserID:       userID,
		Type:         lt.Type,
		Status:       LedgerTransactionStatusPending,
		Description:  description,
		Reference:    lt.Reference + "-REV",
		TotalAmount:  lt.TotalAmount,
		Currency:     lt.Currency,
		ExchangeRate: lt.ExchangeRate,
		BaseCurrency: lt.BaseCurrency,
		BaseAmount:   lt.BaseAmount,
		Timestamp:    time.Now(),
	}

	// Create reversed entries
	for _, entry := range lt.Entries {
		var reversedEntryType EntryType
		if entry.EntryType == EntryTypeDebit {
			reversedEntryType = EntryTypeCredit
		} else {
			reversedEntryType = EntryTypeDebit
		}

		reversedEntry := LedgerEntry{
			DebitAccountID:  entry.CreditAccountID, // Swap accounts
			CreditAccountID: entry.DebitAccountID,  // Swap accounts
			Amount:          entry.Amount,
			Currency:        entry.Currency,
			EntryType:       reversedEntryType,
			Description:     "Reversal: " + entry.Description,
			Reference:       entry.Reference + "-REV",
			ExchangeRate:    entry.ExchangeRate,
			BaseCurrency:    entry.BaseCurrency,
			BaseAmount:      entry.BaseAmount,
			Timestamp:       time.Now(),
		}
		reversal.AddEntry(reversedEntry)
	}

	return reversal
}
