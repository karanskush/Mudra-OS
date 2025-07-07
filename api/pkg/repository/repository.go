package repository

import (
	"api/pkg/models"

	"gorm.io/gorm"
)

// Repository provides access to the database
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new repository instance
func NewRepository(db *gorm.DB) *Repository {
	return &Repository{db: db}
}

// CreateUser creates a new user
func (r *Repository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

// GetUserByEmail retrieves a user by email
func (r *Repository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// CreateAccount creates a new account
func (r *Repository) CreateAccount(account *models.Account) error {
	return r.db.Create(account).Error
}

// GetAccountByID retrieves an account by ID
func (r *Repository) GetAccountByID(id uint) (*models.Account, error) {
	var account models.Account
	err := r.db.First(&account, id).Error
	if err != nil {
		return nil, err
	}
	return &account, nil
}

// GetAccountsByUserID retrieves all accounts for a user
func (r *Repository) GetAccountsByUserID(userID uint) ([]models.Account, error) {
	var accounts []models.Account
	err := r.db.Where("user_id = ?", userID).Find(&accounts).Error
	if err != nil {
		return nil, err
	}
	return accounts, nil
}

// CreateTransaction creates a new transaction
func (r *Repository) CreateTransaction(transaction *models.Transaction) error {
	return r.db.Create(transaction).Error
}

// GetTransactionsByAccountID retrieves all transactions for an account
func (r *Repository) GetTransactionsByAccountID(accountID uint) ([]models.Transaction, error) {
	var transactions []models.Transaction
	err := r.db.Where("account_id = ?", accountID).Find(&transactions).Error
	if err != nil {
		return nil, err
	}
	return transactions, nil
}

// CreateKYCRecord creates a new KYC record
func (r *Repository) CreateKYCRecord(record *models.KYCRecord) error {
	return r.db.Create(record).Error
}

// GetKYCRecordByUserID retrieves a KYC record by user ID
func (r *Repository) GetKYCRecordByUserID(userID uint) (*models.KYCRecord, error) {
	var record models.KYCRecord
	err := r.db.Where("user_id = ?", userID).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}
