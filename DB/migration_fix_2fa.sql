-- Migration script to fix column naming mismatch
-- This script aligns the database schema with the JPA entity expectations

-- 1. Add the correct column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'login' 
        AND column_name = 'two_factor_enabled'
    ) THEN
        ALTER TABLE login ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 2. Migrate data from old column to new column
UPDATE login 
SET two_factor_enabled = is_2fa_enabled 
WHERE is_2fa_enabled IS NOT NULL;

-- 3. Drop the old column (optional - keep for backup initially)
-- ALTER TABLE login DROP COLUMN is_2fa_enabled;

-- 4. Add missing columns for 2FA workflow
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'login' 
        AND column_name = 'otp_expiry'
    ) THEN
        ALTER TABLE login ADD COLUMN otp_expiry TIMESTAMP;
    END IF;
END $$;

-- 5. Add failed_attempts column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'login' 
        AND column_name = 'failed_attempts'
    ) THEN
        ALTER TABLE login ADD COLUMN failed_attempts INT DEFAULT 0;
    END IF;
END $$;

-- 6. Add is_locked column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'login' 
        AND column_name = 'is_locked'
    ) THEN
        ALTER TABLE login ADD COLUMN is_locked BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- 7. Add lockout_until column if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'login' 
        AND column_name = 'lockout_until'
    ) THEN
        ALTER TABLE login ADD COLUMN lockout_until TIMESTAMP;
    END IF;
END $$;

-- 8. Ensure 2FA is enabled for DOCTOR and ADMIN roles
UPDATE login 
SET two_factor_enabled = true 
WHERE role IN ('DOCTOR', 'ADMIN') AND two_factor_enabled = false;
