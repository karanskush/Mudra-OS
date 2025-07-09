package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LedgerAccountType represents the type of account in the ledger
type LedgerAccountType string

const (
	// Asset accounts (debit balance)
	LedgerAccountTypeAsset      LedgerAccountType = "asset"
	LedgerAccountTypeCash       LedgerAccountType = "cash"
	LedgerAccountTypeBank       LedgerAccountType = "bank"
	LedgerAccountTypeReceivable LedgerAccountType = "receivable"
	LedgerAccountTypeInvestment LedgerAccountType = "investment"

	// Liability accounts (credit balance)
	LedgerAccountTypeLiability LedgerAccountType = "liability"
	LedgerAccountTypePayable   LedgerAccountType = "payable"
	LedgerAccountTypeLoan      LedgerAccountType = "loan"
	LedgerAccountTypeCredit    LedgerAccountType = "credit"

	// Equity accounts (credit balance)
	LedgerAccountTypeEquity   LedgerAccountType = "equity"
	LedgerAccountTypeCapital  LedgerAccountType = "capital"
	LedgerAccountTypeRetained LedgerAccountType = "retained_earnings"

	// Revenue accounts (credit balance)
	LedgerAccountTypeRevenue LedgerAccountType = "revenue"
	LedgerAccountTypeIncome  LedgerAccountType = "income"
	LedgerAccountTypeGain    LedgerAccountType = "gain"

	// Expense accounts (debit balance)
	LedgerAccountTypeExpense LedgerAccountType = "expense"
	LedgerAccountTypeLoss    LedgerAccountType = "loss"
	LedgerAccountTypeFee     LedgerAccountType = "fee"
)

// LedgerAccountStatus represents the status of a ledger account
type LedgerAccountStatus string

const (
	LedgerAccountStatusActive    LedgerAccountStatus = "active"
	LedgerAccountStatusInactive  LedgerAccountStatus = "inactive"
	LedgerAccountStatusSuspended LedgerAccountStatus = "suspended"
	LedgerAccountStatusClosed    LedgerAccountStatus = "closed"
)

// LedgerAccount represents an account in the double-entry ledger system
type LedgerAccount struct {
	ID            uuid.UUID           `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID        uuid.UUID           `json:"user_id" gorm:"type:uuid;not null;uniqueIndex:idx_user_account_number"`
	AccountNumber string              `json:"account_number" gorm:"not null;uniqueIndex:idx_user_account_number"`
	Type          LedgerAccountType   `json:"type" gorm:"not null"`
	Status        LedgerAccountStatus `json:"status" gorm:"default:'active'"`
	Currency      string              `json:"currency" gorm:"not null;default:'USD'"`
	Name          string              `json:"name" gorm:"not null"`
	Description   string              `json:"description"`
	ParentID      *uuid.UUID          `json:"parent_id" gorm:"type:uuid"`
	IsSystem      bool                `json:"is_system" gorm:"default:false"`
	Balance       float64             `json:"balance" gorm:"default:0"` // Cached balance for performance
	CreatedAt     time.Time           `json:"created_at"`
	UpdatedAt     time.Time           `json:"updated_at"`
	DeletedAt     gorm.DeletedAt      `json:"-" gorm:"index"`

	// Relationships
	User          User            `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Parent        *LedgerAccount  `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	Children      []LedgerAccount `json:"children,omitempty" gorm:"foreignKey:ParentID"`
	DebitEntries  []LedgerEntry   `json:"debit_entries,omitempty" gorm:"foreignKey:DebitAccountID"`
	CreditEntries []LedgerEntry   `json:"credit_entries,omitempty" gorm:"foreignKey:CreditAccountID"`
}

// TableName specifies the table name for LedgerAccount
func (LedgerAccount) TableName() string {
	return "ledger_account"
}

// BeforeCreate will set a UUID rather than numeric ID
func (la *LedgerAccount) BeforeCreate(tx *gorm.DB) error {
	if la.ID == uuid.Nil {
		la.ID = uuid.New()
	}
	return nil
}

// IsActive returns true if the account is active
func (la *LedgerAccount) IsActive() bool {
	return la.Status == LedgerAccountStatusActive
}

// IsDebitAccount returns true if this account type normally has a debit balance
func (la *LedgerAccount) IsDebitAccount() bool {
	switch la.Type {
	case LedgerAccountTypeAsset, LedgerAccountTypeCash, LedgerAccountTypeBank,
		LedgerAccountTypeReceivable, LedgerAccountTypeInvestment,
		LedgerAccountTypeExpense, LedgerAccountTypeLoss, LedgerAccountTypeFee:
		return true
	default:
		return false
	}
}

// IsCreditAccount returns true if this account type normally has a credit balance
func (la *LedgerAccount) IsCreditAccount() bool {
	switch la.Type {
	case LedgerAccountTypeLiability, LedgerAccountTypePayable, LedgerAccountTypeLoan,
		LedgerAccountTypeCredit, LedgerAccountTypeEquity, LedgerAccountTypeCapital,
		LedgerAccountTypeRetained, LedgerAccountTypeRevenue, LedgerAccountTypeIncome,
		LedgerAccountTypeGain:
		return true
	default:
		return false
	}
}

// GetBalance calculates the current balance of the account
func (la *LedgerAccount) GetBalance(db *gorm.DB) (float64, error) {
	// Return cached balance for performance
	return la.Balance, nil
}

// RecalculateBalance recalculates the balance from all entries and updates the cached value
func (la *LedgerAccount) RecalculateBalance(db *gorm.DB) error {
	var balance float64

	// Sum all debit entries
	var totalDebits float64
	if err := db.Model(&LedgerEntry{}).
		Where("debit_account_id = ?", la.ID).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalDebits).Error; err != nil {
		return err
	}

	// Sum all credit entries
	var totalCredits float64
	if err := db.Model(&LedgerEntry{}).
		Where("credit_account_id = ?", la.ID).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&totalCredits).Error; err != nil {
		return err
	}

	if la.IsDebitAccount() {
		balance = totalDebits - totalCredits
	} else {
		balance = totalCredits - totalDebits
	}

	// Update the cached balance
	la.Balance = balance
	return nil
}

// UpdateBalance updates the account balance by the given amount
func (la *LedgerAccount) UpdateBalance(amount float64) {
	if la.IsDebitAccount() {
		la.Balance += amount
	} else {
		la.Balance -= amount
	}
}
