# Double-Entry Ledger Implementation

This document describes the implementation of a double-entry accounting system with multi-currency support for the fintech backend.

## Overview

The ledger system implements proper double-entry accounting principles where every financial transaction creates at least two entries that balance out (total debits = total credits). This ensures data integrity and provides a complete audit trail of all financial activities.

## Database Schema

### 1. LedgerAccount Table

Represents accounts in the double-entry system with the following fields:

- `id` (UUID, Primary Key): Unique identifier for the account
- `user_id` (UUID, Foreign Key): Reference to the user who owns this account
- `account_number` (String, Unique): Human-readable account number
- `type` (Enum): Account type (asset, liability, equity, revenue, expense)
- `status` (Enum): Account status (active, inactive, suspended, closed)
- `currency` (String): Currency code for the account (e.g., USD, EUR, GBP)
- `name` (String): Account name
- `description` (String): Account description
- `parent_id` (UUID, Optional): Reference to parent account for hierarchical structure
- `is_system` (Boolean): Indicates if this is a system account
- `created_at`, `updated_at`, `deleted_at` (Timestamps): Standard audit fields

### 2. LedgerTransaction Table

Represents a complete double-entry transaction:

- `id` (UUID, Primary Key): Unique identifier for the transaction
- `user_id` (UUID, Foreign Key): Reference to the user who created the transaction
- `type` (Enum): Transaction type (transfer, payment, deposit, withdrawal, etc.)
- `status` (Enum): Transaction status (pending, posted, reversed, cancelled)
- `description` (String): Transaction description
- `reference` (String, Unique): External reference number
- `total_amount` (Float): Total transaction amount
- `currency` (String): Transaction currency
- `exchange_rate` (Float): Exchange rate to base currency
- `base_currency` (String): Base currency for reporting
- `base_amount` (Float): Amount in base currency
- `posted_at` (Timestamp, Optional): When the transaction was posted
- `timestamp` (Timestamp): Transaction timestamp
- `created_at`, `updated_at`, `deleted_at` (Timestamps): Standard audit fields

### 3. LedgerEntry Table

Represents individual debit and credit entries within a transaction:

- `id` (UUID, Primary Key): Unique identifier for the entry
- `transaction_id` (UUID, Foreign Key): Reference to the parent transaction
- `debit_account_id` (UUID, Foreign Key): Account being debited
- `credit_account_id` (UUID, Foreign Key): Account being credited
- `amount` (Float): Entry amount
- `currency` (String): Entry currency
- `entry_type` (Enum): Entry type (debit or credit)
- `description` (String): Entry description
- `reference` (String): Entry reference
- `exchange_rate` (Float): Exchange rate for this entry
- `base_currency` (String): Base currency
- `base_amount` (Float): Amount in base currency
- `timestamp` (Timestamp): Entry timestamp
- `created_at`, `updated_at`, `deleted_at` (Timestamps): Standard audit fields

## Account Types

### Asset Accounts (Debit Balance)
- `asset`: General asset account
- `cash`: Cash on hand
- `bank`: Bank account
- `receivable`: Accounts receivable
- `investment`: Investment accounts

### Liability Accounts (Credit Balance)
- `liability`: General liability account
- `payable`: Accounts payable
- `loan`: Loan accounts
- `credit`: Credit card accounts

### Equity Accounts (Credit Balance)
- `equity`: General equity account
- `capital`: Owner's capital
- `retained_earnings`: Retained earnings

### Revenue Accounts (Credit Balance)
- `revenue`: General revenue account
- `income`: Income accounts
- `gain`: Gain accounts

### Expense Accounts (Debit Balance)
- `expense`: General expense account
- `loss`: Loss accounts
- `fee`: Fee accounts

## Transaction Types

- `transfer`: Transfer between accounts
- `payment`: Payment to external party
- `deposit`: Cash deposit
- `withdrawal`: Cash withdrawal
- `exchange`: Currency exchange
- `adjustment`: Balance adjustment
- `fee`: Fee transaction
- `interest`: Interest transaction
- `refund`: Refund transaction

## Key Features

### 1. Double-Entry Validation
Every transaction must have balanced debits and credits. The system validates this before allowing transactions to be posted.

### 2. Multi-Currency Support
- Each account is associated with a specific currency
- Transactions can involve currency conversion
- Exchange rates are stored for audit purposes
- Base currency amounts are calculated for reporting

### 3. Account Hierarchy
Accounts can have parent-child relationships for better organization and reporting.

### 4. System Accounts
Special system accounts are created for internal operations like deposits, withdrawals, and fees.

### 5. Transaction Status Management
- `pending`: Transaction created but not yet posted
- `posted`: Transaction has been posted to the ledger
- `reversed`: Transaction has been reversed
- `cancelled`: Transaction has been cancelled

## API Endpoints

### Account Management
- `POST /api/ledger/accounts` - Create a new ledger account
- `GET /api/ledger/accounts/:id/balance` - Get account balance
- `GET /api/ledger/accounts/:id/transactions` - Get account transactions

### Transaction Management
- `POST /api/ledger/transactions/transfer` - Create a transfer transaction
- `POST /api/ledger/transactions/deposit` - Create a deposit transaction
- `POST /api/ledger/transactions/:id/post` - Post a transaction
- `GET /api/ledger/trial-balance` - Get trial balance

## Usage Examples

### Creating a Bank Account
```json
POST /api/ledger/accounts
{
  "account_number": "BANK-001",
  "name": "Main Checking Account",
  "description": "Primary checking account",
  "currency": "USD",
  "type": "bank"
}
```

### Creating a Transfer
```json
POST /api/ledger/transactions/transfer
{
  "from_account_id": "uuid-of-source-account",
  "to_account_id": "uuid-of-destination-account",
  "amount": 1000.00,
  "currency": "USD",
  "description": "Transfer to savings",
  "reference": "TRX-001"
}
```

### Creating a Deposit
```json
POST /api/ledger/transactions/deposit
{
  "account_id": "uuid-of-account",
  "amount": 500.00,
  "currency": "USD",
  "description": "Cash deposit",
  "reference": "DEP-001"
}
```

## Database Indexes

The following indexes are created for optimal performance:

### LedgerAccount Indexes
- `idx_ledger_account_user_id` - User ID lookup
- `idx_ledger_account_type` - Account type filtering
- `idx_ledger_account_status` - Status filtering
- `idx_ledger_account_currency` - Currency filtering
- `idx_ledger_account_parent_id` - Parent account lookup

### LedgerTransaction Indexes
- `idx_ledger_transaction_user_id` - User ID lookup
- `idx_ledger_transaction_type` - Transaction type filtering
- `idx_ledger_transaction_status` - Status filtering
- `idx_ledger_transaction_timestamp` - Time-based queries
- `idx_ledger_transaction_currency` - Currency filtering

### LedgerEntry Indexes
- `idx_ledger_entry_transaction_id` - Transaction lookup
- `idx_ledger_entry_debit_account_id` - Debit account lookup
- `idx_ledger_entry_credit_account_id` - Credit account lookup
- `idx_ledger_entry_timestamp` - Time-based queries
- `idx_ledger_entry_currency` - Currency filtering
- `idx_ledger_entry_type` - Entry type filtering

## Foreign Key Constraints

- `ledger_account.user_id` → `user.id` (CASCADE)
- `ledger_account.parent_id` → `ledger_account.id` (SET NULL)
- `ledger_transaction.user_id` → `user.id` (CASCADE)
- `ledger_entry.transaction_id` → `ledger_transaction.id` (CASCADE)
- `ledger_entry.debit_account_id` → `ledger_account.id` (RESTRICT)
- `ledger_entry.credit_account_id` → `ledger_account.id` (RESTRICT)

## Security Considerations

1. **User Isolation**: All accounts and transactions are scoped to specific users
2. **Input Validation**: All inputs are validated before processing
3. **Transaction Integrity**: Database transactions ensure data consistency
4. **Audit Trail**: All changes are tracked with timestamps and user information

## Future Enhancements

1. **Currency Conversion**: Implement real-time exchange rates and automatic conversion
2. **Batch Processing**: Support for batch transactions
3. **Advanced Reporting**: Financial statements, profit/loss, balance sheet
4. **Reconciliation**: Bank statement reconciliation features
5. **Audit Logging**: Detailed audit trail for compliance
6. **API Rate Limiting**: Protect against abuse
7. **Webhooks**: Notifications for transaction events

## Testing

The ledger system should be thoroughly tested with:

1. **Unit Tests**: Individual service methods
2. **Integration Tests**: API endpoints
3. **Balance Tests**: Ensure debits always equal credits
4. **Currency Tests**: Multi-currency scenarios
5. **Concurrency Tests**: Multiple simultaneous transactions
6. **Error Handling Tests**: Invalid inputs and edge cases

## Migration

To set up the ledger system:

1. Run the database migrations
2. Create system accounts for each user
3. Initialize the ledger service
4. Set up API routes
5. Test with sample transactions

```go
// Example migration setup
err := database.MigrateLedgerTables(db)
if err != nil {
    log.Fatal(err)
}

// Create system accounts for a user
err = database.CreateSystemAccounts(db, userID)
if err != nil {
    log.Fatal(err)
}
``` 