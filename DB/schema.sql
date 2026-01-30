-- ============================================================================
-- Patient Management System - Database Schema
-- HIPAA & GDPR Compliant
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PgCrypto for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- ROLES & ACCESS CONTROL (RBAC)
-- ============================================================================

-- Create custom roles for RBAC
CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'nurse', 'lab_technician', 'patient');

-- ============================================================================
-- AUTH TABLE (Supabase Auth handled separately via Supabase Dashboard)
-- ============================================================================
-- This table syncs with Supabase's auth.users via trigger/webhook

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  role user_role NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  
  -- Audit fields
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- ============================================================================
-- PATIENT PROFILES
-- ============================================================================

CREATE TABLE public.patient_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  gender VARCHAR(20),
  blood_type VARCHAR(5),
  height_cm NUMERIC(5, 2),
  weight_kg NUMERIC(5, 2),
  allergies TEXT,
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  medical_history TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT gender_valid CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  CONSTRAINT blood_type_valid CHECK (blood_type IN ('O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'))
);

CREATE INDEX idx_patient_profiles_user_id ON patient_profiles(user_id);

-- ============================================================================
-- HEALTHCARE PROVIDER PROFILES
-- ============================================================================

CREATE TABLE public.provider_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  license_number VARCHAR(100) NOT NULL UNIQUE,
  specialization VARCHAR(255),
  qualification TEXT,
  years_of_experience INT,
  department VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT years_experience_valid CHECK (years_of_experience >= 0)
);

CREATE INDEX idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX idx_provider_profiles_license ON provider_profiles(license_number);

-- ============================================================================
-- MEDICAL RECORDS (PATIENT DATA)
-- ============================================================================

CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_type VARCHAR(50) NOT NULL, -- 'diagnosis', 'prescription', 'lab_result', 'consultation', 'treatment'
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_sensitive BOOLEAN DEFAULT false,
  
  CONSTRAINT record_type_valid CHECK (record_type IN ('diagnosis', 'prescription', 'lab_result', 'consultation', 'treatment', 'imaging', 'vaccination'))
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_created_by ON medical_records(created_by);
CREATE INDEX idx_medical_records_created_at ON medical_records(created_at);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);

-- ============================================================================
-- PRESCRIPTIONS
-- ============================================================================

CREATE TABLE public.prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  prescribed_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  medication_name VARCHAR(255) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration_days INT,
  start_date DATE NOT NULL,
  end_date DATE,
  instructions TEXT,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'discontinued'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT prescription_status CHECK (status IN ('active', 'completed', 'discontinued'))
);

CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX idx_prescriptions_prescribed_by ON prescriptions(prescribed_by);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- ============================================================================
-- LAB RESULTS
-- ============================================================================

CREATE TABLE public.lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ordered_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  lab_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  test_name VARCHAR(255) NOT NULL,
  test_category VARCHAR(100),
  result_value VARCHAR(255),
  normal_range VARCHAR(255),
  unit VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'reviewed'
  result_date DATE,
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT lab_status CHECK (status IN ('pending', 'completed', 'reviewed', 'cancelled'))
);

CREATE INDEX idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX idx_lab_results_ordered_by ON lab_results(ordered_by);
CREATE INDEX idx_lab_results_status ON lab_results(status);

-- ============================================================================
-- APPOINTMENTS
-- ============================================================================

CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INT DEFAULT 30,
  type VARCHAR(50), -- 'in-person', 'telemedicine', 'follow-up'
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no-show'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT appointment_status CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  CONSTRAINT appointment_type CHECK (type IN ('in-person', 'telemedicine', 'follow-up'))
);

CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_provider_id ON appointments(provider_id);
CREATE INDEX idx_appointments_appointment_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- ============================================================================
-- PATIENT CONSENT & DATA SHARING
-- ============================================================================

CREATE TABLE public.patient_consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type VARCHAR(100) NOT NULL, -- 'data_sharing', 'treatment', 'research', 'telemedicine'
  granted_to UUID REFERENCES users(id) ON DELETE SET NULL,
  scope TEXT, -- Details about what data/services are consented to
  is_active BOOLEAN DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT consent_type_valid CHECK (consent_type IN ('data_sharing', 'treatment', 'research', 'telemedicine', 'export'))
);

CREATE INDEX idx_patient_consents_patient_id ON patient_consents(patient_id);
CREATE INDEX idx_patient_consents_granted_to ON patient_consents(granted_to);
CREATE INDEX idx_patient_consents_active ON patient_consents(is_active);

-- ============================================================================
-- AUDIT LOG (TRACEABILITY & COMPLIANCE)
-- ============================================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(255) NOT NULL, -- 'create', 'read', 'update', 'delete', 'export', 'access_denied'
  resource_type VARCHAR(100), -- 'patient_record', 'prescription', 'lab_result', 'user_account'
  resource_id UUID,
  resource_details JSONB, -- Store details about what was accessed/modified
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(50), -- 'success', 'failure', 'unauthorized'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT audit_action CHECK (action IN ('create', 'read', 'update', 'delete', 'export', 'access_denied', 'login', 'logout'))
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- BREACH NOTIFICATION LOG (HIPAA COMPLIANCE)
-- ============================================================================

CREATE TABLE public.breach_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  breach_date TIMESTAMP WITH TIME ZONE NOT NULL,
  discovery_date TIMESTAMP WITH TIME ZONE NOT NULL,
  affected_records_count INT,
  breach_type VARCHAR(100), -- 'unauthorized_access', 'data_loss', 'system_compromise', 'insider_threat'
  description TEXT NOT NULL,
  containment_measures TEXT,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  affected_users JSONB, -- Array of affected user IDs
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'resolved', 'under_investigation'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT breach_type_valid CHECK (breach_type IN ('unauthorized_access', 'data_loss', 'system_compromise', 'insider_threat', 'other'))
);

CREATE INDEX idx_breach_notifications_reported_by ON breach_notifications(reported_by);
CREATE INDEX idx_breach_notifications_breach_date ON breach_notifications(breach_date);

-- ============================================================================
-- ACCESS CONTROL POLICIES (ROW-LEVEL SECURITY - RLS)
-- ============================================================================

-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Patients can only see their own profile and records
CREATE POLICY "Patients view own profile" ON users
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.jwt() ->> 'role' = 'admin'
  );

CREATE POLICY "Patients view own records" ON medical_records
  FOR SELECT USING (
    patient_id = auth.uid() OR 
    auth.jwt() ->> 'role' IN ('admin', 'doctor', 'nurse') OR
    EXISTS (
      SELECT 1 FROM patient_consents pc
      WHERE pc.patient_id = medical_records.patient_id
      AND pc.granted_to = auth.uid()
      AND pc.is_active = true
      AND (pc.expires_at IS NULL OR pc.expires_at > NOW())
    )
  );

-- Doctors can see their patients' records
CREATE POLICY "Doctors view assigned patients" ON medical_records
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'doctor' AND
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = medical_records.patient_id
      AND a.provider_id = auth.uid()
    )
  );

-- Only authorized staff can create/update audit logs
CREATE POLICY "Audit logs are append-only" ON audit_logs
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'system')
  );

CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR 
    auth.jwt() ->> 'role' = 'admin'
  );

-- ============================================================================
-- TRIGGERS & FUNCTIONS
-- ============================================================================

-- Function to log data access
CREATE OR REPLACE FUNCTION log_record_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, status)
  VALUES (auth.uid(), 'read', TG_TABLE_NAME, NEW.id, 'success');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_profiles_updated_at BEFORE UPDATE ON provider_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lab_results_updated_at BEFORE UPDATE ON lab_results
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_breach_notifications_updated_at BEFORE UPDATE ON breach_notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
