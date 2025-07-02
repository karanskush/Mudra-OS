package database

import (
	"fintech-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MigrateLedgerTables creates the ledger tables with proper indexes and constraints
func MigrateLedgerTables(db *gorm.DB) error {
	// Create ledger_account table
	if err := db.AutoMigrate(&models.LedgerAccount{}); err != nil {
		return err
	}

	// Create ledger_transaction table
	if err := db.AutoMigrate(&models.LedgerTransaction{}); err != nil {
		return err
	}

	// Create ledger_entry table
	if err := db.AutoMigrate(&models.LedgerEntry{}); err != nil {
		return err
	}

	// Add additional indexes for performance
	if err := addLedgerIndexes(db); err != nil {
		return err
	}

	// Add foreign key constraints
	if err := addLedgerConstraints(db); err != nil {
		return err
	}

	return nil
}

// addLedgerIndexes adds performance indexes to ledger tables
func addLedgerIndexes(db *gorm.DB) error {
	// Indexes for ledger_account
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_ledger_account_user_id ON ledger_account(user_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_type ON ledger_account(type);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_status ON ledger_account(status);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_currency ON ledger_account(currency);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_parent_id ON ledger_account(parent_id);
	`).Error; err != nil {
		return err
	}

	// Indexes for ledger_transaction
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_user_id ON ledger_transaction(user_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_type ON ledger_transaction(type);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_status ON ledger_transaction(status);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_timestamp ON ledger_transaction(timestamp);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_currency ON ledger_transaction(currency);
	`).Error; err != nil {
		return err
	}

	// Indexes for ledger_entry
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_transaction_id ON ledger_entry(transaction_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_debit_account_id ON ledger_entry(debit_account_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_credit_account_id ON ledger_entry(credit_account_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_timestamp ON ledger_entry(timestamp);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_currency ON ledger_entry(currency);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_type ON ledger_entry(entry_type);
	`).Error; err != nil {
		return err
	}

	return nil
}

// addLedgerConstraints adds foreign key constraints to ledger tables
func addLedgerConstraints(db *gorm.DB) error {
	// Foreign key constraints for ledger_account
	if err := db.Exec(`
		ALTER TABLE ledger_account 
		ADD CONSTRAINT IF NOT EXISTS fk_ledger_account_user_id 
		FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
		
		ALTER TABLE ledger_account 
		ADD CONSTRAINT IF NOT EXISTS fk_ledger_account_parent_id 
		FOREIGN KEY (parent_id) REFERENCES ledger_account(id) ON DELETE SET NULL;
	`).Error; err != nil {
		return err
	}

	// Foreign key constraints for ledger_transaction
	if err := db.Exec(`
		ALTER TABLE ledger_transaction 
		ADD CONSTRAINT IF NOT EXISTS fk_ledger_transaction_user_id 
		FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
	`).Error; err != nil {
		return err
	}

	// Foreign key constraints for ledger_entry
	if err := db.Exec(`
		ALTER TABLE ledger_entry 
		ADD CONSTRAINT IF NOT EXISTS fk_ledger_entry_transaction_id 
		FOREIGN KEY (transaction_id) REFERENCES ledger_transaction(id) ON DELETE CASCADE;
		
		ALTER TABLE ledger_entry 
		ADD CONSTRAINT IF NOT EXISTS fk_ledger_entry_debit_account_id 
		FOREIGN KEY (debit_account_id) REFERENCES ledger_account(id) ON DELETE RESTRICT;
		
		ALTER TABLE ledger_entry 
		ADD CONSTRAINT IF NOT EXISTS fk_ledger_entry_credit_account_id 
		FOREIGN KEY (credit_account_id) REFERENCES ledger_account(id) ON DELETE RESTRICT;
	`).Error; err != nil {
		return err
	}

	return nil
}

// CreateSystemAccounts creates default system accounts for the ledger
func CreateSystemAccounts(db *gorm.DB, userID uuid.UUID) error {
	// Create system accounts for deposits, withdrawals, fees, etc.
	systemAccounts := []models.LedgerAccount{
		{
			UserID:        userID,
			AccountNumber: "SYSTEM-001",
			Type:          models.LedgerAccountTypeAsset,
			Currency:      "USD",
			Name:          "System Cash",
			Description:   "System account for cash operations",
			IsSystem:      true,
		},
		{
			UserID:        userID,
			AccountNumber: "SYSTEM-002",
			Type:          models.LedgerAccountTypeRevenue,
			Currency:      "USD",
			Name:          "System Revenue",
			Description:   "System account for revenue operations",
			IsSystem:      true,
		},
		{
			UserID:        userID,
			AccountNumber: "SYSTEM-003",
			Type:          models.LedgerAccountTypeExpense,
			Currency:      "USD",
			Name:          "System Expenses",
			Description:   "System account for expense operations",
			IsSystem:      true,
		},
		{
			UserID:        userID,
			AccountNumber: "SYSTEM-004",
			Type:          models.LedgerAccountTypeEquity,
			Currency:      "USD",
			Name:          "System Equity",
			Description:   "System account for equity operations",
			IsSystem:      true,
		},
	}

	for _, account := range systemAccounts {
		if err := db.Where("account_number = ?", account.AccountNumber).FirstOrCreate(&account).Error; err != nil {
			return err
		}
	}

	return nil
}
