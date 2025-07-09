package main

import (
	"fintech-backend/internal/database"
	"fintech-backend/internal/models"
	"fintech-backend/internal/services"
	"fmt"
	"log"

	"github.com/google/uuid"
)

func main() {
	// Initialize database
	db := database.GetDB()
	if db == nil {
		log.Fatal("Failed to initialize database")
	}

	// Run migrations
	if err := database.MigrateLedgerTables(db); err != nil {
		log.Fatalf("Failed to migrate ledger tables: %v", err)
	}

	// Create ledger service
	ledgerService := services.NewLedgerService(db)

	// Create a test user ID
	testUserID := uuid.New()

	// Create test accounts
	fmt.Println("Creating test accounts...")

	// Create a cash account
	cashAccount, err := ledgerService.CreateAccount(
		testUserID,
		"CASH-001",
		"Test Cash Account",
		"Test cash account for balance verification",
		"USD",
		models.LedgerAccountTypeCash,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to create cash account: %v", err)
	}
	fmt.Printf("Created cash account: %s (Balance: %.2f)\n", cashAccount.Name, cashAccount.Balance)

	// Create a bank account
	bankAccount, err := ledgerService.CreateAccount(
		testUserID,
		"BANK-001",
		"Test Bank Account",
		"Test bank account for balance verification",
		"USD",
		models.LedgerAccountTypeBank,
		nil,
	)
	if err != nil {
		log.Fatalf("Failed to create bank account: %v", err)
	}
	fmt.Printf("Created bank account: %s (Balance: %.2f)\n", bankAccount.Name, bankAccount.Balance)

	// Test deposit to cash account
	fmt.Println("\nTesting deposit to cash account...")
	depositTransaction, err := ledgerService.CreateDeposit(
		testUserID,
		cashAccount.ID,
		1000.00,
		"USD",
		"Initial deposit",
		"DEP-001",
	)
	if err != nil {
		log.Fatalf("Failed to create deposit: %v", err)
	}
	fmt.Printf("Created deposit transaction: %s (Amount: %.2f)\n", depositTransaction.ID, depositTransaction.TotalAmount)

	// Check updated balance
	updatedCashAccount, err := ledgerService.GetAccounts(testUserID)
	if err != nil {
		log.Fatalf("Failed to get accounts: %v", err)
	}

	for _, account := range updatedCashAccount {
		if account.ID == cashAccount.ID {
			fmt.Printf("Cash account balance after deposit: %.2f\n", account.Balance)
			break
		}
	}

	// Test transfer from cash to bank
	fmt.Println("\nTesting transfer from cash to bank...")
	transferResult, err := ledgerService.CreateTransfer(
		testUserID,
		cashAccount.ID,
		bankAccount.ID,
		500.00,
		"USD",
		"Transfer to bank",
		"TRF-001",
	)
	if err != nil {
		log.Fatalf("Failed to create transfer: %v", err)
	}
	fmt.Printf("Created transfer: %v\n", transferResult)

	// Check final balances
	finalAccounts, err := ledgerService.GetAccounts(testUserID)
	if err != nil {
		log.Fatalf("Failed to get final accounts: %v", err)
	}

	fmt.Println("\nFinal account balances:")
	for _, account := range finalAccounts {
		fmt.Printf("- %s: %.2f %s\n", account.Name, account.Balance, account.Currency)
	}

	// Test transaction history
	fmt.Println("\nTransaction history:")
	history, err := ledgerService.GetTransactionHistory(testUserID, 10, 0)
	if err != nil {
		log.Fatalf("Failed to get transaction history: %v", err)
	}

	for _, tx := range history {
		fmt.Printf("- %s: %s (%.2f %s)\n", tx.ID, tx.Description, tx.TotalAmount, tx.Currency)
	}

	fmt.Println("\nTest completed successfully!")
}
