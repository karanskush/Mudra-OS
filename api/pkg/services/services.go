package services

import (
	"api/pkg/models"
	"api/pkg/repository"
	"errors"
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// Service provides business logic operations
type Service struct {
	repo *repository.Repository
}

// NewService creates a new service instance
func NewService(repo *repository.Repository) *Service {
	return &Service{repo: repo}
}

// RegisterUser registers a new user
func (s *Service) RegisterUser(email, password, firstName, lastName string) (*models.User, error) {
	// Check if user already exists
	existingUser, err := s.repo.GetUserByEmail(email)
	if err == nil && existingUser != nil {
		return nil, errors.New("user already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		UUID:      uuid.New(),
		Email:     email,
		Password:  string(hashedPassword),
		FirstName: firstName,
		LastName:  lastName,
		Role:      "user",
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	return user, nil
}

// AuthenticateUser authenticates a user
func (s *Service) AuthenticateUser(email, password string) (*models.User, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	user.LastLogin = time.Now()
	return user, nil
}

// CreateAccount creates a new account for a user
func (s *Service) CreateAccount(userID uint, accountType string, currency string) (*models.Account, error) {
	// Convert string account type to LedgerAccountType
	var ledgerType models.LedgerAccountType
	switch accountType {
	case "bank":
		ledgerType = models.LedgerAccountTypeBank
	case "investment":
		ledgerType = models.LedgerAccountTypeInvestment
	case "credit":
		ledgerType = models.LedgerAccountTypeCredit
	default:
		ledgerType = models.LedgerAccountTypeBank
	}

	account := &models.Account{
		UUID:     uuid.New(),
		UserID:   userID,
		Type:     ledgerType,
		Currency: currency,
		Status:   "active",
	}

	if err := s.repo.CreateAccount(account); err != nil {
		return nil, err
	}

	return account, nil
}

// GetUserAccounts retrieves all accounts for a user
func (s *Service) GetUserAccounts(userID uint) ([]models.Account, error) {
	return s.repo.GetAccountsByUserID(userID)
}

// CreateTransaction creates a new transaction
func (s *Service) CreateTransaction(accountID uint, transactionType string, amount float64, currency string) (*models.Transaction, error) {
	account, err := s.repo.GetAccountByID(accountID)
	if err != nil {
		return nil, err
	}

	// Validate transaction
	if transactionType == "debit" && account.Balance < amount {
		return nil, errors.New("insufficient funds")
	}

	transaction := &models.Transaction{
		UUID:      uuid.New(),
		AccountID: accountID,
		Type:      transactionType,
		Amount:    amount,
		Currency:  currency,
		Status:    "completed",
	}

	if err := s.repo.CreateTransaction(transaction); err != nil {
		return nil, err
	}

	// Update account balance
	if transactionType == "debit" {
		account.Balance -= amount
	} else {
		account.Balance += amount
	}

	return transaction, nil
}

// CreateKYCRecord creates a new KYC record
func (s *Service) CreateKYCRecord(userID uint, documentType, documentNumber string, expiryDate time.Time) (*models.KYCRecord, error) {
	record := &models.KYCRecord{
		UUID:           uuid.New(),
		UserID:         userID,
		Status:         "pending",
		DocumentType:   documentType,
		DocumentNumber: documentNumber,
		ExpiryDate:     expiryDate,
	}

	if err := s.repo.CreateKYCRecord(record); err != nil {
		return nil, err
	}

	return record, nil
}
