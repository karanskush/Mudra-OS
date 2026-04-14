package services

import (
	"errors"
	"fmt"
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

// CreateConnectedAccount creates a ledger account with provider metadata (e.g. "revolut", "paypal").
func (ls *LedgerService) CreateConnectedAccount(userID uuid.UUID, accountNumber, name, description, currency string, accountType models.LedgerAccountType, provider, institutionName string) (*models.LedgerAccount, error) {
	account := &models.LedgerAccount{
		UserID:          userID,
		AccountNumber:   accountNumber,
		Type:            accountType,
		Currency:        currency,
		Name:            name,
		Description:     description,
		Status:          models.LedgerAccountStatusActive,
		Provider:        provider,
		InstitutionName: institutionName,
	}
	if err := ls.db.Create(account).Error; err != nil {
		return nil, fmt.Errorf("failed to create connected account: %w", err)
	}
	return account, nil
}

// CreateTransaction creates a new ledger transaction with entries
func (ls *LedgerService) CreateTransaction(userID uuid.UUID, transactionType models.LedgerTransactionType, description, reference string, entries []models.LedgerEntry) (*models.LedgerTransaction, error) {
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
		// Create the transaction WITHOUT cascading to entries (avoid double-insert)
		if err := tx.Omit("Entries").Create(transaction).Error; err != nil {
			return err
		}

		// Create all entries manually
		for i := range transaction.Entries {
			transaction.Entries[i].TransactionID = transaction.ID
			transaction.Entries[i].ID = uuid.Nil // Ensure a new UUID is generated
			if err := tx.Create(&transaction.Entries[i]).Error; err != nil {
				return err
			}
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
		Where("debit_account_id IN ?", accountIDs).
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
		Where("credit_account_id IN ?", accountIDs).
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
func (ls *LedgerService) CreateTransfer(userID uuid.UUID, fromAccountID, toAccountID uuid.UUID, amount float64, currency, description, reference string) (map[string]interface{}, error) {
	// Auto-generate reference if not provided
	if reference == "" {
		reference = "TXN-" + uuid.New().String()
	}
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

	// Select payment rail and calculate fee BEFORE the balance check so we can
	// verify the sender can cover amount + fee.
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
		fxRate = 1
		latency = "30s"
	case paymentrails.RailCrypto:
		fee = 0.001*amount + 2 // 0.1% + gas
		fxRate = 1
		latency = "5s"
	default:
		fee = 2
		fxRate = 1
		latency = "60s"
	}

	// Validate sender has sufficient balance to cover amount + fee
	fromBalance, err := fromAccount.GetBalance(ls.db)
	if err != nil {
		return nil, fmt.Errorf("failed to get sender balance: %w", err)
	}
	if fromBalance < amount+fee {
		return nil, fmt.Errorf("insufficient balance: available %.2f, requested %.2f (incl. %.2f %s fee)", fromBalance, amount+fee, fee, string(railType))
	}

	if railErr := orchestrator.Transfer(payment, &railType); railErr != nil {
		return nil, fmt.Errorf("payment rail transfer failed: %w", railErr)
	}

	// Get or create the system fee revenue account so fee has somewhere to land.
	feeAccount, feeAccErr := ls.GetOrCreateSystemAccount(userID, "SYSTEM-FEE", "Fee Revenue", models.LedgerAccountTypeRevenue)
	if feeAccErr != nil {
		return nil, fmt.Errorf("failed to get fee account: %w", feeAccErr)
	}

	// Build ledger entries:
	//   Entry 1 (transfer): Debit recipient, Credit sender — moves the principal.
	//   Entry 2 (fee):      Debit sender,    Credit SYSTEM-FEE — deducts the fee.
	entries := []models.LedgerEntry{
		{
			DebitAccountID:  toAccountID,
			CreditAccountID: fromAccountID,
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit,
			Description:     fmt.Sprintf("Transfer: %s → %s", fromAccount.Name, toAccount.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
	}
	if fee > 0 {
		entries = append(entries, models.LedgerEntry{
			DebitAccountID:  fromAccountID,
			CreditAccountID: feeAccount.ID,
			Amount:          fee,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit,
			Description:     fmt.Sprintf("Rail fee (%s): %s", string(railType), fromAccount.Name),
			Reference:       "FEE-" + reference,
			Timestamp:       time.Now(),
		})
	}

	transaction, err := ls.CreateTransactionWithoutValidation(userID, models.LedgerTransactionTypeTransfer, description, reference, entries)
	if err != nil {
		return nil, err
	}

	// Persist fee and rail on the transaction record so they appear in history.
	ls.db.Model(transaction).Updates(map[string]interface{}{
		"fee":  fee,
		"rail": string(railType),
	})
	transaction.Fee = fee
	transaction.Rail = string(railType)

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
func (ls *LedgerService) CreateDeposit(userID uuid.UUID, accountID uuid.UUID, amount float64, currency, description, reference string) (*models.LedgerTransaction, error) {
	reference = autoRef("DEP", reference)

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

	// Create a single properly balanced entry for deposit
	// In double-entry bookkeeping: Debit = User Account (increases balance), Credit = System Account (source of funds)
	entries := []models.LedgerEntry{
		{
			DebitAccountID:  accountID,              // User's account gets debited (increased balance)
			CreditAccountID: systemEquityAccount.ID, // System equity account gets credited (source of funds)
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit, // Required field
			Description:     fmt.Sprintf("Deposit to %s", account.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
	}

	// Create transaction with proper total amount calculation
	transaction := &models.LedgerTransaction{
		UserID:      userID,
		Type:        models.LedgerTransactionTypeDeposit,
		Status:      models.LedgerTransactionStatusPending,
		Description: description,
		Reference:   reference,
		TotalAmount: amount, // Single amount, not doubled
		Currency:    currency,
		Timestamp:   time.Now(),
		Entries:     entries,
	}

	// Validate accounts exist and are active
	if err := ls.validateAccounts(entries); err != nil {
		return nil, fmt.Errorf("account validation failed: %w", err)
	}

	// Create transaction and entries in a database transaction
	err = ls.db.Transaction(func(tx *gorm.DB) error {
		// Create the transaction WITHOUT cascading to entries (avoid double-insert)
		if err := tx.Omit("Entries").Create(transaction).Error; err != nil {
			return err
		}

		// Create the entry manually
		transaction.Entries[0].TransactionID = transaction.ID
		transaction.Entries[0].ID = uuid.Nil // Ensure a new UUID is generated
		if err := tx.Create(&transaction.Entries[0]).Error; err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create deposit transaction: %w", err)
	}

	return transaction, nil
}

// CreateWithdrawal creates a withdrawal transaction
func (ls *LedgerService) CreateWithdrawal(userID uuid.UUID, accountID uuid.UUID, amount float64, currency, description, reference string) (*models.LedgerTransaction, error) {
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

	// Create balanced entries for withdrawal
	// When someone withdraws cash, we:
	// 1. Debit the system equity account (represents the destination of funds)
	// 2. Credit the user's account (decrease their balance)
	entries := []models.LedgerEntry{
		{
			DebitAccountID:  systemEquityAccount.ID, // System equity account (debit - represents destination of funds)
			CreditAccountID: accountID,              // User's account (credit - decreases balance)
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit, // This entry represents the debit side
			Description:     fmt.Sprintf("Withdrawal debit to system equity"),
			Reference:       reference,
			Timestamp:       time.Now(),
		},
		{
			DebitAccountID:  systemEquityAccount.ID, // System equity account (debit - represents destination of funds)
			CreditAccountID: accountID,              // User's account (credit - decreases balance)
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeCredit, // This entry represents the credit side
			Description:     fmt.Sprintf("Withdrawal credit from %s", account.Name),
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
		// Create the transaction WITHOUT cascading to entries (avoid double-insert)
		if err := tx.Omit("Entries").Create(transaction).Error; err != nil {
			return err
		}

		// Create all entries manually
		for i := range transaction.Entries {
			transaction.Entries[i].TransactionID = transaction.ID
			transaction.Entries[i].ID = uuid.Nil // Ensure a new UUID is generated
			if err := tx.Create(&transaction.Entries[i]).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create transaction: %w", err)
	}

	return transaction, nil
}

// autoRef returns reference if non-empty, otherwise generates a unique one.
func autoRef(prefix, reference string) string {
	if reference != "" {
		return reference
	}
	return fmt.Sprintf("%s-%d-%s", prefix, time.Now().UnixMilli(), uuid.New().String()[:8])
}

// CreateTestBalance creates a test balance transaction without validation
func (ls *LedgerService) CreateTestBalance(userID uuid.UUID, accountID uuid.UUID, amount float64, currency, description, reference string) (*models.LedgerTransaction, error) {
	reference = autoRef("DEP", reference)

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

		// Create a single entry that only debits the user's account
		entry := models.LedgerEntry{
			ID:              uuid.New(),
			TransactionID:   transaction.ID,
			DebitAccountID:  accountID,      // User's account gets debited (balance increases)
			CreditAccountID: voidAccount.ID, // Void account gets credited (we never query this)
			Amount:          amount,
			Currency:        currency,
			EntryType:       models.EntryTypeDebit,
			Description:     fmt.Sprintf("Test balance deposit to %s", account.Name),
			Reference:       reference,
			Timestamp:       time.Now(),
		}

		if err := tx.Create(&entry).Error; err != nil {
			return err
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

// ============================================================
// Journal Entries
// ============================================================

// JournalLine is one side of a journal entry (debit or credit)
type JournalLine struct {
	AccountID uuid.UUID `json:"account_id"`
	Type      string    `json:"type"` // "debit" or "credit"
	Amount    float64   `json:"amount"`
}

// CreateJournalEntry records a manually balanced double-entry journal entry.
func (ls *LedgerService) CreateJournalEntry(userID uuid.UUID, description, reference, currency string, lines []JournalLine) (*models.LedgerTransaction, error) {
	reference = autoRef("JE", reference)
	if currency == "" {
		currency = "USD"
	}

	if len(lines) < 2 {
		return nil, errors.New("journal entry must have at least 2 lines")
	}

	var totalDebits, totalCredits float64
	for _, l := range lines {
		switch l.Type {
		case "debit":
			totalDebits += l.Amount
		case "credit":
			totalCredits += l.Amount
		default:
			return nil, fmt.Errorf("invalid line type %q: must be 'debit' or 'credit'", l.Type)
		}
	}
	const epsilon = 0.0001
	if totalDebits-totalCredits > epsilon || totalCredits-totalDebits > epsilon {
		return nil, fmt.Errorf("journal entry is not balanced: debits %.4f ≠ credits %.4f", totalDebits, totalCredits)
	}

	// Pair debit lines with credit lines
	type pool struct {
		accountID uuid.UUID
		remaining float64
	}
	creditPool := make([]pool, 0, len(lines))
	debitLines := make([]JournalLine, 0, len(lines))
	for _, l := range lines {
		if l.Type == "credit" {
			creditPool = append(creditPool, pool{l.AccountID, l.Amount})
		} else {
			debitLines = append(debitLines, l)
		}
	}

	var entries []models.LedgerEntry
	for _, dl := range debitLines {
		remaining := dl.Amount
		for i := range creditPool {
			if creditPool[i].remaining <= 0 {
				continue
			}
			take := remaining
			if creditPool[i].remaining < take {
				take = creditPool[i].remaining
			}
			entries = append(entries, models.LedgerEntry{
				DebitAccountID:  dl.AccountID,
				CreditAccountID: creditPool[i].accountID,
				Amount:          take,
				Currency:        currency,
				EntryType:       models.EntryTypeDebit,
				Description:     description,
				Reference:       reference,
				Timestamp:       time.Now(),
			})
			creditPool[i].remaining -= take
			remaining -= take
			if remaining <= 0 {
				break
			}
		}
	}

	transaction := &models.LedgerTransaction{
		UserID:      userID,
		Type:        models.LedgerTransactionTypeAdjustment,
		Status:      models.LedgerTransactionStatusPending,
		Description: description,
		Reference:   reference,
		TotalAmount: totalDebits,
		Currency:    currency,
		Timestamp:   time.Now(),
	}

	err := ls.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(transaction).Error; err != nil {
			return err
		}
		for i := range entries {
			entries[i].TransactionID = transaction.ID
			if err := tx.Create(&entries[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create journal entry: %w", err)
	}

	transaction.MarkPosted()
	ls.db.Save(transaction)

	if err := ls.db.Preload("Entries").Where("id = ?", transaction.ID).First(transaction).Error; err != nil {
		return nil, fmt.Errorf("failed to reload journal entry: %w", err)
	}
	return transaction, nil
}

// ============================================================
// Transaction Reversal
// ============================================================

// ReverseTransaction creates and posts a reversal for a previously posted transaction.
func (ls *LedgerService) ReverseTransaction(userID uuid.UUID, transactionID uuid.UUID, reason string) (*models.LedgerTransaction, error) {
	var original models.LedgerTransaction
	if err := ls.db.Preload("Entries").Where("id = ?", transactionID).First(&original).Error; err != nil {
		return nil, fmt.Errorf("transaction not found: %w", err)
	}
	if !original.IsPosted() {
		return nil, errors.New("only posted transactions can be reversed")
	}
	if reason == "" {
		reason = "Reversal of " + original.Description
	}
	reversal := original.CreateReversal(userID, reason)
	reversal.Reference = autoRef("REV", "")

	err := ls.db.Transaction(func(tx *gorm.DB) error {
		if err := tx.Omit("Entries").Create(reversal).Error; err != nil {
			return err
		}
		for i := range reversal.Entries {
			reversal.Entries[i].TransactionID = reversal.ID
			reversal.Entries[i].ID = uuid.Nil
			if err := tx.Create(&reversal.Entries[i]).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create reversal: %w", err)
	}

	reversal.MarkPosted()
	ls.db.Save(reversal)
	return reversal, nil
}

// ============================================================
// Account Statement
// ============================================================

// StatementEntry is one row in an account statement with a running balance.
type StatementEntry struct {
	Timestamp    time.Time `json:"timestamp"`
	Description  string    `json:"description"`
	Reference    string    `json:"reference"`
	Debit        float64   `json:"debit"`
	Credit       float64   `json:"credit"`
	Balance      float64   `json:"balance"`
	TxnID        string    `json:"transaction_id"`
	TxnType      string    `json:"transaction_type"`
}

// GetAccountStatement returns an account statement with running balance for a date range.
func (ls *LedgerService) GetAccountStatement(accountID uuid.UUID, from, to time.Time) ([]StatementEntry, float64, error) {
	var account models.LedgerAccount
	if err := ls.db.Where("id = ?", accountID).First(&account).Error; err != nil {
		return nil, 0, fmt.Errorf("account not found: %w", err)
	}

	type rawEntry struct {
		Timestamp   time.Time
		Description string
		Reference   string
		Amount      float64
		Side        string
		TxnID       string
		TxnType     string
	}

	var debits []rawEntry
	ls.db.Raw(`
		SELECT le.timestamp, le.description, le.reference, le.amount,
		       'debit' as side, lt.id::text as txn_id, lt.type as txn_type
		FROM ledger_entry le
		JOIN ledger_transaction lt ON lt.id = le.transaction_id
		WHERE le.debit_account_id = ?
		  AND le.timestamp BETWEEN ? AND ?
		  AND le.deleted_at IS NULL
		ORDER BY le.timestamp ASC
	`, accountID, from, to).Scan(&debits)

	var credits []rawEntry
	ls.db.Raw(`
		SELECT le.timestamp, le.description, le.reference, le.amount,
		       'credit' as side, lt.id::text as txn_id, lt.type as txn_type
		FROM ledger_entry le
		JOIN ledger_transaction lt ON lt.id = le.transaction_id
		WHERE le.credit_account_id = ?
		  AND le.timestamp BETWEEN ? AND ?
		  AND le.deleted_at IS NULL
		ORDER BY le.timestamp ASC
	`, accountID, from, to).Scan(&credits)

	rows := append(debits, credits...)
	// Sort by timestamp
	for i := 0; i < len(rows); i++ {
		for j := i + 1; j < len(rows); j++ {
			if rows[j].Timestamp.Before(rows[i].Timestamp) {
				rows[i], rows[j] = rows[j], rows[i]
			}
		}
	}

	var runningBalance float64
	statements := make([]StatementEntry, 0, len(rows))
	for _, r := range rows {
		var debit, credit float64
		if account.IsDebitAccount() {
			if r.Side == "debit" {
				debit = r.Amount
				runningBalance += r.Amount
			} else {
				credit = r.Amount
				runningBalance -= r.Amount
			}
		} else {
			if r.Side == "credit" {
				credit = r.Amount
				runningBalance += r.Amount
			} else {
				debit = r.Amount
				runningBalance -= r.Amount
			}
		}
		statements = append(statements, StatementEntry{
			Timestamp:   r.Timestamp,
			Description: r.Description,
			Reference:   r.Reference,
			Debit:       debit,
			Credit:      credit,
			Balance:     runningBalance,
			TxnID:       r.TxnID,
			TxnType:     r.TxnType,
		})
	}
	return statements, runningBalance, nil
}

// ============================================================
// Chart of Accounts
// ============================================================

// AccountGroup groups accounts for the chart-of-accounts view.
type AccountGroup struct {
	Name     string                   `json:"name"`
	Category string                   `json:"category"`
	Accounts []map[string]interface{} `json:"accounts"`
	Total    float64                  `json:"total"`
}

// GetChartOfAccounts returns accounts grouped by category with balances.
func (ls *LedgerService) GetChartOfAccounts(userID uuid.UUID) ([]AccountGroup, error) {
	accounts, err := ls.GetUserAccounts(userID)
	if err != nil {
		return nil, err
	}
	balances, err := ls.GetAccountBalancesBatch(accounts)
	if err != nil {
		return nil, err
	}

	categories := []struct {
		name  string
		label string
		types []models.LedgerAccountType
	}{
		{"assets", "Assets", []models.LedgerAccountType{
			models.LedgerAccountTypeAsset, models.LedgerAccountTypeCash,
			models.LedgerAccountTypeBank, models.LedgerAccountTypeReceivable,
			models.LedgerAccountTypeInvestment,
		}},
		{"liabilities", "Liabilities", []models.LedgerAccountType{
			models.LedgerAccountTypeLiability, models.LedgerAccountTypePayable,
			models.LedgerAccountTypeLoan, models.LedgerAccountTypeCredit,
		}},
		{"equity", "Equity", []models.LedgerAccountType{
			models.LedgerAccountTypeEquity, models.LedgerAccountTypeCapital,
			models.LedgerAccountTypeRetained,
		}},
		{"revenue", "Revenue", []models.LedgerAccountType{
			models.LedgerAccountTypeRevenue, models.LedgerAccountTypeIncome,
			models.LedgerAccountTypeGain,
		}},
		{"expenses", "Expenses", []models.LedgerAccountType{
			models.LedgerAccountTypeExpense, models.LedgerAccountTypeLoss,
			models.LedgerAccountTypeFee,
		}},
	}

	typeSet := func(types []models.LedgerAccountType) map[models.LedgerAccountType]bool {
		m := make(map[models.LedgerAccountType]bool)
		for _, t := range types {
			m[t] = true
		}
		return m
	}

	result := make([]AccountGroup, 0, len(categories))
	for _, cat := range categories {
		ts := typeSet(cat.types)
		group := AccountGroup{Name: cat.name, Category: cat.label, Accounts: []map[string]interface{}{}}
		for _, acc := range accounts {
			if !ts[acc.Type] {
				continue
			}
			bal := balances[acc.ID]
			group.Total += bal
			group.Accounts = append(group.Accounts, map[string]interface{}{
				"id":             acc.ID.String(),
				"account_number": acc.AccountNumber,
				"name":           acc.Name,
				"type":           string(acc.Type),
				"currency":       acc.Currency,
				"balance":        bal,
				"description":    acc.Description,
				"status":         string(acc.Status),
			})
		}
		result = append(result, group)
	}
	return result, nil
}

// ============================================================
// Financial Reports
// ============================================================

// BalanceSheetReport is the structured balance sheet output.
type BalanceSheetReport struct {
	AsOf         time.Time      `json:"as_of"`
	Assets       []AccountGroup `json:"assets"`
	Liabilities  []AccountGroup `json:"liabilities"`
	Equity       []AccountGroup `json:"equity"`
	TotalAssets  float64        `json:"total_assets"`
	TotalLiabEq  float64        `json:"total_liabilities_equity"`
	IsBalanced   bool           `json:"is_balanced"`
}

// GetBalanceSheet returns a balance sheet as of now.
func (ls *LedgerService) GetBalanceSheet(userID uuid.UUID) (*BalanceSheetReport, error) {
	coa, err := ls.GetChartOfAccounts(userID)
	if err != nil {
		return nil, err
	}
	report := &BalanceSheetReport{AsOf: time.Now()}
	for _, group := range coa {
		switch group.Name {
		case "assets":
			report.Assets = append(report.Assets, group)
			report.TotalAssets += group.Total
		case "liabilities":
			report.Liabilities = append(report.Liabilities, group)
			report.TotalLiabEq += group.Total
		case "equity":
			report.Equity = append(report.Equity, group)
			report.TotalLiabEq += group.Total
		}
	}
	const epsilon = 0.01
	diff := report.TotalAssets - report.TotalLiabEq
	if diff < 0 {
		diff = -diff
	}
	report.IsBalanced = diff < epsilon
	return report, nil
}

// IncomeStatementReport is the structured income statement output.
type IncomeStatementReport struct {
	From          time.Time      `json:"from"`
	To            time.Time      `json:"to"`
	Revenue       []AccountGroup `json:"revenue"`
	Expenses      []AccountGroup `json:"expenses"`
	TotalRevenue  float64        `json:"total_revenue"`
	TotalExpenses float64        `json:"total_expenses"`
	NetIncome     float64        `json:"net_income"`
}

// GetIncomeStatement returns an income statement for a date range.
func (ls *LedgerService) GetIncomeStatement(userID uuid.UUID, from, to time.Time) (*IncomeStatementReport, error) {
	coa, err := ls.GetChartOfAccounts(userID)
	if err != nil {
		return nil, err
	}
	report := &IncomeStatementReport{From: from, To: to}
	for _, group := range coa {
		switch group.Name {
		case "revenue":
			report.Revenue = append(report.Revenue, group)
			report.TotalRevenue += group.Total
		case "expenses":
			report.Expenses = append(report.Expenses, group)
			report.TotalExpenses += group.Total
		}
	}
	report.NetIncome = report.TotalRevenue - report.TotalExpenses
	return report, nil
}

// CashFlowEntry is one entry in the cash flow report.
type CashFlowEntry struct {
	Timestamp    time.Time `json:"timestamp"`
	Type         string    `json:"type"`
	Description  string    `json:"description"`
	Reference    string    `json:"reference"`
	Amount       float64   `json:"amount"`
	Currency     string    `json:"currency"`
	RunningTotal float64   `json:"running_total"`
}

// GetCashFlow returns cash transactions (deposits/withdrawals) in a date range.
func (ls *LedgerService) GetCashFlow(userID uuid.UUID, from, to time.Time) ([]CashFlowEntry, float64, error) {
	var txns []models.LedgerTransaction
	if err := ls.db.
		Where("user_id = ? AND type IN ? AND timestamp BETWEEN ? AND ? AND status = ?",
			userID,
			[]string{"deposit", "withdrawal"},
			from, to,
			models.LedgerTransactionStatusPosted,
		).
		Order("timestamp ASC").
		Find(&txns).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get cash flow: %w", err)
	}
	var running float64
	entries := make([]CashFlowEntry, 0, len(txns))
	for _, t := range txns {
		amount := t.TotalAmount
		if t.Type == models.LedgerTransactionTypeWithdrawal {
			amount = -amount
		}
		running += amount
		entries = append(entries, CashFlowEntry{
			Timestamp:    t.Timestamp,
			Type:         string(t.Type),
			Description:  t.Description,
			Reference:    t.Reference,
			Amount:       amount,
			Currency:     t.Currency,
			RunningTotal: running,
		})
	}
	return entries, running, nil
}

// GetAllUserTransactions returns all transactions for a user with optional filters.
func (ls *LedgerService) GetAllUserTransactions(userID uuid.UUID, txnType, status string, limit, offset int) ([]models.LedgerTransaction, int64, error) {
	query := ls.db.Model(&models.LedgerTransaction{}).
		Where("user_id = ?", userID).
		Preload("Entries")

	if txnType != "" {
		query = query.Where("type = ?", txnType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var txns []models.LedgerTransaction
	if limit <= 0 {
		limit = 50
	}
	if err := query.Order("timestamp DESC").Limit(limit).Offset(offset).Find(&txns).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get transactions: %w", err)
	}
	return txns, total, nil
}
