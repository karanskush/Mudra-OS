# Ledger System Integration Guide

This guide explains how to integrate the double-entry ledger system into the main fintech application.

## Overview

The ledger system provides a robust foundation for financial transactions with proper double-entry accounting principles. This guide shows how to integrate it into your existing application.

## Integration Steps

### 1. Update Main Application

Add the ledger service to your main application setup:

```go
// main.go or your application setup file
package main

import (
    "fintech-api/internal/database"
    "fintech-api/internal/services"
    "fintech-api/internal/handlers"
    "fintech-api/internal/models"
)

func setupLedgerSystem(db *gorm.DB) (*services.LedgerService, *handlers.LedgerHandler) {
    // Initialize ledger service
    ledgerService := services.NewLedgerService(db)
    
    // Initialize ledger handler
    ledgerHandler := handlers.NewLedgerHandler(ledgerService)
    
    return ledgerService, ledgerHandler
}

func main() {
    // ... existing setup code ...
    
    // Setup database
    db := database.GetDB()
    
    // Setup ledger system
    ledgerService, ledgerHandler := setupLedgerSystem(db)
    
    // Run ledger migrations
    if err := database.MigrateLedgerTables(db); err != nil {
        log.Fatal("Failed to migrate ledger tables:", err)
    }
    
    // ... rest of your application setup ...
}
```

### 2. Add API Routes

Add the ledger routes to your router setup:

```go
// In your router setup file
func setupLedgerRoutes(router *gin.Engine, ledgerHandler *handlers.LedgerHandler) {
    ledger := router.Group("/api/ledger")
    {
        // Account management
        ledger.POST("/accounts", ledgerHandler.CreateAccount)
        ledger.GET("/accounts/:id/balance", ledgerHandler.GetAccountBalance)
        ledger.GET("/accounts/:id/transactions", ledgerHandler.GetAccountTransactions)
        
        // Transaction management
        ledger.POST("/transactions/transfer", ledgerHandler.CreateTransfer)
        ledger.POST("/transactions/deposit", ledgerHandler.CreateDeposit)
        ledger.POST("/transactions/:id/post", ledgerHandler.PostTransaction)
        
        // Reporting
        ledger.GET("/trial-balance", ledgerHandler.GetTrialBalance)
    }
}
```

### 3. Initialize System Accounts

Create system accounts for each user when they register:

```go
// In your user registration handler
func (h *UserHandler) Register(c *gin.Context) {
    // ... existing user creation code ...
    
    // Create system accounts for the new user
    if err := database.CreateSystemAccounts(db, user.ID); err != nil {
        log.Printf("Failed to create system accounts for user %s: %v", user.ID, err)
        // Don't fail the registration, but log the error
    }
    
    // ... rest of registration code ...
}
```

### 4. Update Existing Transaction Logic

Replace or enhance your existing transaction logic to use the ledger system:

```go
// Example: Enhanced transfer logic
func (h *AccountHandler) Transfer(c *gin.Context) {
    // ... existing validation code ...
    
    // Create ledger transaction instead of simple balance update
    transaction, err := h.ledgerService.CreateTransfer(
        userID,
        fromAccountID,
        toAccountID,
        amount,
        currency,
        description,
        reference,
    )
    
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    // Post the transaction
    if err := h.ledgerService.PostTransaction(transaction.ID); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    
    c.JSON(http.StatusOK, transaction)
}
```

## Migration from Existing System

If you have an existing transaction system, here's how to migrate:

### 1. Data Migration

Create a migration script to convert existing transactions:

```go
// migration/ledger_migration.go
func MigrateExistingTransactions(db *gorm.DB) error {
    var oldTransactions []models.Transaction
    
    // Get existing transactions
    if err := db.Find(&oldTransactions).Error; err != nil {
        return err
    }
    
    ledgerService := services.NewLedgerService(db)
    
    for _, oldTx := range oldTransactions {
        // Convert old transaction to ledger format
        entries := []models.LedgerEntry{
            {
                DebitAccountID:  oldTx.AccountID,
                CreditAccountID: uuid.Nil, // System account
                Amount:          oldTx.Amount,
                Currency:        oldTx.Currency,
                EntryType:       getEntryType(oldTx.Type),
                Description:     oldTx.Description,
                Reference:       oldTx.Reference,
                Timestamp:       oldTx.CreatedAt,
            },
        }
        
        // Create ledger transaction
        _, err := ledgerService.CreateTransaction(
            oldTx.UserID,
            convertTransactionType(oldTx.Type),
            oldTx.Description,
            oldTx.Reference,
            entries,
        )
        
        if err != nil {
            log.Printf("Failed to migrate transaction %s: %v", oldTx.ID, err)
            continue
        }
    }
    
    return nil
}
```

### 2. Gradual Rollout

1. **Phase 1**: Run both systems in parallel
2. **Phase 2**: Route new transactions through ledger system
3. **Phase 3**: Migrate historical data
4. **Phase 4**: Deprecate old system

## Configuration

Add ledger-specific configuration to your config file:

```go
// config/config.go
type Config struct {
    // ... existing fields ...
    
    Ledger struct {
        BaseCurrency string `env:"LEDGER_BASE_CURRENCY" envDefault:"USD"`
        DefaultCurrency string `env:"LEDGER_DEFAULT_CURRENCY" envDefault:"USD"`
        EnableAuditLog bool `env:"LEDGER_ENABLE_AUDIT_LOG" envDefault:"true"`
    }
}
```

## Environment Variables

Add these environment variables to your `.env` file:

```env
# Ledger Configuration
LEDGER_BASE_CURRENCY=USD
LEDGER_DEFAULT_CURRENCY=USD
LEDGER_ENABLE_AUDIT_LOG=true
```

## Testing

### 1. Unit Tests

Run the ledger service tests:

```bash
cd backend
go test ./internal/services -v
```

### 2. Integration Tests

Test the API endpoints:

```bash
# Start your application
go run main.go

# Test creating an account
curl -X POST http://localhost:8080/api/ledger/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "TEST-001",
    "name": "Test Account",
    "description": "Test account",
    "currency": "USD",
    "type": "bank"
  }'

# Test creating a transfer
curl -X POST http://localhost:8080/api/ledger/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "from_account_id": "uuid-1",
    "to_account_id": "uuid-2",
    "amount": 100.00,
    "currency": "USD",
    "description": "Test transfer",
    "reference": "TRX-001"
  }'
```

## Monitoring and Logging

Add logging to track ledger operations:

```go
// In your ledger service
func (ls *LedgerService) CreateTransaction(userID uuid.UUID, transactionType models.LedgerTransactionType, description, reference string, entries []models.LedgerEntry) (*models.LedgerTransaction, error) {
    logger.Info("Creating ledger transaction", 
        "user_id", userID,
        "type", transactionType,
        "reference", reference,
        "entry_count", len(entries))
    
    // ... existing code ...
    
    logger.Info("Ledger transaction created successfully",
        "transaction_id", transaction.ID,
        "total_amount", transaction.TotalAmount)
    
    return transaction, nil
}
```

## Performance Considerations

### 1. Database Indexes

The migration script creates necessary indexes, but monitor query performance:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename LIKE 'ledger_%'
ORDER BY idx_scan DESC;
```

### 2. Connection Pooling

Ensure your database connection pool is properly configured:

```go
// In your database setup
sqlDB.SetMaxIdleConns(10)
sqlDB.SetMaxOpenConns(100)
sqlDB.SetConnMaxLifetime(time.Hour)
```

### 3. Caching

Consider caching account balances for frequently accessed accounts:

```go
// Example with Redis caching
func (ls *LedgerService) GetAccountBalance(accountID uuid.UUID) (float64, error) {
    cacheKey := fmt.Sprintf("account_balance:%s", accountID)
    
    // Try cache first
    if cached, err := ls.cache.Get(cacheKey); err == nil {
        return strconv.ParseFloat(cached, 64)
    }
    
    // Calculate balance
    balance, err := ls.calculateBalance(accountID)
    if err != nil {
        return 0, err
    }
    
    // Cache for 5 minutes
    ls.cache.Set(cacheKey, fmt.Sprintf("%f", balance), 5*time.Minute)
    
    return balance, nil
}
```

## Security Considerations

### 1. Input Validation

All inputs are validated, but ensure your API layer also validates:

```go
// In your handlers
func (h *LedgerHandler) CreateTransfer(c *gin.Context) {
    var req CreateTransferRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }
    
    // Additional validation
    if req.Amount <= 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "amount must be positive"})
        return
    }
    
    if req.FromAccountID == req.ToAccountID {
        c.JSON(http.StatusBadRequest, gin.H{"error": "cannot transfer to same account"})
        return
    }
    
    // ... rest of handler
}
```

### 2. User Authorization

Ensure users can only access their own accounts:

```go
// Middleware to check account ownership
func AccountOwnershipMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        accountID := c.Param("id")
        userID := c.GetString("user_id")
        
        // Check if user owns the account
        var account models.LedgerAccount
        if err := db.Where("id = ? AND user_id = ?", accountID, userID).First(&account).Error; err != nil {
            c.JSON(http.StatusForbidden, gin.H{"error": "access denied"})
            c.Abort()
            return
        }
        
        c.Next()
    }
}
```

## Troubleshooting

### Common Issues

1. **Transaction Balance Errors**: Ensure all transactions have equal debits and credits
2. **Currency Mismatch**: Check that accounts have matching currencies for transfers
3. **Account Not Found**: Verify account IDs and user ownership
4. **Database Constraints**: Check foreign key constraints and unique indexes

### Debug Queries

```sql
-- Check transaction balance
SELECT 
    transaction_id,
    SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE 0 END) as total_debits,
    SUM(CASE WHEN entry_type = 'credit' THEN amount ELSE 0 END) as total_credits,
    SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END) as balance
FROM ledger_entry 
GROUP BY transaction_id
HAVING SUM(CASE WHEN entry_type = 'debit' THEN amount ELSE -amount END) != 0;

-- Check account balances
SELECT 
    la.account_number,
    la.name,
    la.type,
    COALESCE(SUM(CASE WHEN le.entry_type = 'debit' THEN le.amount ELSE 0 END), 0) as total_debits,
    COALESCE(SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE 0 END), 0) as total_credits,
    CASE 
        WHEN la.type IN ('asset', 'expense') THEN 
            COALESCE(SUM(CASE WHEN le.entry_type = 'debit' THEN le.amount ELSE 0 END), 0) - 
            COALESCE(SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE 0 END), 0)
        ELSE 
            COALESCE(SUM(CASE WHEN le.entry_type = 'credit' THEN le.amount ELSE 0 END), 0) - 
            COALESCE(SUM(CASE WHEN le.entry_type = 'debit' THEN le.amount ELSE 0 END), 0)
    END as balance
FROM ledger_account la
LEFT JOIN ledger_entry le ON la.id = le.debit_account_id OR la.id = le.credit_account_id
GROUP BY la.id, la.account_number, la.name, la.type
ORDER BY la.account_number;
```

## Next Steps

1. **Currency Conversion**: Implement real-time exchange rates
2. **Advanced Reporting**: Add financial statements and reports
3. **Batch Processing**: Support for bulk transactions
4. **Audit Trail**: Enhanced logging and compliance features
5. **API Documentation**: Generate OpenAPI/Swagger documentation
6. **Performance Optimization**: Add caching and query optimization
7. **Monitoring**: Add metrics and alerting for ledger operations 