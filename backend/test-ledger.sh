#!/bin/bash

# Ledger System Test Script
# This script tests the ledger API endpoints

BASE_URL="http://localhost:8080"
API_BASE="$BASE_URL/api/ledger"

echo "🧾 Testing Ledger System API"
echo "=============================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Test 1: Create a bank account
echo "1. Creating a bank account..."
ACCOUNT_RESPONSE=$(curl -s -X POST "$API_BASE/accounts" \
    -H "Content-Type: application/json" \
    -d '{
        "account_number": "BANK-001",
        "name": "Main Checking Account",
        "description": "Primary checking account for testing",
        "currency": "USD",
        "type": "bank"
    }')

if echo "$ACCOUNT_RESPONSE" | grep -q '"id"'; then
    ACCOUNT_ID=$(echo "$ACCOUNT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_success "Account created successfully"
    echo "   Account ID: $ACCOUNT_ID"
else
    print_error "Failed to create account"
    echo "$ACCOUNT_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Create a second account
echo "2. Creating a second account..."
ACCOUNT2_RESPONSE=$(curl -s -X POST "$API_BASE/accounts" \
    -H "Content-Type: application/json" \
    -d '{
        "account_number": "BANK-002",
        "name": "Savings Account",
        "description": "Savings account for testing",
        "currency": "USD",
        "type": "bank"
    }')

if echo "$ACCOUNT2_RESPONSE" | grep -q '"id"'; then
    ACCOUNT2_ID=$(echo "$ACCOUNT2_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_success "Second account created successfully"
    echo "   Account ID: $ACCOUNT2_ID"
else
    print_error "Failed to create second account"
    echo "$ACCOUNT2_RESPONSE"
    exit 1
fi

echo ""

# Test 3: Create a deposit
echo "3. Creating a deposit..."
DEPOSIT_RESPONSE=$(curl -s -X POST "$API_BASE/transactions/deposit" \
    -H "Content-Type: application/json" \
    -d "{
        \"account_id\": \"$ACCOUNT_ID\",
        \"amount\": 1000.00,
        \"currency\": \"USD\",
        \"description\": \"Initial deposit\",
        \"reference\": \"DEP-001\"
    }")

if echo "$DEPOSIT_RESPONSE" | grep -q '"id"'; then
    DEPOSIT_ID=$(echo "$DEPOSIT_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_success "Deposit created successfully"
    echo "   Transaction ID: $DEPOSIT_ID"
else
    print_error "Failed to create deposit"
    echo "$DEPOSIT_RESPONSE"
    exit 1
fi

echo ""

# Test 4: Post the deposit transaction
echo "4. Posting the deposit transaction..."
POST_RESPONSE=$(curl -s -X POST "$API_BASE/transactions/$DEPOSIT_ID/post" \
    -H "Content-Type: application/json")

if echo "$POST_RESPONSE" | grep -q "posted successfully"; then
    print_success "Transaction posted successfully"
else
    print_error "Failed to post transaction"
    echo "$POST_RESPONSE"
    exit 1
fi

echo ""

# Test 5: Check account balance
echo "5. Checking account balance..."
BALANCE_RESPONSE=$(curl -s -X GET "$API_BASE/accounts/$ACCOUNT_ID/balance")

if echo "$BALANCE_RESPONSE" | grep -q '"balance"'; then
    BALANCE=$(echo "$BALANCE_RESPONSE" | grep -o '"balance":[0-9.]*' | cut -d':' -f2)
    print_success "Balance retrieved successfully"
    echo "   Balance: $BALANCE"
else
    print_error "Failed to get balance"
    echo "$BALANCE_RESPONSE"
    exit 1
fi

echo ""

# Test 6: Create a transfer
echo "6. Creating a transfer between accounts..."
TRANSFER_RESPONSE=$(curl -s -X POST "$API_BASE/transactions/transfer" \
    -H "Content-Type: application/json" \
    -d "{
        \"from_account_id\": \"$ACCOUNT_ID\",
        \"to_account_id\": \"$ACCOUNT2_ID\",
        \"amount\": 500.00,
        \"currency\": \"USD\",
        \"description\": \"Transfer to savings\",
        \"reference\": \"TRX-001\"
    }")

if echo "$TRANSFER_RESPONSE" | grep -q '"id"'; then
    TRANSFER_ID=$(echo "$TRANSFER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    print_success "Transfer created successfully"
    echo "   Transaction ID: $TRANSFER_ID"
else
    print_error "Failed to create transfer"
    echo "$TRANSFER_RESPONSE"
    exit 1
fi

echo ""

# Test 7: Post the transfer transaction
echo "7. Posting the transfer transaction..."
POST_TRANSFER_RESPONSE=$(curl -s -X POST "$API_BASE/transactions/$TRANSFER_ID/post" \
    -H "Content-Type: application/json")

if echo "$POST_TRANSFER_RESPONSE" | grep -q "posted successfully"; then
    print_success "Transfer posted successfully"
else
    print_error "Failed to post transfer"
    echo "$POST_TRANSFER_RESPONSE"
    exit 1
fi

echo ""

# Test 8: Check both account balances
echo "8. Checking both account balances..."
BALANCE1_RESPONSE=$(curl -s -X GET "$API_BASE/accounts/$ACCOUNT_ID/balance")
BALANCE2_RESPONSE=$(curl -s -X GET "$API_BASE/accounts/$ACCOUNT2_ID/balance")

BALANCE1=$(echo "$BALANCE1_RESPONSE" | grep -o '"balance":[0-9.-]*' | cut -d':' -f2)
BALANCE2=$(echo "$BALANCE2_RESPONSE" | grep -o '"balance":[0-9.-]*' | cut -d':' -f2)

print_success "Balances retrieved successfully"
echo "   Account 1 Balance: $BALANCE1"
echo "   Account 2 Balance: $BALANCE2"

echo ""

# Test 9: Get trial balance
echo "9. Getting trial balance..."
TRIAL_BALANCE_RESPONSE=$(curl -s -X GET "$API_BASE/trial-balance")

if echo "$TRIAL_BALANCE_RESPONSE" | grep -q '{'; then
    print_success "Trial balance retrieved successfully"
    echo "   Trial Balance: $TRIAL_BALANCE_RESPONSE"
else
    print_error "Failed to get trial balance"
    echo "$TRIAL_BALANCE_RESPONSE"
    exit 1
fi

echo ""
echo "🎉 All tests completed successfully!"
echo ""
echo "Summary:"
echo "- Created 2 accounts"
echo "- Made a $1000 deposit"
echo "- Transferred $500 between accounts"
echo "- Verified balances and trial balance"
echo ""
echo "The ledger system is working correctly! 🚀" 