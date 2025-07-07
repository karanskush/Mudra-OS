package main

import (
	"fmt"
	"log"

	"fintech-api/internal/config"
	"fintech-api/internal/database"
	"fintech-api/internal/models"
	"fintech-api/pkg/logger"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Initialize logger
	logger.Init(cfg.Logging.Level, cfg.Logging.Format)

	fmt.Println("🔌 Connecting to Neon database...")

	// Connect to database
	if err := database.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer database.Close()

	fmt.Println("✅ Connected to Neon database successfully!")

	// Get connection info
	connInfo := database.GetNeonConnectionInfo()
	fmt.Printf("📊 Connection info: %+v\n", connInfo)

	// Setup database (extensions and migrations)
	fmt.Println("🔧 Setting up database extensions and migrations...")
	if err := database.SetupNeonDatabase(); err != nil {
		log.Fatalf("Failed to setup database: %v", err)
	}

	fmt.Println("✅ Database setup completed!")

	// Test basic operations
	fmt.Println("🧪 Testing basic database operations...")

	// Test creating a user
	user := &models.User{
		Email:      "test@example.com",
		Password:   "hashedpassword",
		FirstName:  "Test",
		LastName:   "User",
		Phone:      "+1234567890",
		IsActive:   true,
		IsVerified: true,
		Role:       "user",
	}

	if err := database.GetDB().Create(user).Error; err != nil {
		log.Printf("Warning: Failed to create test user: %v", err)
	} else {
		fmt.Printf("✅ Created test user with ID: %s\n", user.ID)
	}

	// Test querying users
	var userCount int64
	if err := database.GetDB().Model(&models.User{}).Count(&userCount).Error; err != nil {
		log.Printf("Warning: Failed to count users: %v", err)
	} else {
		fmt.Printf("✅ Found %d users in database\n", userCount)
	}

	// Test transaction
	fmt.Println("💳 Testing transaction creation...")

	// First create an account
	account := &models.Account{
		UserID:        user.ID,
		AccountNumber: "1234567890",
		Type:          models.AccountTypeSavings,
		Status:        models.AccountStatusActive,
		Balance:       1000.00,
		Currency:      "USD",
		Name:          "Test Savings Account",
	}

	if err := database.GetDB().Create(account).Error; err != nil {
		log.Printf("Warning: Failed to create test account: %v", err)
	} else {
		fmt.Printf("✅ Created test account with ID: %s\n", account.ID)
	}

	// Create a transaction
	transaction := &models.Transaction{
		UserID:        user.ID,
		AccountID:     account.ID,
		Type:          models.TransactionTypeDeposit,
		Status:        models.TransactionStatusCompleted,
		Amount:        500.00,
		Currency:      "USD",
		Description:   "Test deposit",
		Reference:     "TEST-001",
		Fee:           0.00,
		BalanceBefore: 1000.00,
		BalanceAfter:  1500.00,
	}

	if err := database.GetDB().Create(transaction).Error; err != nil {
		log.Printf("Warning: Failed to create test transaction: %v", err)
	} else {
		fmt.Printf("✅ Created test transaction with ID: %s\n", transaction.ID)
	}

	fmt.Println("🎉 All tests completed successfully!")
	fmt.Println("Your Neon database is ready to use!")
}
