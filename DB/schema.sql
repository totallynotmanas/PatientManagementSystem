-- 1. CLEANUP (Optional: Resets everything if you made mistakes)
DROP TABLE IF EXISTS security_logs CASCADE;
DROP TABLE IF EXISTS consent_log CASCADE;
DROP TABLE IF EXISTS lab_results CASCADE;
DROP TABLE IF EXISTS lab_orders CASCADE;
DROP TABLE IF EXISTS visits CASCADE;
DROP TABLE IF EXISTS doctor_profile CASCADE;
DROP TABLE IF EXISTS patient_profile CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS login CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 2. ENUMS (For cleaner code)
CREATE TYPE user_role_type AS ENUM ('PATIENT', 'DOCTOR', 'NURSE', 'ADMIN', 'LAB_TECH');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- 3. CORE IDENTITY (Epic 1 & 5)
CREATE TABLE login (
    user_id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'PATIENT',

    -- Security Fields
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_2fa_enabled BOOLEAN DEFAULT FALSE,
    otp_secret VARCHAR(255),  -- For Google Authenticator

    -- Active Defense (Lockout Logic)
    failed_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lockout_until TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

CREATE TABLE sessions (
    session_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES login(user_id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL, -- Store hash, not raw token!
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_revoked BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. CLINICAL PROFILES (Epic 2 & 3)
CREATE TABLE patient_profile (
    profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES login(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    address_encrypted TEXT, -- Encrypt this in Node.js before inserting!
    medical_history_encrypted TEXT
);

CREATE TABLE doctor_profile (
    profile_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE REFERENCES login(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    specialization VARCHAR(100)
);

-- 5. CLINICAL WORKFLOW (Epic 2)
CREATE TABLE visits (
    visit_id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT REFERENCES patient_profile(profile_id),
    doctor_id BIGINT REFERENCES doctor_profile(profile_id),
    visit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    diagnosis_notes TEXT,
    prescription_text TEXT
);

CREATE TABLE lab_orders (
    order_id BIGSERIAL PRIMARY KEY,
    visit_id BIGINT REFERENCES visits(visit_id),
    test_type VARCHAR(100) NOT NULL,
    status request_status DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lab_results (
    result_id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES lab_orders(order_id),
    file_url VARCHAR(255), -- Link to S3/Local secure storage
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. SECURITY & AUDIT LOGS (Epic 4)
CREATE TABLE security_logs (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES login(user_id),
    event_type VARCHAR(50) NOT NULL, -- e.g., 'LOGIN_FAILED', '2FA_SUCCESS'
    ip_address VARCHAR(45),
    severity VARCHAR(20) DEFAULT 'INFO', -- INFO, WARN, CRITICAL
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE consent_log (
    log_id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES login(user_id),
    consent_type VARCHAR(50) NOT NULL, -- e.g., 'DATA_SHARING'
    is_granted BOOLEAN NOT NULL,
    ip_address VARCHAR(45),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

