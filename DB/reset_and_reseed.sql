

-- =================================================================================
SEED TEST DATA
-- =================================================================================
-- Admin User (password: SecurePassword2024 - 19 chars)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES ('admin@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'ADMIN', TRUE, TRUE, TRUE);

-- Doctor Users (password: SecurePassword2024 - 19 chars)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES 
('doctor1@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'DOCTOR', TRUE, TRUE, TRUE),
('doctor2@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'DOCTOR', TRUE, TRUE, TRUE);

-- Doctor Profiles (updated to match new schema)
INSERT INTO doctor_profiles (user_id, first_name, last_name, specialty, department, contact_number)
SELECT user_id, 'John', 'Smith', 'General Practice', 'Internal Medicine', '555-0201'
FROM login WHERE email = 'doctor1@securehealth.com';

INSERT INTO doctor_profiles (user_id, first_name, last_name, specialty, department, contact_number)
SELECT user_id, 'Sarah', 'Johnson', 'Cardiology', 'Cardiology', '555-0202'
FROM login WHERE email = 'doctor2@securehealth.com';

-- Working days for doctors
INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, 'MONDAY'
FROM doctor_profiles dp 
JOIN login l ON dp.user_id = l.user_id 
WHERE l.email = 'doctor1@securehealth.com';

INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, 'TUESDAY'
FROM doctor_profiles dp 
JOIN login l ON dp.user_id = l.user_id 
WHERE l.email = 'doctor1@securehealth.com';

INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, 'WEDNESDAY'
FROM doctor_profiles dp 
JOIN login l ON dp.user_id = l.user_id 
WHERE l.email = 'doctor1@securehealth.com';

INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, 'THURSDAY'
FROM doctor_profiles dp 
JOIN login l ON dp.user_id = l.user_id 
WHERE l.email = 'doctor1@securehealth.com';

INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, 'FRIDAY'
FROM doctor_profiles dp 
JOIN login l ON dp.user_id = l.user_id 
WHERE l.email = 'doctor1@securehealth.com';

-- Nurse Users (password: SecurePassword2024 - 19 chars)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES 
('nurse1@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'NURSE', TRUE, TRUE, FALSE),
('nurse2@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'NURSE', TRUE, TRUE, FALSE);

-- Lab Technician Users (password: SecurePassword2024 - 19 chars)
INSERT INTO login (email, password_hash, role, is_active, is_verified)
VALUES 
('lab1@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'LAB_TECHNICIAN', TRUE, TRUE),
('lab2@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'LAB_TECHNICIAN', TRUE, TRUE);

-- Patient Users (password: SecurePassword2024 - 19 chars)
INSERT INTO login (email, password_hash, role, is_active, is_verified)
VALUES 
('patient1@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'PATIENT', TRUE, TRUE),
('patient2@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'PATIENT', TRUE, TRUE),
('patient3@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'PATIENT', TRUE, TRUE),
('patient4@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'PATIENT', TRUE, TRUE),
('patient5@securehealth.com', '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0', 'PATIENT', TRUE, TRUE);

-- Patient Profiles (updated to match new schema)
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address)
SELECT user_id, 'Alice', 'Williams', '1985-03-15', 'Female', '555-0101', '123 Main St'
FROM login WHERE email = 'patient1@securehealth.com';

INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address)
SELECT user_id, 'Bob', 'Brown', '1990-07-22', 'Male', '555-0102', '456 Oak Ave'
FROM login WHERE email = 'patient2@securehealth.com';

INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address)
SELECT user_id, 'Carol', 'Davis', '1988-11-10', 'Female', '555-0103', '789 Pine Rd'
FROM login WHERE email = 'patient3@securehealth.com';

INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address)
SELECT user_id, 'David', 'Miller', '1992-05-30', 'Male', '555-0104', '321 Elm St'
FROM login WHERE email = 'patient4@securehealth.com';

INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address)
SELECT user_id, 'Emma', 'Wilson', '1987-09-18', 'Female', '555-0105', '654 Maple Dr'
FROM login WHERE email = 'patient5@securehealth.com';

-- Sample Appointments (3 per patient)
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '7 days', 'SCHEDULED', 'Regular Checkup'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 5;

INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '14 days', 'PENDING_APPROVAL', 'Follow-up Visit'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor2@securehealth.com'
LIMIT 5;

INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '21 days', 'COMPLETED', 'Consultation'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 5;

-- Sample Prescriptions
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, status)
SELECT pp.profile_id, l.user_id, 'Lisinopril', '10mg', 'Once daily', '30 days', 'ACTIVE'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 5;

INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, status)
SELECT pp.profile_id, l.user_id, 'Metformin', '500mg', 'Twice daily', '90 days', 'ACTIVE'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor2@securehealth.com'
LIMIT 5;

INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, status)
SELECT pp.profile_id, l.user_id, 'Aspirin', '100mg', 'Once daily', '60 days', 'ACTIVE'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 5;

-- Sample Vital Signs
INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '120/80', 72, 98.6, 16, 98, 70.5, 175, NOW()
FROM patient_profiles pp, login l
WHERE l.email = 'nurse1@securehealth.com'
LIMIT 5;

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '118/78', 70, 98.4, 16, 99, 68.0, 172, NOW() - INTERVAL '1 day'
FROM patient_profiles pp, login l
WHERE l.email = 'nurse2@securehealth.com'
LIMIT 5;

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '122/82', 74, 98.7, 17, 98, 72.0, 178, NOW() - INTERVAL '2 days'
FROM patient_profiles pp, login l
WHERE l.email = 'nurse1@securehealth.com'
LIMIT 5;

-- Sample Lab Tests
-- Completed tests (with results)
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Blood Glucose', 'Chemistry', '95', 'mg/dL', 'Completed', NOW() - INTERVAL '7 days'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 5;

INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Hemoglobin A1C', 'Chemistry', '5.8', '%', 'Completed', NOW() - INTERVAL '5 days'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor2@securehealth.com'
LIMIT 5;

INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Complete Blood Count', 'Hematology', 'Normal', 'cells/uL', 'Completed', NOW() - INTERVAL '3 days'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 5;

-- Pending tests (awaiting sample collection)
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Lipid Panel', 'Chemistry', 'Pending', NOW() - INTERVAL '1 day'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 3;

INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Thyroid Function Test', 'Endocrinology', 'Pending', NOW() - INTERVAL '2 hours'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor2@securehealth.com'
LIMIT 2;

-- Collected tests (sample received, awaiting analysis)
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Urinalysis', 'Microbiology', 'Collected', NOW() - INTERVAL '4 hours'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 2;

-- Results Pending tests (analysis done, awaiting upload)
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Liver Function Test', 'Chemistry', 'Results Pending', NOW() - INTERVAL '6 hours'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor2@securehealth.com'
LIMIT 2;

-- Sample Medical Records (updated to use created_at instead of recorded_at)
INSERT INTO medical_records (patient_profile_id, doctor_id, diagnosis, symptoms, treatment_provided)
SELECT pp.profile_id, l.user_id, 'Hypertension', 'Elevated blood pressure', 'Prescribed Lisinopril'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor1@securehealth.com'
LIMIT 5;

INSERT INTO medical_records (patient_profile_id, doctor_id, diagnosis, symptoms, treatment_provided)
SELECT pp.profile_id, l.user_id, 'Type 2 Diabetes', 'High glucose levels', 'Prescribed Metformin'
FROM patient_profiles pp, login l
WHERE l.email = 'doctor2@securehealth.com'
LIMIT 5;

-- =================================================================================
-- PATIENT ASSIGNMENTS
-- =================================================================================
-- Assign doctor1 and nurse1 to patients 1-3
UPDATE patient_profiles
SET
    assigned_doctor_id = (SELECT user_id FROM login WHERE email = 'doctor1@securehealth.com'),
    assigned_nurse_id  = (SELECT user_id FROM login WHERE email = 'nurse1@securehealth.com')
WHERE user_id IN (
    SELECT user_id FROM login WHERE email IN (
        'patient1@securehealth.com',
        'patient2@securehealth.com',
        'patient3@securehealth.com'
    )
);

-- Assign doctor2 and nurse2 to patients 4-5
UPDATE patient_profiles
SET
    assigned_doctor_id = (SELECT user_id FROM login WHERE email = 'doctor2@securehealth.com'),
    assigned_nurse_id  = (SELECT user_id FROM login WHERE email = 'nurse2@securehealth.com')
WHERE user_id IN (
    SELECT user_id FROM login WHERE email IN (
        'patient4@securehealth.com',
        'patient5@securehealth.com'
    )
);

-- =================================================================================
-- DOCTOR 2 WORKING DAYS
-- =================================================================================
INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, day
FROM doctor_profiles dp
JOIN login l ON dp.user_id = l.user_id,
LATERAL (VALUES ('MONDAY'), ('TUESDAY'), ('WEDNESDAY'), ('THURSDAY'), ('FRIDAY')) AS days(day)
WHERE l.email = 'doctor2@securehealth.com';

-- =================================================================================
-- CONSENT MANAGEMENT
-- =================================================================================
-- Patient 1 (Alice): active consent for VIEW_RECORDS granted to doctor1
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'VIEW_RECORDS', 'ACTIVE', NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days', 'Routine care access'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com',
login l WHERE l.email = 'doctor1@securehealth.com';

-- Patient 2 (Bob): active consent for PRESCRIPTIONS granted to doctor1
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'PRESCRIPTIONS', 'ACTIVE', NOW() - INTERVAL '20 days', NOW() + INTERVAL '345 days', 'Medication management'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient2@securehealth.com',
login l WHERE l.email = 'doctor1@securehealth.com';

-- Patient 3 (Carol): active consent for VITAL_SIGNS granted to nurse1
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'VITAL_SIGNS', 'ACTIVE', NOW() - INTERVAL '15 days', NOW() + INTERVAL '350 days', 'Nursing monitoring'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient3@securehealth.com',
login l WHERE l.email = 'nurse1@securehealth.com';

-- Patient 4 (David): revoked consent for VIEW_RECORDS granted to doctor2
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, revoked_at, reason)
SELECT pp.profile_id, l.user_id, 'VIEW_RECORDS', 'REVOKED', NOW() - INTERVAL '60 days', NOW() - INTERVAL '10 days', 'Patient withdrew consent'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient4@securehealth.com',
login l WHERE l.email = 'doctor2@securehealth.com';

-- Patient 5 (Emma): expiring soon consent for VIEW_RECORDS granted to doctor2
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'VIEW_RECORDS', 'ACTIVE', NOW() - INTERVAL '355 days', NOW() + INTERVAL '10 days', 'Annual care access'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient5@securehealth.com',
login l WHERE l.email = 'doctor2@securehealth.com';

-- Patient 1 (Alice): active consent for PRESCRIPTIONS granted to doctor2
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'PRESCRIPTIONS', 'ACTIVE', NOW() - INTERVAL '25 days', NOW() + INTERVAL '340 days', 'Specialist prescription review'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com',
login l WHERE l.email = 'doctor2@securehealth.com';

-- Patient 1 (Alice): active consent for VITAL_SIGNS granted to nurse1
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'VITAL_SIGNS', 'ACTIVE', NOW() - INTERVAL '18 days', NOW() + INTERVAL '347 days', 'Nursing monitoring and follow-up'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com',
login l WHERE l.email = 'nurse1@securehealth.com';

-- Patient 1 (Alice): active consent for LAB_RESULTS granted to lab1
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'LAB_RESULTS', 'ACTIVE', NOW() - INTERVAL '10 days', NOW() + INTERVAL '355 days', 'Lab technician result access'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com',
login l WHERE l.email = 'lab1@securehealth.com';

-- Patient 1 (Alice): revoked consent for VIEW_RECORDS previously granted to doctor2
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, revoked_at, reason)
SELECT pp.profile_id, l.user_id, 'VIEW_RECORDS', 'REVOKED', NOW() - INTERVAL '90 days', NOW() - INTERVAL '45 days', 'Withdrew after treatment ended'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com',
login l WHERE l.email = 'doctor2@securehealth.com';

-- Patient 1 (Alice): active consent for ALL granted to doctor1
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at, expires_at, reason)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '5 days', NOW() + INTERVAL '360 days', 'Full access for primary care physician'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com',
login l WHERE l.email = 'doctor1@securehealth.com';

-- Consent audit log
INSERT INTO consent_log (user_id, consent_type, is_granted, ip_address, changed_at)
SELECT user_id, 'VIEW_RECORDS', TRUE, '192.168.1.10', NOW() - INTERVAL '30 days'
FROM login WHERE email = 'patient1@securehealth.com';

INSERT INTO consent_log (user_id, consent_type, is_granted, ip_address, changed_at)
SELECT user_id, 'PRESCRIPTIONS', TRUE, '192.168.1.12', NOW() - INTERVAL '20 days'
FROM login WHERE email = 'patient2@securehealth.com';

INSERT INTO consent_log (user_id, consent_type, is_granted, ip_address, changed_at)
SELECT user_id, 'VIEW_RECORDS', FALSE, '192.168.1.14', NOW() - INTERVAL '10 days'
FROM login WHERE email = 'patient4@securehealth.com';

-- =================================================================================
-- ADMIN DASHBOARD DATA
-- =================================================================================

-- Audit Logs (25 rows covering login events, clinical actions, admin actions)
INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('admin@securehealth.com', 'LOGIN_SUCCESS', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'method=password', NOW() - INTERVAL '1 hour');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('doctor1@securehealth.com', 'LOGIN_SUCCESS', '192.168.1.11', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'method=password', NOW() - INTERVAL '2 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('doctor2@securehealth.com', 'LOGIN_SUCCESS', '192.168.1.12', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'method=password', NOW() - INTERVAL '3 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('patient1@securehealth.com', 'LOGIN_FAILED', '10.0.0.5', 'Mozilla/5.0', 'reason=wrong_password attempt=2', NOW() - INTERVAL '4 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('patient1@securehealth.com', 'LOGIN_FAILED', '10.0.0.5', 'Mozilla/5.0', 'reason=wrong_password attempt=3', NOW() - INTERVAL '4 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('patient1@securehealth.com', 'ACCOUNT_LOCKED', '10.0.0.5', 'Mozilla/5.0', 'reason=max_attempts_exceeded lockout_minutes=30', NOW() - INTERVAL '4 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('nurse1@securehealth.com', 'LOGIN_SUCCESS', '192.168.1.13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', 'method=password', NOW() - INTERVAL '5 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('nurse2@securehealth.com', 'LOGIN_SUCCESS', '192.168.1.14', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', 'method=password', NOW() - INTERVAL '6 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('lab1@securehealth.com', 'LOGIN_SUCCESS', '192.168.1.15', 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121', 'method=password', NOW() - INTERVAL '7 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('lab1@securehealth.com', 'LOGOUT', '192.168.1.15', 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121', 'session_duration_minutes=45', NOW() - INTERVAL '6 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('admin@securehealth.com', 'USER_CREATED', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'created_email=patient5@securehealth.com role=PATIENT', NOW() - INTERVAL '10 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('admin@securehealth.com', 'USER_DEACTIVATED', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'target=oldpatient@securehealth.com reason=policy_violation', NOW() - INTERVAL '5 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('admin@securehealth.com', 'ROLE_CHANGED', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'target=lab2@securehealth.com old_role=LAB_TECHNICIAN new_role=DOCTOR', NOW() - INTERVAL '8 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('doctor1@securehealth.com', 'PRESCRIPTION_CREATED', '192.168.1.11', 'Mozilla/5.0', 'medication=Lisinopril patient_id=1', NOW() - INTERVAL '2 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('doctor1@securehealth.com', 'APPOINTMENT_SCHEDULED', '192.168.1.11', 'Mozilla/5.0', 'patient_id=1 date=next_week', NOW() - INTERVAL '1 day');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('nurse1@securehealth.com', 'VITAL_SIGNS_RECORDED', '192.168.1.13', 'Mozilla/5.0', 'bp=120/80 hr=72 patient_id=1', NOW() - INTERVAL '3 hours');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('doctor1@securehealth.com', 'LAB_TEST_ORDERED', '192.168.1.11', 'Mozilla/5.0', 'test=Blood Glucose patient_id=1', NOW() - INTERVAL '7 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('lab1@securehealth.com', 'LAB_TEST_RESULT_UPLOADED', '192.168.1.15', 'Mozilla/5.0', 'test=Blood Glucose result=95mg/dL', NOW() - INTERVAL '6 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('patient1@securehealth.com', 'CONSENT_GRANTED', '192.168.1.20', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17)', 'consent_type=VIEW_RECORDS granted_to=doctor1@securehealth.com', NOW() - INTERVAL '30 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('patient4@securehealth.com', 'CONSENT_REVOKED', '192.168.1.24', 'Mozilla/5.0', 'consent_type=VIEW_RECORDS revoked_from=doctor2@securehealth.com', NOW() - INTERVAL '10 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('doctor2@securehealth.com', 'PASSWORD_CHANGED', '192.168.1.12', 'Mozilla/5.0', 'method=user_initiated', NOW() - INTERVAL '15 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('doctor1@securehealth.com', 'TWO_FACTOR_ENABLED', '192.168.1.11', 'Mozilla/5.0', 'method=totp', NOW() - INTERVAL '20 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('admin@securehealth.com', 'SUSPICIOUS_LOGIN_ATTEMPT', '185.220.101.5', 'curl/7.82.0', 'country=Unknown blocked=true', NOW() - INTERVAL '2 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('admin@securehealth.com', 'DATA_EXPORT', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'report_type=patient_summary records=150', NOW() - INTERVAL '3 days');

INSERT INTO audit_logs (email, action, ip_address, user_agent, details, timestamp)
VALUES ('admin@securehealth.com', 'SESSION_REVOKED', '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'reason=suspicious_activity source_ip=185.220.101.5', NOW() - INTERVAL '2 days');

-- Archived Users (4 rows â€” original_user_id uses placeholder IDs for non-existent archived accounts)
INSERT INTO archived_users (original_user_id, email, role, last_active_at, archived_at, reason)
VALUES (999901, 'former.patient@securehealth.com', 'PATIENT', NOW() - INTERVAL '200 days', NOW() - INTERVAL '30 days', 'Account inactive >180 days');

INSERT INTO archived_users (original_user_id, email, role, last_active_at, archived_at, reason)
VALUES (999902, 'dr.retired@securehealth.com', 'DOCTOR', NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days', 'Retired â€” left institution');

INSERT INTO archived_users (original_user_id, email, role, last_active_at, archived_at, reason)
VALUES (999903, 'nurse.resigned@securehealth.com', 'NURSE', NOW() - INTERVAL '60 days', NOW() - INTERVAL '45 days', 'Voluntary resignation');

INSERT INTO archived_users (original_user_id, email, role, last_active_at, archived_at, reason)
VALUES (999904, 'lab.terminated@securehealth.com', 'LAB_TECHNICIAN', NOW() - INTERVAL '30 days', NOW() - INTERVAL '20 days', 'Policy violation â€” access revoked');

-- Active Sessions (5 active + 1 suspicious/revoked)
INSERT INTO sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at, revoked, created_at)
SELECT user_id,
    encode(sha256(('admin-tok-1')::bytea), 'hex'),
    '192.168.1.10', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    NOW() + INTERVAL '1 hour', FALSE, NOW() - INTERVAL '30 minutes'
FROM login WHERE email = 'admin@securehealth.com';

INSERT INTO sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at, revoked, created_at)
SELECT user_id,
    encode(sha256(('doctor1-tok-1')::bytea), 'hex'),
    '192.168.1.11', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    NOW() + INTERVAL '2 hours', FALSE, NOW() - INTERVAL '1 hour'
FROM login WHERE email = 'doctor1@securehealth.com';

INSERT INTO sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at, revoked, created_at)
SELECT user_id,
    encode(sha256(('nurse1-tok-1')::bytea), 'hex'),
    '192.168.1.13', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    NOW() + INTERVAL '90 minutes', FALSE, NOW() - INTERVAL '45 minutes'
FROM login WHERE email = 'nurse1@securehealth.com';

INSERT INTO sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at, revoked, created_at)
SELECT user_id,
    encode(sha256(('lab1-tok-1')::bytea), 'hex'),
    '192.168.1.15', 'Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0',
    NOW() + INTERVAL '3 hours', FALSE, NOW() - INTERVAL '20 minutes'
FROM login WHERE email = 'lab1@securehealth.com';

INSERT INTO sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at, revoked, created_at)
SELECT user_id,
    encode(sha256(('patient1-tok-1')::bytea), 'hex'),
    '192.168.1.20', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1',
    NOW() + INTERVAL '1 hour', FALSE, NOW() - INTERVAL '10 minutes'
FROM login WHERE email = 'patient1@securehealth.com';

-- Suspicious / revoked session
INSERT INTO sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at, revoked, created_at)
SELECT user_id,
    encode(sha256(('suspicious-tok-1')::bytea), 'hex'),
    '185.220.101.5', 'curl/7.82.0',
    NOW() - INTERVAL '1 hour', TRUE, NOW() - INTERVAL '2 days'
FROM login WHERE email = 'admin@securehealth.com';

-- Password Reset Tokens (1 pending + 1 used)
INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used, created_at)
SELECT user_id,
    encode(sha256(('reset-pending-patient2-v1')::bytea), 'hex'),
    NOW() + INTERVAL '30 minutes', FALSE, NOW() - INTERVAL '5 minutes'
FROM login WHERE email = 'patient2@securehealth.com';

INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used, created_at)
SELECT user_id,
    encode(sha256(('reset-used-patient3-v1')::bytea), 'hex'),
    NOW() - INTERVAL '1 day', TRUE, NOW() - INTERVAL '2 days'
FROM login WHERE email = 'patient3@securehealth.com';

-- =================================================================================
-- NURSE DASHBOARD DATA
-- =================================================================================

-- Handover Notes (6 rows)
INSERT INTO handover_notes (author_id, patient_id, type, priority, content, is_read, timestamp, shift_direction)
SELECT l.user_id, pp.profile_id, 'patient', 'urgent',
    'Patient Alice Williams â€“ BP spiked to 160/100 at 14:30. Administered Lisinopril 10mg. Needs BP check every 30 min. Doctor Smith notified.',
    FALSE, NOW() - INTERVAL '2 hours', 'outgoing'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO handover_notes (author_id, patient_id, type, priority, content, is_read, timestamp, shift_direction)
SELECT l.user_id, pp.profile_id, 'patient', 'high',
    'Bob Brown â€“ Lab results for Lipid Panel pending. Patient fasting since midnight, do not administer morning meds until results are back.',
    FALSE, NOW() - INTERVAL '3 hours', 'outgoing'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient2@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO handover_notes (author_id, patient_id, type, priority, content, is_read, timestamp, shift_direction)
SELECT l.user_id, pp.profile_id, 'patient', 'normal',
    'Carol Davis â€“ Routine post-op wound check completed. Dressing changed. Patient comfortable, no signs of infection. Next dressing change in 24h.',
    TRUE, NOW() - INTERVAL '8 hours', 'incoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient3@securehealth.com'
WHERE l.email = 'nurse2@securehealth.com';

INSERT INTO handover_notes (author_id, patient_id, type, priority, content, is_read, timestamp, shift_direction)
SELECT l.user_id, pp.profile_id, 'patient', 'high',
    'David Miller â€“ Blood glucose monitoring required every 2 hours. Insulin sliding scale ordered by Dr. Johnson. Last reading 8.4 mmol/L at 16:00.',
    FALSE, NOW() - INTERVAL '4 hours', 'outgoing'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient4@securehealth.com'
WHERE l.email = 'nurse2@securehealth.com';

INSERT INTO handover_notes (author_id, patient_id, type, priority, content, is_read, timestamp, shift_direction)
SELECT l.user_id, pp.profile_id, 'patient', 'normal',
    'Emma Wilson â€“ Discharged at 15:45. All medications and follow-up instructions provided. Follow-up with Dr. Johnson scheduled in 2 weeks.',
    TRUE, NOW() - INTERVAL '6 hours', 'incoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient5@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO handover_notes (author_id, patient_id, type, priority, content, is_read, timestamp, shift_direction)
SELECT user_id, NULL, 'general', 'normal',
    'Night shift report: All patients stable. Crash cart checked and restocked. Medication cabinet inventory completed. ICU beds 3 and 5 deep-cleaned and ready.',
    TRUE, NOW() - INTERVAL '12 hours', 'incoming'
FROM login WHERE email = 'nurse2@securehealth.com';

-- Nurse Tasks (8 rows: 4 upcoming, 2 overdue, 2 completed)
INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Administer Morning Medications', 'Give Lisinopril 10mg and Aspirin 100mg with food',
    'medication', 'high', NOW() + INTERVAL '1 hour', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Record Vital Signs', 'BP, HR, temp, O2 sat â€“ record in system and note any abnormalities',
    'vitals', 'high', NOW() + INTERVAL '30 minutes', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient2@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Collect Blood Sample for Lipid Panel', 'Patient fasting. Collect venous sample and send to lab immediately.',
    'lab', 'urgent', NOW() + INTERVAL '15 minutes', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient2@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Blood Glucose Check', 'Capillary blood glucose â€“ apply insulin sliding scale. Document result.',
    'vitals', 'urgent', NOW() + INTERVAL '30 minutes', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient4@securehealth.com'
WHERE l.email = 'nurse2@securehealth.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Wound Dressing Change', 'Change post-op wound dressing using sterile technique. Document wound condition.',
    'care', 'high', NOW() - INTERVAL '1 hour', FALSE, 'overdue'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient3@securehealth.com'
WHERE l.email = 'nurse2@securehealth.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Discharge Documentation', 'Complete discharge summary and patient education checklist before 15:00.',
    'administrative', 'high', NOW() - INTERVAL '45 minutes', FALSE, 'overdue'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient5@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Morning Vital Signs', 'Routine morning vital signs recorded and documented.',
    'vitals', 'normal', NOW() - INTERVAL '4 hours', TRUE, 'completed'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient1@securehealth.com'
WHERE l.email = 'nurse1@securehealth.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'IV Line Check and Flush', 'Checked IV patency, flushed with saline, site clean and intact.',
    'care', 'normal', NOW() - INTERVAL '3 hours', TRUE, 'completed'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'patient3@securehealth.com'
WHERE l.email = 'nurse2@securehealth.com';

-- =================================================================================
-- VERIFICATION
-- =================================================================================
SELECT 'Reset and reseed completed successfully' AS status;
