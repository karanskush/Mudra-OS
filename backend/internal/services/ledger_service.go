package services

import (
	"errors"
	"fmt"
	"log"
	"math/rand"
	"time"

	"fintech-backend/internal/models"
	"fintech-backend/internal/services/paymentrails"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// LedgerService handles double-entry accounting operations
type LedgerService struct {
	db *gorm.DB
}

// NewLedgerService creates a new ledger service
func NewLedgerService(db *gorm.DB) *LedgerService {
	return &LedgerService{db: db}
}

// generateUniqueReference generates a unique reference number for transactions
func (ls *LedgerService) generateUniqueReference() string {
	// Generate a timestamp-based reference with random suffix
	timestamp := time.Now().Format("20060102150405")
	randomSuffix := rand.Intn(9999) + 1000 // 4-digit random number
	return fmt.Sprintf("TXN%s%d", timestamp, randomSuffix)
}

// CreateAccount creates a new ledger account
func (ls *LedgerService) CreateAccount(userID uuid.UUID, accountNumber, name, description, currency string, accountType models.LedgerAccountType, parentID *uuid.UUID) (*models.LedgerAccount, error) {
	account := &models.LedgerAccount{
		UserID:        userID,
		AccountNumber: accountNumber,
		Type:          accountType,
		Currency:      currency,
		Name:          name,
		Description:   description,
		ParentID:      parentID,
		Status:        models.LedgerAccountStatusActive,
	}

	if err := ls.db.Create(account).Error; err != nil {
		return nil, fmt.Errorf("failed to create account: %w", err)
	}

	return account, nil
}

// CreateTransaction creates a new ledger transaction with entries
func (ls *LedgerService) CreateTransaction(userID uuid.UUID, transactionType models.LedgerTransactionType, description, reference string, entries []models.LedgerEntry) (*models.LedgerTransaction, error) {
	// Generate unique reference if not provided
	if reference == "" {
		reference = ls.generateUniqueReference()
	}

	// Calculate total amount - in double-entry accounting, we only count debits to avoid doubling
	var totalAmount float64
	for _, entry := range entries {
		if entry.EntryType == models.EntryTypeDebit {
			totalAmount += entry.Amount
		}
	}

	transaction := &models.LedgerTransaction{
		UserID:      userID,
		Type:        transactionType,
		Status:      models.LedgerTransactionStatusPending,
		Description: description,
		Reference:   reference,
		TotalAmount: totalAmount,
		Currency:    "USD", // Default currency, can be enhanced
		Timestamp:   time.Now(),
		Entries:     entries,
	}

	// Validate transaction balance
	if err := transaction.ValidateBalance(); err != nil {
		return nil, fmt.Errorf("transaction validation failed: %w", err)
	}

	// Validate accounts exist and are active
	if err := ls.validateAccounts(entries); err != nil {
		return nil, fmt.Errorf("account validation failed: %w", err)
	}

	// Create transaction and entries in a transaction
	err := ls.db.Transaction(func(tx *gorm.DB) error {
		// Create the transaction
		if err := tx.Create(transaction).Error; err != nil {
			return err
		}

		// Create all entries
		for i := range transaction.Entries {
			transaction.Entries[i].TransactionID = transaction.ID
			transaction.Entries[i].ID = uuid.Nil // Ensure a new UUID is generated
			if err := tx.Create(&transaction.Entries[i]).Error; err != nil {
				return err
			}
		}

		// Update account balances
		if err := ls.updateAccountBalances(tx, entries); err != nil {
			return fmt.Errorf("failed to update account balances: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// PostTransaction posts a transaction to the ledger
func (ls *LedgerService) PostTransaction(transactionID uuid.UUID) error {
	var transaction models.LedgerTransaction
	if err := ls.db.Preload("Entries").Where("id = ?", transactionID).First(&transaction).Error; err != nil {
		return fmt.Errorf("transaction not found: %w", err)
	}

	if transaction.IsPosted() {
		return errors.New("transaction already posted")
	}

	// Mark transaction as posted
	transaction.MarkPosted()

	// Update transaction status
	if err := ls.db.Save(&transaction).Error; err != nil {
		return fmt.Errorf("failed to post transaction: %w", err)
	}

	return nil
}

// GetAccountBalance returns the current balance of an account
func (ls *LedgerService) GetAccountBalance(accountID uuid.UUID) (float64, error) {
	var account models.LedgerAccount
	if err := ls.db.Where("id = ?", accountID).First(&account).Error; err != nil {
		return 0, fmt.Errorf("account not found: %w", err)
	}

	return account.GetBalance(ls.db)
}

// GetAccountBalancesBatch returns balances for multiple accounts in a single optimized query
func (ls *LedgerService) GetAccountBalancesBatch(accounts []models.LedgerAccount) (map[uuid.UUID]float64, error) {
	if len(accounts) == 0 {
		return make(map[uuid.UUID]float64), nil
	}

	// Extract account IDs
	accountIDs := make([]uuid.UUID, len(accounts))
	accountMap := make(map[uuid.UUID]models.LedgerAccount)
	for i, account := range accounts {
		accountIDs[i] = account.ID
		accountMap[account.ID] = account
	}

	// Get all debit amounts in a single query
	var debitResults []struct {
		AccountID uuid.UUID `json:"account_id"`
		Total     float64   `json:"total"`
	}
	if err := ls.db.Model(&models.LedgerEntry{}).
		Select("debit_account_id as account_id, COALESCE(SUM(amount), 0) as total").
		Where("debit_account_id IN ? AND entry_type = ?", accountIDs, models.EntryTypeDebit).
		Group("debit_account_id").
		Scan(&debitResults).Error; err != nil {
		return nil, fmt.Errorf("failed to get debit totals: %w", err)
	}

	// Get all credit amounts in a single query
	var creditResults []struct {
		AccountID uuid.UUID `json:"account_id"`
		Total     float64   `json:"total"`
	}
	if err := ls.db.Model(&models.LedgerEntry{}).
		Select("credit_account_id as account_id, COALESCE(SUM(amount), 0) as total").
		Where("credit_account_id IN ? AND entry_type = ?", accountIDs, models.EntryTypeCredit).
		Group("credit_account_id").
		Scan(&creditResults).Error; err != nil {
		return nil, fmt.Errorf("failed to get credit totals: %w", err)
	}

	// Build debit and credit maps
	debitMap := make(map[uuid.UUID]float64)
	for _, result := range debitResults {
		debitMap[result.AccountID] = result.Total
	}

	creditMap := make(map[uuid.UUID]float64)
	for _, result := range creditResults {
		creditMap[result.AccountID] = result.Total
	}

	// Calculate balances
	balances := make(map[uuid.UUID]float64)
	for _, account := range accounts {
		debits := debitMap[account.ID]
		credits := creditMap[account.ID]

		if account.IsDebitAccount() {
			balances[account.ID] = debits - credits
		} else {
			balances[account.ID] = credits - debits
		}
	}

	return balances, nil
}

// GetAccounts returns all accounts for a user
func (ls *LedgerService) GetAccounts(userID uuid.UUID) ([]models.LedgerAccount, error) {
	var accounts []models.LedgerAccount
	if err := ls.db.Where("user_id = ?", userID).Find(&accounts).Error; err != nil {
		return nil, fmt.Errorf("failed to get accounts: %w", err)
	}
	return accounts, nil
}

// GetUserAccounts returns user accounts excluding system accounts
func (ls *LedgerService) GetUserAccounts(userID uuid.UUID) ([]models.LedgerAccount, error) {
	var accounts []models.LedgerAccount
	if err := ls.db.Where("user_id = ? AND is_system = ?", userID, false).Find(&accounts).Error; err != nil {
		return nil, fmt.Errorf("failed to get user accounts: %w", err)
	}
	return accounts, nil
}

// GetAccountTransactions returns all transactions for an account
func (ls *LedgerService) GetAccountTransactions(accountID uuid.UUID, limit, offset int) ([]models.LedgerTransaction, error) {
	var transactions []models.LedgerTransaction

	query := ls.db.
		Joins("JOIN ledger_entry ON ledger_transaction.id = ledger_entry.transaction_id").
		Where("ledger_entry.debit_account_id = ? OR ledger_entry.credit_account_id = ?", accountID, accountID).
		Preload("Entries").
		Preload("Entries.DebitAccount").
		Preload("Entries.CreditAccount").
		Order("ledger_transaction.timestamp DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&transactions).Error; err != nil {
		return nil, fmt.Errorf("failed to get account transactions: %w", err)
	}

	return transactions, nil
}

// CreateTransfer creates a transfer between two accounts
func (ls *LedgerService) CreateTransfer(userID uuid.UUID, fromAccountID, toAccountID uuid.UUID, amount float64, currency, description string) (map[string]interface{}, error) {
	// Validate accounts
	var fromAccount, toAccount models.LedgerAccount
	if err := ls.db.Where("id = ?", fromAccountID).First(&fromAccount).Error; err != nil {
		return nil, fmt.Errorf("from account not found: %w", err)
	}
	if err := ls.db.Where("id = ?", toAccountID).First(&toAccount).Error; err != nil {
		return nil, fmt.Errorf("to account not found: %w", err)
	}

	if !fromAccount.IsActive() || !toAccount.IsActive() {
		return nil, errors.New("one or both accounts are not active")
	}

	if fromAccount.Currency != toAccount.Currency {
		return nil, errors.New("currency conversion not yet implemented")
	}

	// Check if source account has sufficient balance
	fromBalance, err := ls.GetAccountBalance(fromAccountID)
	if err != nil {
		return nil, fmt.Errorf("failed to get source account balance: %w", err)
	}
	if fromBalance < amount {
		return nil, fmt.Errorf("insufficient balance: account has %f but trying to transfer %f", fromBalance, amount)
	}

	// Generate unique reference for this transfer
	reference := ls.generateUniqueReference()

	country := ""
	payment := paymentrails.Payment{
		FromAccount: fromAccount.AccountNumber,
		ToAccount:   toAccount.AccountNumber,
		Amount:      amount,
		Currency:    currency,
		Reference:   reference,
		Description: description,
		Country:     country,
	}
	orchestrator := paymentrails.NewOrchestrator()
	railType, _ := orchestrator.SelectRail(payment)
	var fee, fxRate float64
	var latency string
	switch railType {
	case paymentrails.RailUPI:
		fee = 5
		fxRate = 1
		latency = "1s"
	case paymentrails.RailSEPA:
		fee = 1 + 0.005*amount
		fxRate = 1 // Simulate no FX for now
		latency = "30s"
	case paymentrails.RailCrypto:
		fee = 0.001*amount + 2 // 0.1% + gas
		fxRate = 1             // Simulate no FX for now
		latency = "5s"
	default:
		fee = 2
		fxRate = 1
		latency = "60s"
	}

	err = orchestrator.Transfer(payment, &railType)
	if err != nil {
		return nil, fmt.Errorf("payment rail transfer failed: %w", err)
	}

	// Create TWO entries for proper double-entry bookkeeping
	// Transfer:
	// 1. DEBIT Destination Account (increases destination balance)
	// 2. CREDIT Source Account (decreases source balance)
	entries := []models.LedgerEntry{
		{
			DebitAccountID:  toAccountID,   // Destination account gets debited
			CreditAccountID: fromAccountID, // Source account gets credited
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit, // This is the DEBIT entry
			Description:     fmt.Sprintf("Transfer from %s to %s", fromAccount.Name, toAccount.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
		{
			DebitAccountID:  toAccountID,   // Same accounts referenced
			CreditAccountID: fromAccountID, // Same accounts referenced
			Amount:          amount,        // Same amount
			Currency:        currency,
			EntryType:       models.EntryTypeCredit, // This is the CREDIT entry
			Description:     fmt.Sprintf("Transfer source from %s to %s", fromAccount.Name, toAccount.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
	}

	transaction, err := ls.CreateTransaction(userID, models.LedgerTransactionTypeTransfer, description, reference, entries)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"transaction": transaction,
		"rail":        string(railType),
		"fee":         fee,
		"fx_rate":     fxRate,
		"latency":     latency,
	}, nil
}

// GetOrCreateSystemAccount gets or creates a system account for the user
func (ls *LedgerService) GetOrCreateSystemAccount(userID uuid.UUID, accountNumber, name string, accountType models.LedgerAccountType) (*models.LedgerAccount, error) {
	var account models.LedgerAccount

	// Try to find existing system account
	err := ls.db.Where("user_id = ? AND account_number = ?", userID, accountNumber).First(&account).Error
	if err == nil {
		// Account exists, return it
		return &account, nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to query system account: %w", err)
	}

	// Account doesn't exist, create it
	account = models.LedgerAccount{
		UserID:        userID,
		AccountNumber: accountNumber,
		Type:          accountType,
		Currency:      "USD",
		Name:          name,
		Description:   fmt.Sprintf("System account for %s operations", name),
		IsSystem:      true,
		Status:        models.LedgerAccountStatusActive,
	}

	if err := ls.db.Create(&account).Error; err != nil {
		return nil, fmt.Errorf("failed to create system account: %w", err)
	}

	return &account, nil
}

// CreateDeposit creates a deposit transaction
func (ls *LedgerService) CreateDeposit(userID uuid.UUID, accountID uuid.UUID, amount float64, currency, description string) (*models.LedgerTransaction, error) {
	// Validate account
	var account models.LedgerAccount
	if err := ls.db.Where("id = ?", accountID).First(&account).Error; err != nil {
		return nil, fmt.Errorf("account not found: %w", err)
	}

	if !account.IsActive() {
		return nil, errors.New("account is not active")
	}

	// Get or create system equity account for deposits (represents external source of funds)
	systemEquityAccount, err := ls.GetOrCreateSystemAccount(userID, "SYSTEM-004", "System Equity", models.LedgerAccountTypeEquity)
	if err != nil {
		return nil, fmt.Errorf("failed to get system equity account: %w", err)
	}

	// Generate unique reference for this deposit
	reference := ls.generateUniqueReference()

	// Create TWO entries for proper double-entry bookkeeping
	// Deposit:
	// 1. DEBIT User Account (increases user's balance)
	// 2. CREDIT System Equity Account (represents source of funds)
	entries := []models.LedgerEntry{
		{
			DebitAccountID:  accountID,              // User's account gets debited
			CreditAccountID: systemEquityAccount.ID, // System equity account gets credited
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit, // This is the DEBIT entry
			Description:     fmt.Sprintf("Deposit to %s", account.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
		{
			DebitAccountID:  accountID,              // Same accounts referenced
			CreditAccountID: systemEquityAccount.ID, // Same accounts referenced
			Amount:          amount,                 // Same amount
			Currency:        currency,
			EntryType:       models.EntryTypeCredit, // This is the CREDIT entry
			Description:     fmt.Sprintf("Deposit source for %s", account.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
	}

	return ls.CreateTransaction(userID, models.LedgerTransactionTypeDeposit, description, reference, entries)
}

// CreateWithdrawal creates a withdrawal transaction
func (ls *LedgerService) CreateWithdrawal(userID uuid.UUID, accountID uuid.UUID, amount float64, currency, description string) (*models.LedgerTransaction, error) {
	// Validate account
	var account models.LedgerAccount
	if err := ls.db.Where("id = ?", accountID).First(&account).Error; err != nil {
		return nil, fmt.Errorf("account not found: %w", err)
	}

	if !account.IsActive() {
		return nil, errors.New("account is not active")
	}

	// Check if account has sufficient balance
	balance, err := account.GetBalance(ls.db)
	if err != nil {
		return nil, fmt.Errorf("failed to get account balance: %w", err)
	}
	if balance < amount {
		return nil, fmt.Errorf("insufficient balance: %f < %f", balance, amount)
	}

	// Get or create system equity account for withdrawals
	systemEquityAccount, err := ls.GetOrCreateSystemAccount(userID, "SYSTEM-004", "System Equity", models.LedgerAccountTypeEquity)
	if err != nil {
		return nil, fmt.Errorf("failed to get system equity account: %w", err)
	}

	// Generate unique reference for this withdrawal
	reference := ls.generateUniqueReference()

	// Create ONE entry for withdrawal
	// Withdrawal: Debit System Account (destination of funds), Credit User Account (decreases balance)
	entries := []models.LedgerEntry{
		{
			DebitAccountID:  systemEquityAccount.ID, // System equity account (destination of funds)
			CreditAccountID: accountID,              // User's account (credit - decreases balance)
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit, // This field is kept for compatibility but not used in logic
			Description:     fmt.Sprintf("Withdrawal from %s", account.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
	}

	return ls.CreateTransaction(userID, models.LedgerTransactionTypeWithdrawal, description, reference, entries)
}

// validateAccounts validates that all accounts in entries exist and are active
func (ls *LedgerService) validateAccounts(entries []models.LedgerEntry) error {
	accountIDs := make(map[uuid.UUID]bool)

	for _, entry := range entries {
		accountIDs[entry.DebitAccountID] = true
		accountIDs[entry.CreditAccountID] = true
	}

	for accountID := range accountIDs {
		var account models.LedgerAccount
		if err := ls.db.Where("id = ?", accountID).First(&account).Error; err != nil {
			return fmt.Errorf("account %s not found", accountID)
		}
		if !account.IsActive() {
			return fmt.Errorf("account %s is not active", accountID)
		}
	}

	return nil
}

// updateAccountBalances updates the balance of all accounts involved in the given entries
func (ls *LedgerService) updateAccountBalances(tx *gorm.DB, entries []models.LedgerEntry) error {
	// Group entries by account to calculate net changes
	accountChanges := make(map[uuid.UUID]float64)

	for _, entry := range entries {
		// Process each entry exactly once based on its EntryType
		// This prevents double-application when we have 2 entries per transaction

		if entry.EntryType == models.EntryTypeDebit {
			// This is a DEBIT entry - only update the debit account
			var debitAccount models.LedgerAccount
			if err := tx.Where("id = ?", entry.DebitAccountID).First(&debitAccount).Error; err != nil {
				return fmt.Errorf("debit account %s not found for balance update", entry.DebitAccountID)
			}

			if debitAccount.IsDebitAccount() {
				// For debit accounts (assets, expenses): debit increases balance
				accountChanges[entry.DebitAccountID] += entry.Amount
			} else {
				// For credit accounts (liabilities, equity, revenue): debit decreases balance
				accountChanges[entry.DebitAccountID] -= entry.Amount
			}

		} else if entry.EntryType == models.EntryTypeCredit {
			// This is a CREDIT entry - only update the credit account
			var creditAccount models.LedgerAccount
			if err := tx.Where("id = ?", entry.CreditAccountID).First(&creditAccount).Error; err != nil {
				return fmt.Errorf("credit account %s not found for balance update", entry.CreditAccountID)
			}

			if creditAccount.IsDebitAccount() {
				// For debit accounts (assets, expenses): credit decreases balance
				accountChanges[entry.CreditAccountID] -= entry.Amount
			} else {
				// For credit accounts (liabilities, equity, revenue): credit increases balance
				accountChanges[entry.CreditAccountID] += entry.Amount
			}
		}
	}

	// Update each account's balance
	for accountID, change := range accountChanges {
		if err := tx.Model(&models.LedgerAccount{}).Where("id = ?", accountID).
			UpdateColumn("balance", gorm.Expr("balance + ?", change)).Error; err != nil {
			return fmt.Errorf("failed to update balance for account %s: %w", accountID, err)
		}
	}

	return nil
}

// GetTrialBalance returns a trial balance for all accounts
func (ls *LedgerService) GetTrialBalance() (map[uuid.UUID]float64, error) {
	var accounts []models.LedgerAccount
	if err := ls.db.Find(&accounts).Error; err != nil {
		return nil, fmt.Errorf("failed to get accounts: %w", err)
	}

	trialBalance := make(map[uuid.UUID]float64)
	for _, account := range accounts {
		balance, err := account.GetBalance(ls.db)
		if err != nil {
			return nil, fmt.Errorf("failed to get balance for account %s: %w", account.ID, err)
		}
		trialBalance[account.ID] = balance
	}

	return trialBalance, nil
}

// CreateTransactionWithoutValidation creates a new ledger transaction without balance validation
func (ls *LedgerService) CreateTransactionWithoutValidation(userID uuid.UUID, transactionType models.LedgerTransactionType, description, reference string, entries []models.LedgerEntry) (*models.LedgerTransaction, error) {
	// Calculate total amount - in double-entry accounting, we only count debits to avoid doubling
	var totalAmount float64
	for _, entry := range entries {
		if entry.EntryType == models.EntryTypeDebit {
			totalAmount += entry.Amount
		}
	}

	transaction := &models.LedgerTransaction{
		UserID:      userID,
		Type:        transactionType,
		Status:      models.LedgerTransactionStatusPending,
		Description: description,
		Reference:   reference,
		TotalAmount: totalAmount,
		Currency:    "USD", // Default currency, can be enhanced
		Timestamp:   time.Now(),
		Entries:     entries,
	}

	// Skip balance validation - this is the key difference

	// Validate accounts exist and are active
	if err := ls.validateAccounts(entries); err != nil {
		return nil, fmt.Errorf("account validation failed: %w", err)
	}

	// Create transaction and entries in a transaction
	err := ls.db.Transaction(func(tx *gorm.DB) error {
		// Create the transaction
		if err := tx.Create(transaction).Error; err != nil {
			return err
		}

		// Create all entries
		for i := range transaction.Entries {
			transaction.Entries[i].TransactionID = transaction.ID
			transaction.Entries[i].ID = uuid.Nil // Ensure a new UUID is generated
			if err := tx.Create(&transaction.Entries[i]).Error; err != nil {
				return err
			}
		}

		// Update account balances
		if err := ls.updateAccountBalances(tx, entries); err != nil {
			return fmt.Errorf("failed to update account balances: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// CreateTestBalance creates a test balance transaction without validation
func (ls *LedgerService) CreateTestBalance(userID uuid.UUID, accountID uuid.UUID, amount float64, currency, description string) (*models.LedgerTransaction, error) {
	// Validate account
	var account models.LedgerAccount
	if err := ls.db.Where("id = ?", accountID).First(&account).Error; err != nil {
		return nil, fmt.Errorf("account not found: %w", err)
	}

	if !account.IsActive() {
		return nil, errors.New("account is not active")
	}

	// Create a minimal entry that only affects the user's account
	// We'll use a "void" system account that never gets queried for balance
	voidAccount, err := ls.GetOrCreateSystemAccount(userID, "VOID-ACCOUNT", "Void Account", models.LedgerAccountTypeEquity)
	if err != nil {
		return nil, fmt.Errorf("failed to get void account: %w", err)
	}

	// Generate unique reference for this test balance
	reference := ls.generateUniqueReference()

	// Create the transaction first
	transaction := &models.LedgerTransaction{
		UserID:      userID,
		Type:        models.LedgerTransactionTypeDeposit,
		Status:      models.LedgerTransactionStatusPending,
		Description: description,
		Reference:   reference,
		TotalAmount: amount,
		Currency:    currency,
		Timestamp:   time.Now(),
	}

	// Create transaction and entry in a database transaction
	err = ls.db.Transaction(func(tx *gorm.DB) error {
		// Create the transaction first
		if err := tx.Create(transaction).Error; err != nil {
			return err
		}

		// Create TWO entries for proper double-entry bookkeeping
		// Test Balance:
		// 1. DEBIT User Account (increases user's balance)
		// 2. CREDIT Void Account (represents test source)
		entries := []models.LedgerEntry{
			{
				ID:              uuid.New(),
				TransactionID:   transaction.ID,
				DebitAccountID:  accountID,      // User's account gets debited
				CreditAccountID: voidAccount.ID, // Void account gets credited
				Amount:          amount,
				Currency:        currency,
				EntryType:       models.EntryTypeDebit, // This is the DEBIT entry
				Description:     fmt.Sprintf("Test balance deposit to %s", account.Name),
				Reference:       reference,
				Timestamp:       time.Now(),
			},
			{
				ID:              uuid.New(),
				TransactionID:   transaction.ID,
				DebitAccountID:  accountID,      // Same accounts referenced
				CreditAccountID: voidAccount.ID, // Same accounts referenced
				Amount:          amount,         // Same amount
				Currency:        currency,
				EntryType:       models.EntryTypeCredit, // This is the CREDIT entry
				Description:     fmt.Sprintf("Test balance source for %s", account.Name),
				Reference:       reference,
				Timestamp:       time.Now(),
			},
		}

		// Create all entries
		for _, entry := range entries {
			if err := tx.Create(&entry).Error; err != nil {
				return err
			}
		}

		// Update account balances
		if err := ls.updateAccountBalances(tx, entries); err != nil {
			return fmt.Errorf("failed to update account balances: %w", err)
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create test balance transaction: %w", err)
	}

	// Reload the transaction with entries for the response
	if err := ls.db.Preload("Entries").Where("id = ?", transaction.ID).First(transaction).Error; err != nil {
		return nil, fmt.Errorf("failed to reload transaction: %w", err)
	}

	return transaction, nil
}

// ReconcileAccountBalances recalculates all account balances from ledger entries
// This function fixes any balance corruption caused by previous bugs
func (ls *LedgerService) ReconcileAccountBalances() error {
	log.Println("Starting account balance reconciliation...")

	// Get all accounts
	var accounts []models.LedgerAccount
	if err := ls.db.Find(&accounts).Error; err != nil {
		return fmt.Errorf("failed to get accounts: %w", err)
	}

	var reconciled, errors int

	// Recalculate balance for each account
	for _, account := range accounts {
		// Calculate correct balance from ledger entries
		if err := account.RecalculateBalance(ls.db); err != nil {
			log.Printf("Error recalculating balance for account %s: %v", account.ID, err)
			errors++
			continue
		}

		// Update the cached balance in database
		if err := ls.db.Model(&account).Update("balance", account.Balance).Error; err != nil {
			log.Printf("Error updating balance for account %s: %v", account.ID, err)
			errors++
			continue
		}

		log.Printf("Reconciled account %s (%s): balance = %.2f %s",
			account.Name, account.ID, account.Balance, account.Currency)
		reconciled++
	}

	log.Printf("Balance reconciliation completed: %d accounts reconciled, %d errors", reconciled, errors)

	if errors > 0 {
		return fmt.Errorf("reconciliation completed with %d errors", errors)
	}

	return nil
}

// GetTransactionHistory returns transaction history for a user
func (ls *LedgerService) GetTransactionHistory(userID uuid.UUID, limit, offset int) ([]models.LedgerTransaction, error) {
	var transactions []models.LedgerTransaction

	query := ls.db.Where("user_id = ?", userID).
		Preload("Entries").
		Preload("Entries.DebitAccount").
		Preload("Entries.CreditAccount").
		Order("timestamp DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}
	if offset > 0 {
		query = query.Offset(offset)
	}

	if err := query.Find(&transactions).Error; err != nil {
		return nil, fmt.Errorf("failed to get transaction history: %w", err)
	}

	return transactions, nil
}

// GetTransactionByID returns a specific transaction by ID
func (ls *LedgerService) GetTransactionByID(transactionID uuid.UUID) (*models.LedgerTransaction, error) {
	var transaction models.LedgerTransaction
	if err := ls.db.Preload("Entries").
		Preload("Entries.DebitAccount").
		Preload("Entries.CreditAccount").
		Where("id = ?", transactionID).
		First(&transaction).Error; err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	return &transaction, nil
}

// GetTransactionByReference returns a transaction by its reference
func (ls *LedgerService) GetTransactionByReference(reference string) (*models.LedgerTransaction, error) {
	var transaction models.LedgerTransaction
	if err := ls.db.Preload("Entries").
		Preload("Entries.DebitAccount").
		Preload("Entries.CreditAccount").
		Where("reference = ?", reference).
		First(&transaction).Error; err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}

	return &transaction, nil
}
