-- Check for duplicate entries (same transaction, same accounts)
SELECT 
    transaction_id,
    debit_account_id,
    credit_account_id,
    amount,
    COUNT(*) as duplicate_count
FROM ledger_entry 
GROUP BY transaction_id, debit_account_id, credit_account_id, amount
HAVING COUNT(*) > 1;

-- Delete duplicate entries (keep only one entry per transaction)
WITH duplicates AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (
            PARTITION BY transaction_id, debit_account_id, credit_account_id, amount 
            ORDER BY created_at
        ) as rn
    FROM ledger_entry
)
DELETE FROM ledger_entry 
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- Show remaining entries for verification
SELECT 
    le.id,
    le.transaction_id,
    le.debit_account_id,
    le.credit_account_id,
    le.amount,
    le.entry_type,
    le.description,
    le.created_at
FROM ledger_entry le
WHERE le.debit_account_id = 'e0fcf451-8166-4272-98b5-3a6d9d1fa691' 
   OR le.credit_account_id = 'e0fcf451-8166-4272-98b5-3a6d9d1fa691'
ORDER BY le.created_at;
