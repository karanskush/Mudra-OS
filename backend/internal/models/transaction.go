package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// TransactionType represents the type of transaction
type TransactionType string

const (
	TransactionTypeDeposit    TransactionType = "deposit"
	TransactionTypeWithdrawal TransactionType = "withdrawal"
	TransactionTypeTransfer   TransactionType = "transfer"
	TransactionTypePayment    TransactionType = "payment"
	TransactionTypeRefund     TransactionType = "refund"
)

// TransactionStatus represents the status of a transaction
type TransactionStatus string

const (
	TransactionStatusPending   TransactionStatus = "pending"
	TransactionStatusCompleted TransactionStatus = "completed"
	TransactionStatusFailed    TransactionStatus = "failed"
	TransactionStatusCancelled TransactionStatus = "cancelled"
)

// Transaction represents a financial transaction
type Transaction struct {
	ID          uuid.UUID         `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID      uuid.UUID         `json:"user_id" gorm:"type:uuid;not null"`
	AccountID   uuid.UUID         `json:"account_id" gorm:"type:uuid;not null"`
	Type        TransactionType   `json:"type" gorm:"not null"`
	Status      TransactionStatus `json:"status" gorm:"default:'pending'"`
	Amount      float64           `json:"amount" gorm:"not null"`
	Currency    string            `json:"currency" gorm:"default:'USD'"`
	Description string            `json:"description"`
	Reference   string            `json:"reference" gorm:"uniqueIndex"`
	Fee         float64           `json:"fee" gorm:"default:0"`
	BalanceBefore float64         `json:"balance_before"`
	BalanceAfter  float64         `json:"balance_after"`
	ProcessedAt  *time.Time       `json:"processed_at"`
	CreatedAt    time.Time        `json:"created_at"`
	UpdatedAt    time.Time        `json:"updated_at"`
	DeletedAt    gorm.DeletedAt   `json:"-" gorm:"index"`

	// Relationships
	User    User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Account Account `json:"account,omitempty" gorm:"foreignKey:AccountID"`
}

// TableName specifies the table name for Transaction
func (Transaction) TableName() string {
	return "transaction"
}

// BeforeCreate will set a UUID rather than numeric ID
func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

// IsCompleted returns true if the transaction is completed
func (t *Transaction) IsCompleted() bool {
	return t.Status == TransactionStatusCompleted
}

// IsPending returns true if the transaction is pending
func (t *Transaction) IsPending() bool {
	return t.Status == TransactionStatusPending
}

// IsFailed returns true if the transaction failed
func (t *Transaction) IsFailed() bool {
	return t.Status == TransactionStatusFailed
}

// MarkCompleted marks the transaction as completed
func (t *Transaction) MarkCompleted() {
	t.Status = TransactionStatusCompleted
	now := time.Now()
	t.ProcessedAt = &now
}

// MarkFailed marks the transaction as failed
func (t *Transaction) MarkFailed() {
	t.Status = TransactionStatusFailed
}

// GetNetAmount returns the net amount after fees
func (t *Transaction) GetNetAmount() float64 {
	return t.Amount - t.Fee
}

// IsCredit returns true if this is a credit transaction (money coming in)
func (t *Transaction) IsCredit() bool {
	return t.Type == TransactionTypeDeposit || t.Type == TransactionTypeRefund
}

// IsDebit returns true if this is a debit transaction (money going out)
func (t *Transaction) IsDebit() bool {
	return t.Type == TransactionTypeWithdrawal || t.Type == TransactionTypePayment
} 