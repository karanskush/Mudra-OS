package database

import (
	"fintech-backend/internal/models"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MigrateLedgerTables creates the ledger tables with proper indexes and constraints
func MigrateLedgerTables(db *gorm.DB) error {
	// Fix the reference constraint on every startup (idempotent)
	if err := FixReferenceConstraint(db); err != nil {
		fmt.Printf("Warning: Failed to fix reference constraint: %v\n", err)
	}

	// Check if ledger tables are already set up
	if isLedgerAlreadySetup(db) {
		fmt.Println("Ledger tables already set up, skipping migration")
		return nil
	}

	// Fix the account number constraint first (for existing installations)
	if err := FixAccountNumberConstraint(db); err != nil {
		// Log but don't fail if this doesn't work (might be a fresh install)
		fmt.Printf("Warning: Failed to fix account number constraint (might be fresh install): %v\n", err)
	}

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

	// Create additional indexes for better performance
	if err := CreateLedgerIndexes(db); err != nil {
		fmt.Printf("Warning: Failed to create some indexes: %v\n", err)
	}

	// Create foreign key constraints (with proper error handling)
	if err := CreateLedgerConstraints(db); err != nil {
		fmt.Printf("Warning: Failed to create some foreign key constraints: %v\n", err)
	}

	return nil
}

// isLedgerAlreadySetup checks if ledger tables and indexes are already configured
func isLedgerAlreadySetup(db *gorm.DB) bool {
	// Check if all ledger tables exist
	if !db.Migrator().HasTable(&models.LedgerAccount{}) ||
		!db.Migrator().HasTable(&models.LedgerTransaction{}) ||
		!db.Migrator().HasTable(&models.LedgerEntry{}) {
		return false
	}

	// Check if key indexes exist
	var count int64
	db.Raw(`
		SELECT COUNT(*) FROM pg_indexes 
		WHERE indexname IN ('idx_ledger_account_user_id', 'idx_ledger_transaction_user_id', 'idx_ledger_entry_transaction_id')
	`).Scan(&count)

	return count >= 3
}

// CreateLedgerIndexes creates additional indexes for better performance
func CreateLedgerIndexes(db *gorm.DB) error {
	// Check if indexes already exist to avoid redundant creation
	if indexesExist(db) {
		fmt.Println("Ledger indexes already exist, skipping creation")
		return nil
	}

	// Account indexes
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_ledger_account_user_id ON ledger_account(user_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_type ON ledger_account(type);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_status ON ledger_account(status);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_currency ON ledger_account(currency);
		CREATE INDEX IF NOT EXISTS idx_ledger_account_parent_id ON ledger_account(parent_id);
	`).Error; err != nil {
		return fmt.Errorf("failed to create account indexes: %w", err)
	}

	// Transaction indexes
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_user_id ON ledger_transaction(user_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_type ON ledger_transaction(type);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_status ON ledger_transaction(status);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_timestamp ON ledger_transaction(timestamp);
		CREATE INDEX IF NOT EXISTS idx_ledger_transaction_currency ON ledger_transaction(currency);
	`).Error; err != nil {
		return fmt.Errorf("failed to create transaction indexes: %w", err)
	}

	// Entry indexes
	if err := db.Exec(`
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_transaction_id ON ledger_entry(transaction_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_debit_account_id ON ledger_entry(debit_account_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_credit_account_id ON ledger_entry(credit_account_id);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_timestamp ON ledger_entry(timestamp);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_currency ON ledger_entry(currency);
		CREATE INDEX IF NOT EXISTS idx_ledger_entry_type ON ledger_entry(entry_type);
	`).Error; err != nil {
		return fmt.Errorf("failed to create entry indexes: %w", err)
	}

	return nil
}

// indexesExist checks if the main indexes are already created
func indexesExist(db *gorm.DB) bool {
	var count int64
	db.Raw(`
		SELECT COUNT(*) FROM pg_indexes 
		WHERE indexname IN (
			'idx_ledger_account_user_id',
			'idx_ledger_transaction_user_id',
			'idx_ledger_entry_transaction_id'
		)
	`).Scan(&count)

	return count >= 3
}

// CreateLedgerConstraints creates foreign key constraints safely
func CreateLedgerConstraints(db *gorm.DB) error {
	// Check if foreign key already exists before adding it
	var count int64

	// Check for user_id foreign key on ledger_account
	db.Raw(`
		SELECT COUNT(*) FROM information_schema.table_constraints 
		WHERE constraint_name = 'fk_ledger_account_user_id' 
		AND table_name = 'ledger_account'
	`).Scan(&count)

	if count == 0 {
		if err := db.Exec(`
			ALTER TABLE ledger_account 
			ADD CONSTRAINT fk_ledger_account_user_id 
			FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
		`).Error; err != nil {
			fmt.Printf("Warning: Could not create user_id foreign key for ledger_account: %v\n", err)
		}
	}

	// Check for parent_id foreign key on ledger_account
	db.Raw(`
		SELECT COUNT(*) FROM information_schema.table_constraints 
		WHERE constraint_name = 'fk_ledger_account_parent_id' 
		AND table_name = 'ledger_account'
	`).Scan(&count)

	if count == 0 {
		if err := db.Exec(`
			ALTER TABLE ledger_account 
			ADD CONSTRAINT fk_ledger_account_parent_id 
			FOREIGN KEY (parent_id) REFERENCES ledger_account(id) ON DELETE SET NULL;
		`).Error; err != nil {
			fmt.Printf("Warning: Could not create parent_id foreign key for ledger_account: %v\n", err)
		}
	}

	// Check for user_id foreign key on ledger_transaction
	db.Raw(`
		SELECT COUNT(*) FROM information_schema.table_constraints 
		WHERE constraint_name = 'fk_ledger_transaction_user_id' 
		AND table_name = 'ledger_transaction'
	`).Scan(&count)

	if count == 0 {
		if err := db.Exec(`
			ALTER TABLE ledger_transaction 
			ADD CONSTRAINT fk_ledger_transaction_user_id 
			FOREIGN KEY (user_id) REFERENCES "user"(id) ON DELETE CASCADE;
		`).Error; err != nil {
			fmt.Printf("Warning: Could not create user_id foreign key for ledger_transaction: %v\n", err)
		}
	}

	// Check for transaction_id foreign key on ledger_entry
	db.Raw(`
		SELECT COUNT(*) FROM information_schema.table_constraints 
		WHERE constraint_name = 'fk_ledger_entry_transaction_id' 
		AND table_name = 'ledger_entry'
	`).Scan(&count)

	if count == 0 {
		if err := db.Exec(`
			ALTER TABLE ledger_entry 
			ADD CONSTRAINT fk_ledger_entry_transaction_id 
			FOREIGN KEY (transaction_id) REFERENCES ledger_transaction(id) ON DELETE CASCADE;
		`).Error; err != nil {
			fmt.Printf("Warning: Could not create transaction_id foreign key for ledger_entry: %v\n", err)
		}
	}

	// Check for debit_account_id foreign key on ledger_entry
	db.Raw(`
		SELECT COUNT(*) FROM information_schema.table_constraints 
		WHERE constraint_name = 'fk_ledger_entry_debit_account_id' 
		AND table_name = 'ledger_entry'
	`).Scan(&count)

	if count == 0 {
		if err := db.Exec(`
			ALTER TABLE ledger_entry 
			ADD CONSTRAINT fk_ledger_entry_debit_account_id 
			FOREIGN KEY (debit_account_id) REFERENCES ledger_account(id) ON DELETE RESTRICT;
		`).Error; err != nil {
			fmt.Printf("Warning: Could not create debit_account_id foreign key for ledger_entry: %v\n", err)
		}
	}

	// Check for credit_account_id foreign key on ledger_entry
	db.Raw(`
		SELECT COUNT(*) FROM information_schema.table_constraints 
		WHERE constraint_name = 'fk_ledger_entry_credit_account_id' 
		AND table_name = 'ledger_entry'
	`).Scan(&count)

	if count == 0 {
		if err := db.Exec(`
			ALTER TABLE ledger_entry 
			ADD CONSTRAINT fk_ledger_entry_credit_account_id 
			FOREIGN KEY (credit_account_id) REFERENCES ledger_account(id) ON DELETE RESTRICT;
		`).Error; err != nil {
			fmt.Printf("Warning: Could not create credit_account_id foreign key for ledger_entry: %v\n", err)
		}
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
		if err := db.Where("user_id = ? AND account_number = ?", userID, account.AccountNumber).FirstOrCreate(&account).Error; err != nil {
			return err
		}
	}

	return nil
}

// FixReferenceConstraint drops the global unique index on reference and replaces it
// with a composite (user_id, reference) unique index so the same reference string
// can be reused across different users, and auto-generated refs don't collide.
func FixReferenceConstraint(db *gorm.DB) error {
	// Drop old global unique index (ignore error if it doesn't exist)
	db.Exec(`DROP INDEX IF EXISTS "idx_ledger_transaction_reference"`)
	db.Exec(`DROP INDEX IF EXISTS "ledger_transaction_reference_key"`)

	// Create composite unique index
	if err := db.Exec(`
		CREATE UNIQUE INDEX IF NOT EXISTS "idx_ledger_txn_user_ref"
		ON "ledger_transaction" ("user_id", "reference")
		WHERE "deleted_at" IS NULL
	`).Error; err != nil {
		return fmt.Errorf("failed to create composite reference index: %w", err)
	}
	return nil
}

// FixAccountNumberConstraint updates the unique constraint to allow same account numbers per user
func FixAccountNumberConstraint(db *gorm.DB) error {
	// Drop the old unique index if it exists (silently fail if it doesn't exist)
	if err := db.Exec(`DROP INDEX IF EXISTS "idx_ledger_account_account_number"`).Error; err != nil {
		fmt.Printf("Warning: Could not drop old index: %v\n", err)
	}

	// Create the new composite unique index
	return db.Exec(`
		CREATE UNIQUE INDEX IF NOT EXISTS "idx_user_account_number" 
		ON "ledger_account" ("user_id", "account_number")
	`).Error
}
