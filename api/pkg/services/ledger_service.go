package services

import (
	"api/pkg/models"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LedgerService provides ledger-related operations
type LedgerService struct {
	db *gorm.DB
}

// NewLedgerService creates a new ledger service
func NewLedgerService(db *gorm.DB) *LedgerService {
	return &LedgerService{
		db: db,
	}
}

// GetAccounts retrieves all accounts for a user
func (s *LedgerService) GetAccounts(userID uint) ([]models.Account, error) {
	var accounts []models.Account
	err := s.db.Where("user_id = ?", userID).Find(&accounts).Error
	return accounts, err
}

// GetAccount retrieves a specific account
func (s *LedgerService) GetAccount(accountID string) (*models.Account, error) {
	var account models.Account
	err := s.db.Where("uuid = ?", accountID).First(&account).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// CreateAccount creates a new account
func (s *LedgerService) CreateAccount(
	userID uint,
	accountNumber string,
	name string,
	description string,
	currency string,
	accountType models.LedgerAccountType,
	parentAccount *models.Account,
) (*models.Account, error) {
	account := &models.Account{
		UUID:          uuid.New(),
		UserID:        userID,
		AccountNumber: accountNumber,
		Name:          name,
		Description:   description,
		Type:          accountType,
		Currency:      currency,
		Status:        "active",
	}

	err := s.db.Create(account).Error
	if err != nil {
		return nil, fmt.Errorf("failed to create account: %v", err)
	}

	return account, nil
}

// GetAccountBalance retrieves the current balance of an account
func (s *LedgerService) GetAccountBalance(accountID uuid.UUID) (float64, error) {
	var account models.Account
	err := s.db.Where("uuid = ?", accountID).First(&account).Error
	if err != nil {
		return 0, err
	}
	return account.Balance, nil
}

// CreateDeposit creates a deposit transaction
func (s *LedgerService) CreateDeposit(
	userID uint,
	accountID uuid.UUID,
	amount float64,
	currency string,
	description string,
	reference string,
) (*models.Transaction, error) {
	// Start a transaction
	tx := s.db.Begin()
	if tx.Error != nil {
		return nil, tx.Error
	}
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create the transaction
	transaction := &models.Transaction{
		UUID:        uuid.New(),
		AccountID:   userID, // This should be the account's ID, not user ID
		Type:        "deposit",
		Amount:      amount,
		Currency:    currency,
		Status:      "completed",
		Reference:   reference,
		Description: description,
	}

	if err := tx.Create(transaction).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create transaction: %v", err)
	}

	// Update account balance
	if err := tx.Model(&models.Account{}).Where("uuid = ?", accountID).
		UpdateColumn("balance", gorm.Expr("balance + ?", amount)).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update account balance: %v", err)
	}

	// Commit the transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %v", err)
	}

	return transaction, nil
}
