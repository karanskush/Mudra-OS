# 🧪 Ledger System Testing Guide

This guide will help you test the double-entry ledger system on your website. You can test it using the web interface, command line, or API calls.

## 🚀 Quick Start

### 1. Start Your Backend Server

```bash
cd backend
go run main.go
```

Your server should start on `http://localhost:8080` (or whatever port you've configured).

### 2. Access the Test Interface

Open your browser and go to:
```
http://localhost:8080/ledger-test.html
```

This will show you a beautiful web interface to test all the ledger functionality!

## 📋 Testing Methods

### Method 1: Web Interface (Recommended)

The web interface at `/ledger-test.html` provides:

- ✅ **Create Accounts** - Test different account types
- ✅ **Create Transfers** - Move money between accounts
- ✅ **Create Deposits** - Add money to accounts
- ✅ **Check Balances** - View account balances
- ✅ **Trial Balance** - See overall system balance
- ✅ **UUID Generation** - Auto-generate account IDs for testing

### Method 2: Command Line Script

Run the automated test script:

```bash
cd backend
./test-ledger.sh
```

This script will:
1. Create two test accounts
2. Make a $1000 deposit
3. Transfer $500 between accounts
4. Verify balances
5. Check trial balance

### Method 3: Manual API Testing

Use curl or any API testing tool (Postman, Insomnia, etc.):

#### Create an Account
```bash
curl -X POST http://localhost:8080/api/ledger/accounts \
  -H "Content-Type: application/json" \
  -d '{
    "account_number": "TEST-001",
    "name": "Test Account",
    "description": "Test account for ledger",
    "currency": "USD",
    "type": "bank"
  }'
```

#### Create a Transfer
```bash
curl -X POST http://localhost:8080/api/ledger/transactions/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "from_account_id": "ACCOUNT-UUID-HERE",
    "to_account_id": "ACCOUNT-UUID-HERE",
    "amount": 100.00,
    "currency": "USD",
    "description": "Test transfer",
    "reference": "TRX-001"
  }'
```

#### Get Account Balance
```bash
curl -X GET http://localhost:8080/api/ledger/accounts/ACCOUNT-UUID-HERE/balance
```

## 🧪 Step-by-Step Testing

### Step 1: Create Test Accounts

1. Open the web interface
2. Fill in the "Create Account" form:
   - Account Number: `BANK-001`
   - Name: `Main Checking Account`
   - Description: `Primary checking account`
   - Currency: `USD`
   - Type: `bank`
3. Click "Create Account"
4. Copy the returned account ID
5. Repeat for a second account (e.g., `BANK-002`)

### Step 2: Make a Deposit

1. Use the "Create Deposit" form
2. Enter the account ID from Step 1
3. Set amount to `1000.00`
4. Click "Create Deposit"
5. Copy the transaction ID

### Step 3: Post the Transaction

1. Use the transaction ID from Step 2
2. Make a POST request to:
   ```
   POST /api/ledger/transactions/{transaction-id}/post
   ```

### Step 4: Check Balance

1. Use the "Get Account Balance" form
2. Enter the account ID
3. Verify the balance shows `1000.00`

### Step 5: Create a Transfer

1. Use the "Create Transfer" form
2. Enter both account IDs
3. Set amount to `500.00`
4. Click "Create Transfer"
5. Post the transaction

### Step 6: Verify Balances

1. Check both account balances
2. Account 1 should show `500.00`
3. Account 2 should show `500.00`

### Step 7: Check Trial Balance

1. Click "Get Trial Balance"
2. Verify the system is balanced (total debits = total credits)

## 🔍 What to Look For

### ✅ Success Indicators

- **Account Creation**: Returns account object with UUID
- **Transaction Creation**: Returns transaction object with entries
- **Balance Calculation**: Shows correct balance based on account type
- **Double-Entry Validation**: Transactions must have balanced debits/credits
- **Trial Balance**: All accounts should balance to zero

### ❌ Common Issues

1. **Account Not Found**: Check if account ID is correct
2. **Currency Mismatch**: Ensure accounts use same currency
3. **Invalid Account Type**: Use valid account types (bank, cash, asset, etc.)
4. **Transaction Not Posted**: Remember to post transactions after creation

## 📊 Expected Results

### Account Types and Balances

| Account Type | Normal Balance | Example |
|--------------|----------------|---------|
| Asset/Bank/Cash | Debit | +1000.00 |
| Liability | Credit | -500.00 |
| Equity | Credit | -500.00 |
| Revenue | Credit | -100.00 |
| Expense | Debit | +100.00 |

### Sample Transaction Flow

1. **Create Account**: `BANK-001` (Asset account)
2. **Deposit $1000**: 
   - Debit: BANK-001 (+1000.00)
   - Credit: System Cash (-1000.00)
3. **Transfer $500**:
   - Debit: BANK-002 (+500.00)
   - Credit: BANK-001 (-500.00)
4. **Final Balances**:
   - BANK-001: +500.00
   - BANK-002: +500.00
   - System Cash: -1000.00
   - **Total**: 0.00 ✅

## 🛠️ Troubleshooting

### Database Issues

If you get database errors:

1. **Check Database Connection**:
   ```bash
   curl http://localhost:8080/health
   ```

2. **Verify Migrations**:
   - Check that ledger tables were created
   - Look for migration errors in server logs

3. **Reset Database** (if needed):
   ```sql
   DROP TABLE IF EXISTS ledger_entry;
   DROP TABLE IF EXISTS ledger_transaction;
   DROP TABLE IF EXISTS ledger_account;
   ```

### API Issues

1. **Check Server Logs**: Look for error messages
2. **Verify Endpoints**: Test with simple GET requests first
3. **Check CORS**: Ensure your frontend can access the API
4. **Validate JSON**: Use proper JSON format in requests

### Common Error Messages

- `"account not found"` → Check account ID
- `"transaction is not balanced"` → Debits must equal credits
- `"currency conversion not yet implemented"` → Use same currency
- `"one or both accounts are not active"` → Check account status

## 🎯 Advanced Testing

### Test Multi-Currency Support

1. Create accounts in different currencies (USD, EUR, GBP)
2. Verify currency validation works
3. Test currency conversion (future feature)

### Test Account Hierarchy

1. Create parent accounts
2. Create child accounts with parent_id
3. Test hierarchical reporting

### Test Transaction Types

1. Test all transaction types:
   - Transfer
   - Deposit
   - Withdrawal
   - Payment
   - Fee
   - Interest

### Test Edge Cases

1. **Zero Amount**: Should be rejected
2. **Negative Amount**: Should be rejected
3. **Same Account Transfer**: Should be rejected
4. **Invalid Account Types**: Should be rejected
5. **Missing Required Fields**: Should return validation errors

## 📈 Performance Testing

### Load Testing

Use tools like Apache Bench or wrk:

```bash
# Test account creation
ab -n 100 -c 10 -p account.json -T application/json http://localhost:8080/api/ledger/accounts

# Test balance queries
ab -n 1000 -c 50 http://localhost:8080/api/ledger/accounts/{account-id}/balance
```

### Database Performance

Monitor query performance:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename LIKE 'ledger_%'
ORDER BY idx_scan DESC;
```

## 🎉 Success Criteria

Your ledger system is working correctly if:

1. ✅ **Accounts can be created** with proper validation
2. ✅ **Transactions are balanced** (debits = credits)
3. ✅ **Balances are calculated correctly** based on account type
4. ✅ **Trial balance equals zero** (system integrity)
5. ✅ **API responses are consistent** and well-formed
6. ✅ **Error handling works** for invalid inputs
7. ✅ **Database constraints are enforced** (foreign keys, unique indexes)

## 🚀 Next Steps

Once testing is complete:

1. **Integrate with Frontend**: Connect to your main application
2. **Add Authentication**: Implement proper user authentication
3. **Add Authorization**: Ensure users can only access their accounts
4. **Implement Currency Conversion**: Add real-time exchange rates
5. **Add Reporting**: Create financial statements and reports
6. **Add Audit Logging**: Track all changes for compliance
7. **Performance Optimization**: Add caching and query optimization

## 📞 Support

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your database connection and migrations
3. Test with the provided web interface first
4. Use the test script to validate basic functionality
5. Review the API documentation for correct request formats

Happy testing! 🎯 