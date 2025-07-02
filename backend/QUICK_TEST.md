# 🚀 Quick Test Guide

## Start Testing in 3 Steps

### 1. Start the Server
```bash
cd backend
go run main.go
```

### 2. Open Test Interface
Go to: `http://localhost:8080/ledger-test.html`

### 3. Run Tests
```bash
# In another terminal
cd backend
./test-ledger.sh
```

## 🎯 What You Can Test

### Web Interface Features:
- ✅ Create bank accounts
- ✅ Make deposits
- ✅ Transfer between accounts
- ✅ Check balances
- ✅ View trial balance
- ✅ Auto-generate UUIDs

### API Endpoints:
- `POST /api/ledger/accounts` - Create account
- `POST /api/ledger/transactions/transfer` - Transfer money
- `POST /api/ledger/transactions/deposit` - Make deposit
- `GET /api/ledger/accounts/{id}/balance` - Get balance
- `GET /api/ledger/trial-balance` - Get trial balance

## 📊 Expected Results

After running the test script:
- Account 1 Balance: `500.00`
- Account 2 Balance: `500.00`
- Trial Balance: `0.00` (balanced)

## 🆘 Need Help?

1. Check server logs for errors
2. Verify database connection
3. Read the full testing guide: `docs/TESTING_GUIDE.md`

Happy testing! 🎉 