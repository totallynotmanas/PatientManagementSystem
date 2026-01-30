-- ============================================================================
-- Seed Data for Patient Management System
-- ============================================================================
-- NOTE: In production, use Supabase dashboard or secure scripts for user creation
-- This is for development/testing purposes only

-- Insert admin user (you'll set auth via Supabase dashboard)
INSERT INTO users (email, role, full_name, phone_number, is_active)
VALUES 
  ('admin@patientsystem.com', 'admin', 'System Administrator', '+1-555-0001', true);

-- Insert doctor users
INSERT INTO users (email, role, full_name, phone_number, is_active)
VALUES 
  ('dr.smith@patientsystem.com', 'doctor', 'Dr. John Smith', '+1-555-0100', true),
  ('dr.johnson@patientsystem.com', 'doctor', 'Dr. Sarah Johnson', '+1-555-0101', true);

-- Insert nurse users
INSERT INTO users (email, role, full_name, phone_number, is_active)
VALUES 
  ('nurse.wilson@patientsystem.com', 'nurse', 'Nurse Mike Wilson', '+1-555-0200', true),
  ('nurse.brown@patientsystem.com', 'nurse', 'Nurse Emily Brown', '+1-555-0201', true);

-- Insert lab technician users
INSERT INTO users (email, role, full_name, phone_number, is_active)
VALUES 
  ('tech.davis@patientsystem.com', 'lab_technician', 'Lab Tech Robert Davis', '+1-555-0300', true),
  ('tech.martinez@patientsystem.com', 'lab_technician', 'Lab Tech Lisa Martinez', '+1-555-0301', true);

-- Insert patient users
INSERT INTO users (email, role, full_name, phone_number, is_active)
VALUES 
  ('patient1@example.com', 'patient', 'John Anderson', '+1-555-1000', true),
  ('patient2@example.com', 'patient', 'Jane Cooper', '+1-555-1001', true),
  ('patient3@example.com', 'patient', 'Robert Taylor', '+1-555-1002', true);

-- Insert provider profiles (doctors)
INSERT INTO provider_profiles (user_id, license_number, specialization, qualification, years_of_experience, department, is_verified)
SELECT id, 'MD-' || SUBSTRING(email, 1, 5) || '-001', 'General Medicine', 'MD, Board Certified', 15, 'Internal Medicine', true
FROM users WHERE email = 'dr.smith@patientsystem.com';

INSERT INTO provider_profiles (user_id, license_number, specialization, qualification, years_of_experience, department, is_verified)
SELECT id, 'MD-' || SUBSTRING(email, 1, 5) || '-002', 'Cardiology', 'MD, Board Certified', 12, 'Cardiology', true
FROM users WHERE email = 'dr.johnson@patientsystem.com';

-- Insert patient profiles
INSERT INTO patient_profiles (user_id, date_of_birth, gender, blood_type, height_cm, weight_kg, emergency_contact_name, emergency_contact_phone)
SELECT id, '1985-06-15'::DATE, 'Male', 'O+', 180.5, 75.0, 'Mary Anderson', '+1-555-1100'
FROM users WHERE email = 'patient1@example.com';

INSERT INTO patient_profiles (user_id, date_of_birth, gender, blood_type, height_cm, weight_kg, emergency_contact_name, emergency_contact_phone)
SELECT id, '1990-03-22'::DATE, 'Female', 'A+', 165.0, 62.5, 'James Cooper', '+1-555-1101'
FROM users WHERE email = 'patient2@example.com';

INSERT INTO patient_profiles (user_id, date_of_birth, gender, blood_type, height_cm, weight_kg, emergency_contact_name, emergency_contact_phone)
SELECT id, '1978-11-08'::DATE, 'Male', 'B+', 178.0, 85.0, 'Linda Taylor', '+1-555-1102'
FROM users WHERE email = 'patient3@example.com';
