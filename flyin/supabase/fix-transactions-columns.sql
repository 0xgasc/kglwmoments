-- Add missing columns to transactions table for admin approval system

-- Add processed_at column for tracking when transactions are processed
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

-- Add admin_notes column for rejection reasons and admin comments
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Update the status check constraint to include 'approved' and 'rejected' statuses
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_status_check 
  CHECK (status IN ('pending', 'completed', 'failed', 'approved', 'rejected'));

-- Update payment_method constraint to include all methods used by the app
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_payment_method_check 
  CHECK (payment_method IN ('card', 'bank', 'account_balance', 'bank_transfer', 'deposit', 'mobile_payment', 'cryptocurrency'));

-- Create index on processed_at for performance
CREATE INDEX IF NOT EXISTS idx_transactions_processed_at ON transactions(processed_at);

-- Create index on status for admin filtering
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);