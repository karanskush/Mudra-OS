# Ledger Balance Update Implementation

This document describes the implementation of automatic account balance updates in the ledger system.

## Overview

The ledger system now automatically updates account balances in the database after each transaction, providing better performance and consistency compared to calculating balances on-demand.

## Changes Made

### 1. Database Schema Updates

- **Added `balance` field** to `ledger_account` table
- **Migration script** to add the column and populate existing balances
- **Cached balance** for improved performance

### 2. Model Updates

#### LedgerAccount Model
- Added `Balance float64` field to store cached balance
- Updated `GetBalance()` method to return cached value
- Added `RecalculateBalance()` method to recalculate from entries
- Added `UpdateBalance()` method for incremental updates

### 3. Service Layer Updates

#### LedgerService
- **Automatic balance updates** after each transaction
- **Database transaction safety** - all operations wrapped in transactions
- **New methods** for transaction history and retrieval:
  - `GetTransactionHistory()`
  - `GetTransactionByID()`
  - `GetTransactionByReference()`

### 4. API Endpoints

#### New Endpoints
- `GET /api/ledger/transactions/history` - Get transaction history with pagination
- `GET /api/ledger/transactions/{id}` - Get specific transaction by ID

#### Updated Endpoints
- All transaction creation endpoints now automatically update account balances
- Balance queries now use cached values for better performance

## Database Migration

The migration automatically:
1. Adds the `balance` column to existing `ledger_account` table
2. Calculates and populates balances for all existing accounts
3. Ensures data consistency

## Testing

### Run the Test Script

```bash
cd backend/cmd/test-ledger-balance
go run main.go
```

This will:
1. Create test accounts
2. Perform deposits and transfers
3. Verify balance updates
4. Show transaction history

### Expected Output

```
Creating test accounts...
Created cash account: Test Cash Account (Balance: 0.00)
Created bank account: Test Bank Account (Balance: 0.00)

Testing deposit to cash account...
Created deposit transaction: [uuid] (Amount: 1000.00)
Cash account balance after deposit: 1000.00

Testing transfer from cash to bank...
Created transfer: [transfer result]

Final account balances:
- Test Cash Account: 500.00 USD
- Test Bank Account: 500.00 USD

Transaction history:
- [uuid]: Initial deposit (1000.00 USD)
- [uuid]: Transfer to bank (500.00 USD)

Test completed successfully!
```

## Benefits

### Performance
- **Faster balance queries** - no need to calculate from entries
- **Reduced database load** - fewer complex queries
- **Better scalability** - balances cached at account level

### Consistency
- **Atomic updates** - balances updated within transaction scope
- **Data integrity** - balances always reflect latest transactions
- **Audit trail** - full transaction history preserved

### Reliability
- **Automatic updates** - no manual balance maintenance required
- **Error handling** - proper rollback on transaction failures
- **Validation** - balance updates validated against account types

## API Usage Examples

### Get Transaction History
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/ledger/transactions/history?limit=10&offset=0"
```

### Get Specific Transaction
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:8080/api/ledger/transactions/<transaction-id>"
```

### Create Deposit (Balance Updated Automatically)
```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "account_id": "<account-id>",
    "amount": 1000.00,
    "currency": "USD",
    "description": "Initial deposit",
    "reference": "DEP-001"
  }' \
  "http://localhost:8080/api/ledger/transactions/deposit"
```

## Technical Details

### Balance Update Logic

For each transaction entry:
1. **Debit entries**: Increase debit account balance (for debit accounts) or decrease (for credit accounts)
2. **Credit entries**: Decrease credit account balance (for debit accounts) or increase (for credit accounts)

### Account Type Handling

- **Debit accounts** (Assets, Expenses): Balance increases with debits, decreases with credits
- **Credit accounts** (Liabilities, Equity, Revenue): Balance increases with credits, decreases with debits

### Transaction Safety

All balance updates are performed within database transactions to ensure:
- **Atomicity**: All updates succeed or fail together
- **Consistency**: Balances remain consistent with transaction entries
- **Isolation**: Concurrent transactions don't interfere
- **Durability**: Changes persist after transaction commit

## Future Enhancements

1. **Balance snapshots** for historical reporting
2. **Real-time balance notifications** via WebSocket
3. **Balance reconciliation** tools
4. **Multi-currency balance** support
5. **Balance change audit** logging 