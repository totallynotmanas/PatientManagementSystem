-- =================================================================================
-- CUSTOM USER SEED — PatientManagementSystem
-- Run against: healthcare_auth_db (live PostgreSQL)
-- SAFE: insert-only, no DROP/CREATE — schema already managed by JPA/Hibernate
--
-- Password for ALL users: SecurePassword2024
-- Hash: argon2id $argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- 1. LOGIN ACCOUNTS
-- ---------------------------------------------------------------------------------

-- Admin (2FA enabled)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES (
    'manvitha3626@gmail.com',
    '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
    'ADMIN', TRUE, TRUE, TRUE
);

-- Doctors (2FA enabled)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES
    ('riyomen.mikey@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'DOCTOR', TRUE, TRUE, TRUE),
    ('2004arjunk@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'DOCTOR', TRUE, TRUE, TRUE);

-- Nurse (no 2FA)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES (
    'abhirambikkina@gmail.com',
    '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
    'NURSE', TRUE, TRUE, FALSE
);

-- Lab Technician (no 2FA)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES (
    'abhiramamrita@gmail.com',
    '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
    'LAB_TECHNICIAN', TRUE, TRUE, FALSE
);

-- Patients (no 2FA)
INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES
    ('diyabhat2005@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('editzzz.ani@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE);

-- ---------------------------------------------------------------------------------
-- 2. DOCTOR PROFILES
-- ---------------------------------------------------------------------------------

INSERT INTO doctor_profiles (user_id, first_name, last_name, specialty, department, contact_number, shift_start_time, shift_end_time, slot_duration_minutes)
SELECT user_id, 'Mikey', 'Riyomen', 'General Practice', 'Internal Medicine', '555-1001', '09:00:00', '17:00:00', 30
FROM login WHERE email = 'riyomen.mikey@gmail.com';

INSERT INTO doctor_profiles (user_id, first_name, last_name, specialty, department, contact_number, shift_start_time, shift_end_time, slot_duration_minutes)
SELECT user_id, 'Arjun', 'Kumar', 'Cardiology', 'Cardiology', '555-1002', '09:00:00', '17:00:00', 30
FROM login WHERE email = '2004arjunk@gmail.com';

-- Working days — both doctors: Mon–Fri
INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, day
FROM doctor_profiles dp
JOIN login l ON dp.user_id = l.user_id,
LATERAL (VALUES ('MONDAY'), ('TUESDAY'), ('WEDNESDAY'), ('THURSDAY'), ('FRIDAY')) AS days(day)
WHERE l.email IN ('riyomen.mikey@gmail.com', '2004arjunk@gmail.com');

-- ---------------------------------------------------------------------------------
-- 3. PATIENT PROFILES
-- ---------------------------------------------------------------------------------

-- Diya Bhat → assigned to doctor Mikey, nurse Abhiram Bikkina
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT
    pl.user_id,
    'Diya', 'Bhat',
    '2005-04-12', 'Female', '555-2001', '12 Rose Lane, Sydney',
    'No known chronic conditions. Seasonal allergies (pollen).',
    (SELECT user_id FROM login WHERE email = 'riyomen.mikey@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'diyabhat2005@gmail.com';

-- Ani → assigned to doctor Arjun, nurse Abhiram Bikkina
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT
    pl.user_id,
    'Ani', 'Edit',
    '1998-09-25', 'Female', '555-2002', '78 Blue St, Melbourne',
    'Mild hypertension — monitored. No medication currently.',
    (SELECT user_id FROM login WHERE email = '2004arjunk@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'editzzz.ani@gmail.com';

-- ---------------------------------------------------------------------------------
-- 4. APPOINTMENTS
-- ---------------------------------------------------------------------------------

-- Diya with Dr. Mikey — upcoming SCHEDULED
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '5 days', 'SCHEDULED', 'Routine annual checkup'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Diya with Dr. Mikey — past COMPLETED
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit, doctor_notes)
SELECT pp.profile_id, l.user_id, NOW() - INTERVAL '14 days', 'COMPLETED', 'Follow-up for seasonal allergies', 'Prescribed antihistamines. Patient improving.'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Ani with Dr. Arjun — upcoming PENDING_APPROVAL
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '3 days', 'PENDING_APPROVAL', 'Blood pressure review'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Ani with Dr. Arjun — past COMPLETED
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit, doctor_notes)
SELECT pp.profile_id, l.user_id, NOW() - INTERVAL '21 days', 'COMPLETED', 'Initial hypertension assessment', 'BP 138/88. Lifestyle changes recommended. Schedule 3-week follow-up.'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- ---------------------------------------------------------------------------------
-- 5. VITAL SIGNS (recorded by Abhiram Bikkina - nurse)
-- ---------------------------------------------------------------------------------

-- Diya — 3 readings over last 3 days
INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '118/76', 68, 98.4, 15, 99, 55.0, 162, NOW() - INTERVAL '2 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '116/74', 70, 98.6, 16, 99, 55.0, 162, NOW() - INTERVAL '1 day'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '120/78', 72, 98.5, 16, 98, 55.0, 162, NOW()
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

-- Ani — 3 readings (elevated BP trend)
INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '140/90', 78, 98.8, 17, 97, 62.0, 165, NOW() - INTERVAL '2 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '138/88', 75, 98.6, 16, 97, 62.0, 165, NOW() - INTERVAL '1 day'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '136/86', 74, 98.5, 16, 98, 62.0, 165, NOW()
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

-- ---------------------------------------------------------------------------------
-- 6. PRESCRIPTIONS (ordered by respective doctors)
-- ---------------------------------------------------------------------------------

-- Diya — antihistamine for allergies (Dr. Mikey)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id,
    'Cetirizine', '10mg', 'Once daily at night', '30 days',
    'Take with water. Avoid alcohol.',
    'ACTIVE', NOW() - INTERVAL '14 days', NOW() + INTERVAL '16 days', 1
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Ani — antihypertensive (Dr. Arjun)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id,
    'Amlodipine', '5mg', 'Once daily in the morning', '90 days',
    'Monitor BP weekly. Report any swelling in legs.',
    'ACTIVE', NOW() - INTERVAL '21 days', NOW() + INTERVAL '69 days', 2
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- ---------------------------------------------------------------------------------
-- 7. MEDICAL RECORDS
-- ---------------------------------------------------------------------------------

-- Diya — allergy visit (Dr. Mikey)
INSERT INTO medical_records (patient_profile_id, doctor_id, diagnosis, symptoms, treatment_provided)
SELECT pp.profile_id, l.user_id,
    'Seasonal Allergic Rhinitis',
    'Sneezing, nasal congestion, itchy eyes — worse in spring.',
    'Prescribed Cetirizine 10mg daily. Advised to avoid outdoor exposure during high pollen days.'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Ani — hypertension (Dr. Arjun)
INSERT INTO medical_records (patient_profile_id, doctor_id, diagnosis, symptoms, treatment_provided)
SELECT pp.profile_id, l.user_id,
    'Stage 1 Hypertension',
    'Headaches, occasional dizziness. BP consistently 138-142/88-92 over 3 readings.',
    'Prescribed Amlodipine 5mg. Lifestyle advice: reduce sodium, moderate exercise, reduce caffeine.'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- ---------------------------------------------------------------------------------
-- 8. LAB TESTS
-- ---------------------------------------------------------------------------------

-- Diya — allergy panel (COMPLETED), ordered by Dr. Mikey, resulted by lab tech Abhiramamrita
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, reference_range, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id,
    'Serum IgE (Total)', 'Immunology',
    '245', 'IU/mL', '0–100 IU/mL',
    'Elevated IgE consistent with allergic sensitisation.',
    'COMPLETED', NOW() - INTERVAL '13 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Diya — CBC pending (Dr. Mikey)
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id,
    'Complete Blood Count', 'Hematology',
    'Baseline CBC before follow-up visit.',
    'PENDING', NOW() - INTERVAL '1 day'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Ani — lipid panel (COMPLETED), ordered by Dr. Arjun
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, reference_range, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id,
    'Lipid Panel', 'Chemistry',
    'LDL 128 / HDL 52 / TG 160', 'mg/dL', 'LDL <130 / HDL >40 / TG <150',
    'LDL borderline. HDL acceptable. Lifestyle modification advised.',
    'COMPLETED', NOW() - INTERVAL '20 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Ani — renal function (PENDING, for upcoming review)
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id,
    'Renal Function Test', 'Chemistry',
    'Monitor kidney function given antihypertensive therapy.',
    'PENDING', NOW() - INTERVAL '2 hours'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- ---------------------------------------------------------------------------------
-- 9. NURSE TASKS (assigned to Abhiram Bikkina)
-- ---------------------------------------------------------------------------------

-- Diya tasks
INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Record Morning Vitals — Diya Bhat',
    'Record BP, HR, temperature, SpO2 before 9 AM.',
    'vitals', 'medium', NOW() + INTERVAL '20 hours', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com'
WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Administer Cetirizine — Diya Bhat',
    'Administer Cetirizine 10mg at night as prescribed by Dr. Riyomen.',
    'medication', 'medium', NOW() + INTERVAL '8 hours', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com'
WHERE l.email = 'abhirambikkina@gmail.com';

-- Ani tasks
INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Record Morning Vitals — Ani Edit',
    'Record BP, HR, temperature, SpO2. Pay attention to BP — patient is hypertensive.',
    'vitals', 'high', NOW() + INTERVAL '19 hours', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com'
WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Administer Amlodipine — Ani Edit',
    'Administer Amlodipine 5mg in the morning as prescribed by Dr. Kumar.',
    'medication', 'high', NOW() + INTERVAL '1 hour', FALSE, 'due-soon'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com'
WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO nurse_tasks (assigned_nurse_id, patient_id, title, description, category, priority, due_time, completed, status)
SELECT l.user_id, pp.profile_id,
    'Collect Blood Sample for Renal Function Test — Ani Edit',
    'Coordinate with lab for sample collection. Ensure patient is fasting.',
    'assessment', 'high', NOW() + INTERVAL '4 hours', FALSE, 'upcoming'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com'
WHERE l.email = 'abhirambikkina@gmail.com';

-- ---------------------------------------------------------------------------------
-- 10. HANDOVER NOTES (from Abhiram Bikkina - nurse)
-- ---------------------------------------------------------------------------------

INSERT INTO handover_notes (author_id, patient_id, type, priority, content, shift_direction)
SELECT l.user_id, pp.profile_id,
    'clinical', 'high',
    'Ani Edit (hypertension) — BP was 136/86 this morning, down from 140/90 two days ago. Amlodipine seems to be working. Renal function test sample due today — ensure the next shift collects it.',
    'FOR_NEXT'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com'
WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO handover_notes (author_id, patient_id, type, priority, content, shift_direction)
SELECT l.user_id, pp.profile_id,
    'general', 'normal',
    'Diya Bhat — presented mild nasal congestion this morning but otherwise comfortable. Cetirizine administered on schedule. CBC test result still pending.',
    'FOR_NEXT'
FROM login l,
     patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com'
WHERE l.email = 'abhirambikkina@gmail.com';

-- ---------------------------------------------------------------------------------
-- 11. AUDIT LOGS
-- ---------------------------------------------------------------------------------

INSERT INTO audit_logs (email, action, ip_address, details, timestamp)
VALUES
    ('manvitha3626@gmail.com',  'LOGIN_SUCCESS',       '203.0.113.10', 'method=password',                 NOW() - INTERVAL '2 hours'),
    ('riyomen.mikey@gmail.com', 'LOGIN_SUCCESS',       '203.0.113.11', 'method=password+2fa',              NOW() - INTERVAL '3 hours'),
    ('2004arjunk@gmail.com',    'LOGIN_SUCCESS',       '203.0.113.12', 'method=password+2fa',              NOW() - INTERVAL '4 hours'),
    ('abhirambikkina@gmail.com','LOGIN_SUCCESS',       '203.0.113.13', 'method=password',                 NOW() - INTERVAL '5 hours'),
    ('abhiramamrita@gmail.com', 'LOGIN_SUCCESS',       '203.0.113.14', 'method=password',                 NOW() - INTERVAL '5 hours'),
    ('diyabhat2005@gmail.com',  'LOGIN_SUCCESS',       '203.0.113.15', 'method=password',                 NOW() - INTERVAL '6 hours'),
    ('editzzz.ani@gmail.com',   'LOGIN_SUCCESS',       '203.0.113.16', 'method=password',                 NOW() - INTERVAL '6 hours'),
    ('abhirambikkina@gmail.com','VITAL_SIGNS_RECORDED','203.0.113.13', 'bp=120/78 hr=72 patient=diyabhat2005@gmail.com', NOW() - INTERVAL '1 hour'),
    ('abhirambikkina@gmail.com','VITAL_SIGNS_RECORDED','203.0.113.13', 'bp=136/86 hr=74 patient=editzzz.ani@gmail.com',  NOW() - INTERVAL '1 hour'),
    ('riyomen.mikey@gmail.com', 'PRESCRIPTION_CREATED','203.0.113.11', 'medication=Cetirizine patient=diyabhat2005@gmail.com', NOW() - INTERVAL '14 days'),
    ('2004arjunk@gmail.com',    'PRESCRIPTION_CREATED','203.0.113.12', 'medication=Amlodipine patient=editzzz.ani@gmail.com',  NOW() - INTERVAL '21 days'),
    ('riyomen.mikey@gmail.com', 'LAB_TEST_ORDERED',   '203.0.113.11', 'test=Serum IgE patient=diyabhat2005@gmail.com',        NOW() - INTERVAL '13 days'),
    ('2004arjunk@gmail.com',    'LAB_TEST_ORDERED',   '203.0.113.12', 'test=Lipid Panel patient=editzzz.ani@gmail.com',       NOW() - INTERVAL '20 days');

-- =================================================================================
-- ADDITIONS — New Doctor (Himabindu Prasad) + 10 New Patients
-- Password for ALL new users: SecurePassword2024 (same hash as above)
-- =================================================================================

-- ---------------------------------------------------------------------------------
-- A. NEW DOCTOR LOGIN
-- ---------------------------------------------------------------------------------

INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES (
    'himabindu9979@gmail.com',
    '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
    'DOCTOR', TRUE, TRUE, TRUE
);

-- ---------------------------------------------------------------------------------
-- B. NEW DOCTOR PROFILE
-- ---------------------------------------------------------------------------------

INSERT INTO doctor_profiles (user_id, first_name, last_name, specialty, department, contact_number, shift_start_time, shift_end_time, slot_duration_minutes)
SELECT user_id, 'Himabindu', 'Prasad', 'Pediatrics', 'Pediatrics', '555-1003', '09:00:00', '17:00:00', 30
FROM login WHERE email = 'himabindu9979@gmail.com';

-- Working days Mon–Fri
INSERT INTO doctor_working_days (doctor_profile_id, working_days)
SELECT dp.profile_id, day
FROM doctor_profiles dp
JOIN login l ON dp.user_id = l.user_id,
LATERAL (VALUES ('MONDAY'), ('TUESDAY'), ('WEDNESDAY'), ('THURSDAY'), ('FRIDAY')) AS days(day)
WHERE l.email = 'himabindu9979@gmail.com';

-- ---------------------------------------------------------------------------------
-- C. NEW PATIENT LOGINS (10 patients)
-- ---------------------------------------------------------------------------------

INSERT INTO login (email, password_hash, role, is_active, is_verified, two_factor_enabled)
VALUES
    ('john.doe.patient@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('priya.sharma.health@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('michael.chen.care@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('sarah.johnson.med@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('ravi.kumar.patient@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('emma.wilson.health@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('carlos.garcia.pt@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('amara.osei.patient@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('lisa.zhang.care@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE),
    ('david.brown.health@gmail.com',
     '$argon2id$v=19$m=4096,t=3,p=1$Vhabqz80TH4fFH9ehhbWKw$wBgy4sxJmmj3WLPlzGQLbqK9dEJbnslWc/J7xbwVmQ0',
     'PATIENT', TRUE, TRUE, FALSE);

-- ---------------------------------------------------------------------------------
-- D. NEW PATIENT PROFILES
-- Distributed: Dr. Mikey (4), Dr. Arjun (3), Dr. Himabindu (3)
-- All assigned to nurse abhirambikkina@gmail.com
-- ---------------------------------------------------------------------------------

-- John Doe → Dr. Mikey
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'John', 'Doe', '1985-03-22', 'Male', '555-2003', '45 Oak Ave, Brisbane',
    'Type 2 Diabetes — well controlled on metformin. Annual review required.',
    (SELECT user_id FROM login WHERE email = 'riyomen.mikey@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'john.doe.patient@gmail.com';

-- Priya Sharma → Dr. Arjun
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Priya', 'Sharma', '1990-07-14', 'Female', '555-2004', '33 Jasmine Rd, Perth',
    'No chronic illness. Occasional migraines. Vitamin D deficiency.',
    (SELECT user_id FROM login WHERE email = '2004arjunk@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'priya.sharma.health@gmail.com';

-- Michael Chen → Dr. Himabindu
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Michael', 'Chen', '1978-11-30', 'Male', '555-2005', '17 Maple St, Adelaide',
    'Asthma — mild intermittent. Uses salbutamol PRN. Non-smoker.',
    (SELECT user_id FROM login WHERE email = 'himabindu9979@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'michael.chen.care@gmail.com';

-- Sarah Johnson → Dr. Mikey
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Sarah', 'Johnson', '1995-01-08', 'Female', '555-2006', '29 Elm Close, Sydney',
    'Hypothyroidism — on levothyroxine 50mcg daily.',
    (SELECT user_id FROM login WHERE email = 'riyomen.mikey@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'sarah.johnson.med@gmail.com';

-- Ravi Kumar → Dr. Arjun
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Ravi', 'Kumar', '1970-05-19', 'Male', '555-2007', '8 Garden Blvd, Melbourne',
    'Stage 1 Hypertension. High cholesterol. On rosuvastatin 10mg.',
    (SELECT user_id FROM login WHERE email = '2004arjunk@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'ravi.kumar.patient@gmail.com';

-- Emma Wilson → Dr. Himabindu
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Emma', 'Wilson', '2001-09-03', 'Female', '555-2008', '52 Cedar Lane, Canberra',
    'Iron deficiency anaemia. On ferrous sulfate supplementation.',
    (SELECT user_id FROM login WHERE email = 'himabindu9979@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'emma.wilson.health@gmail.com';

-- Carlos Garcia → Dr. Mikey
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Carlos', 'Garcia', '1983-12-11', 'Male', '555-2009', '14 Pines Rd, Darwin',
    'GERD — on pantoprazole 40mg. No other conditions.',
    (SELECT user_id FROM login WHERE email = 'riyomen.mikey@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'carlos.garcia.pt@gmail.com';

-- Amara Osei → Dr. Arjun
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Amara', 'Osei', '1988-04-27', 'Female', '555-2010', '91 Willow Dr, Hobart',
    'Pre-diabetic. BMI 28. Diet and exercise plan in place.',
    (SELECT user_id FROM login WHERE email = '2004arjunk@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'amara.osei.patient@gmail.com';

-- Lisa Zhang → Dr. Himabindu
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'Lisa', 'Zhang', '1975-08-16', 'Female', '555-2011', '66 Birch Ct, Gold Coast',
    'Rheumatoid arthritis — on methotrexate 15mg weekly. Regular liver function monitoring.',
    (SELECT user_id FROM login WHERE email = 'himabindu9979@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'lisa.zhang.care@gmail.com';

-- David Brown → Dr. Mikey
INSERT INTO patient_profiles (user_id, first_name, last_name, date_of_birth, gender, contact_number, address, medical_history, assigned_doctor_id, assigned_nurse_id)
SELECT pl.user_id, 'David', 'Brown', '1962-02-28', 'Male', '555-2012', '3 Rosewood Ave, Newcastle',
    'COPD — mild. Ex-smoker. On tiotropium inhaler. Annual spirometry required.',
    (SELECT user_id FROM login WHERE email = 'riyomen.mikey@gmail.com'),
    (SELECT user_id FROM login WHERE email = 'abhirambikkina@gmail.com')
FROM login pl WHERE pl.email = 'david.brown.health@gmail.com';

-- ---------------------------------------------------------------------------------
-- E. APPOINTMENTS for new patients
-- ---------------------------------------------------------------------------------

-- John Doe — SCHEDULED with Dr. Mikey
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '7 days', 'SCHEDULED', 'Diabetes annual review'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'john.doe.patient@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Priya Sharma — PENDING_APPROVAL with Dr. Arjun
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '4 days', 'PENDING_APPROVAL', 'Migraine follow-up'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'priya.sharma.health@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Michael Chen — SCHEDULED with Dr. Himabindu
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '6 days', 'SCHEDULED', 'Asthma routine review'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'michael.chen.care@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

-- Sarah Johnson — COMPLETED past with Dr. Mikey
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit, doctor_notes)
SELECT pp.profile_id, l.user_id, NOW() - INTERVAL '10 days', 'COMPLETED', 'Thyroid function review',
    'TSH within normal range. Continue levothyroxine 50mcg. Review in 6 months.'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'sarah.johnson.med@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Ravi Kumar — SCHEDULED with Dr. Arjun
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '9 days', 'SCHEDULED', 'Blood pressure and cholesterol check'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'ravi.kumar.patient@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Emma Wilson — COMPLETED past with Dr. Himabindu
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit, doctor_notes)
SELECT pp.profile_id, l.user_id, NOW() - INTERVAL '7 days', 'COMPLETED', 'Iron deficiency follow-up',
    'Haemoglobin improving. Continue ferrous sulfate for 2 more months. Recheck CBC.'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'emma.wilson.health@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

-- Carlos Garcia — PENDING_APPROVAL with Dr. Mikey
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '2 days', 'PENDING_APPROVAL', 'GERD symptom review'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'carlos.garcia.pt@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Amara Osei — SCHEDULED with Dr. Arjun
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '11 days', 'SCHEDULED', 'Pre-diabetes lifestyle review'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'amara.osei.patient@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Lisa Zhang — SCHEDULED with Dr. Himabindu
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit)
SELECT pp.profile_id, l.user_id, NOW() + INTERVAL '8 days', 'SCHEDULED', 'Rheumatoid arthritis and liver function review'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'lisa.zhang.care@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

-- David Brown — COMPLETED past with Dr. Mikey
INSERT INTO appointments (patient_profile_id, doctor_id, appointment_date, status, reason_for_visit, doctor_notes)
SELECT pp.profile_id, l.user_id, NOW() - INTERVAL '30 days', 'COMPLETED', 'COPD spirometry review',
    'FEV1 stable at 72% predicted. Continue tiotropium. Smoking cessation reinforced. Flu vaccine administered.'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'david.brown.health@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- ---------------------------------------------------------------------------------
-- F. VITAL SIGNS for new patients (recorded by nurse Abhiram Bikkina)
-- ---------------------------------------------------------------------------------

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '128/82', 76, 98.6, 16, 98, 82.0, 178, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'john.doe.patient@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '110/70', 64, 98.4, 14, 99, 58.0, 160, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'priya.sharma.health@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '122/78', 72, 98.8, 18, 96, 74.0, 172, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'michael.chen.care@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '115/72', 68, 98.2, 15, 99, 60.0, 165, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'sarah.johnson.med@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '144/92', 80, 98.7, 17, 97, 88.0, 175, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'ravi.kumar.patient@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '108/68', 80, 98.0, 15, 99, 54.0, 163, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'emma.wilson.health@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '126/80', 74, 98.5, 16, 98, 78.0, 180, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'carlos.garcia.pt@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '130/84', 78, 98.6, 16, 98, 71.0, 168, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'amara.osei.patient@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '118/74', 70, 98.3, 15, 99, 63.0, 158, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'lisa.zhang.care@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

INSERT INTO vital_signs (patient_profile_id, nurse_id, blood_pressure, heart_rate, temperature, respiratory_rate, oxygen_saturation, weight, height, recorded_at)
SELECT pp.profile_id, l.user_id, '132/84', 76, 98.4, 19, 95, 80.0, 175, NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'david.brown.health@gmail.com',
login l WHERE l.email = 'abhirambikkina@gmail.com';

-- ---------------------------------------------------------------------------------
-- G. PRESCRIPTIONS for new patients
-- ---------------------------------------------------------------------------------

-- John Doe — Metformin (Dr. Mikey)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id, 'Metformin', '500mg', 'Twice daily with meals', '180 days',
    'Monitor blood glucose weekly. Report any GI side effects.',
    'ACTIVE', NOW() - INTERVAL '30 days', NOW() + INTERVAL '150 days', 2
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'john.doe.patient@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Sarah Johnson — Levothyroxine (Dr. Mikey)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id, 'Levothyroxine', '50mcg', 'Once daily on empty stomach', '365 days',
    'Take 30 mins before breakfast. Avoid calcium supplements within 4 hours.',
    'ACTIVE', NOW() - INTERVAL '10 days', NOW() + INTERVAL '355 days', 3
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'sarah.johnson.med@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Ravi Kumar — Rosuvastatin (Dr. Arjun)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id, 'Rosuvastatin', '10mg', 'Once daily at night', '90 days',
    'Monitor LFT every 3 months. Report any muscle pain immediately.',
    'ACTIVE', NOW() - INTERVAL '15 days', NOW() + INTERVAL '75 days', 1
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'ravi.kumar.patient@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Emma Wilson — Ferrous Sulfate (Dr. Himabindu)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id, 'Ferrous Sulfate', '200mg', 'Once daily with orange juice', '60 days',
    'Take with vitamin C to enhance absorption. May cause dark stools — this is normal.',
    'ACTIVE', NOW() - INTERVAL '7 days', NOW() + INTERVAL '53 days', 0
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'emma.wilson.health@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

-- Carlos Garcia — Pantoprazole (Dr. Mikey)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id, 'Pantoprazole', '40mg', 'Once daily before breakfast', '30 days',
    'Take 30 minutes before eating. Avoid spicy foods and late-night meals.',
    'ACTIVE', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', 1
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'carlos.garcia.pt@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Lisa Zhang — Methotrexate (Dr. Himabindu)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id, 'Methotrexate', '15mg', 'Once weekly on Monday', '180 days',
    'Take with folic acid supplement. Avoid alcohol completely. Monthly LFT monitoring required.',
    'ACTIVE', NOW() - INTERVAL '20 days', NOW() + INTERVAL '160 days', 2
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'lisa.zhang.care@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

-- David Brown — Tiotropium (Dr. Mikey)
INSERT INTO prescriptions (patient_profile_id, doctor_id, medication_name, dosage, frequency, duration, special_instructions, status, start_date, end_date, refills_remaining)
SELECT pp.profile_id, l.user_id, 'Tiotropium', '18mcg inhaler', 'Once daily via HandiHaler', '90 days',
    'Rinse mouth after each dose. Annual spirometry required.',
    'ACTIVE', NOW() - INTERVAL '30 days', NOW() + INTERVAL '60 days', 1
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'david.brown.health@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- ---------------------------------------------------------------------------------
-- H. LAB TESTS for new patients
-- ---------------------------------------------------------------------------------

-- John Doe — HbA1c COMPLETED
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, reference_range, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'HbA1c', 'Chemistry', '6.8', '%', '<5.7% normal / 5.7–6.4% pre-diabetic / ≥6.5% diabetic',
    'Good glycaemic control. Target <7%. Continue current regimen.',
    'COMPLETED', NOW() - INTERVAL '28 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'john.doe.patient@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- John Doe — Fasting Blood Glucose PENDING
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Fasting Blood Glucose', 'Chemistry',
    'Pre-appointment glucose check.', 'PENDING', NOW() - INTERVAL '1 day'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'john.doe.patient@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Ravi Kumar — Lipid Panel COMPLETED
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, reference_range, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Lipid Panel', 'Chemistry', 'LDL 145 / HDL 38 / TG 198', 'mg/dL', 'LDL <130 / HDL >40 / TG <150',
    'Elevated LDL and TG. Started rosuvastatin. Recheck in 3 months.',
    'COMPLETED', NOW() - INTERVAL '15 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'ravi.kumar.patient@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Emma Wilson — CBC COMPLETED
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, reference_range, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Complete Blood Count', 'Hematology', 'Hb 9.8 / MCV 72 / Ferritin 6', 'g/dL / fL / ng/mL', 'Hb >12 / MCV 80–100 / Ferritin 12–150',
    'Iron deficiency anaemia confirmed. Iron supplementation commenced.',
    'COMPLETED', NOW() - INTERVAL '7 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'emma.wilson.health@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

-- Lisa Zhang — Liver Function Test COMPLETED
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, reference_range, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Liver Function Test', 'Chemistry', 'ALT 28 / AST 31 / ALP 72 / Bilirubin 0.8', 'U/L / U/L / U/L / mg/dL', 'ALT <56 / AST <40 / ALP 44–147 / Bilirubin <1.2',
    'LFT within normal limits. Safe to continue methotrexate. Repeat in 4 weeks.',
    'COMPLETED', NOW() - INTERVAL '20 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'lisa.zhang.care@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

-- David Brown — Pulmonary Function Test COMPLETED
INSERT INTO lab_tests (patient_profile_id, ordered_by_id, test_name, test_category, result_value, unit, reference_range, remarks, status, ordered_at)
SELECT pp.profile_id, l.user_id, 'Pulmonary Function Test', 'Pulmonology', 'FEV1 72% / FVC 85% / FEV1/FVC 0.68', '% predicted / % predicted', 'FEV1 >80% / FVC >80% / FEV1/FVC ≥0.70',
    'Mild obstructive pattern consistent with COPD GOLD stage 1. Stable from last year.',
    'COMPLETED', NOW() - INTERVAL '30 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'david.brown.health@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- ---------------------------------------------------------------------------------
-- I. PATIENT CONSENTS for new patients
-- ---------------------------------------------------------------------------------

-- Treating doctor → each new patient (ALL access)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '30 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'john.doe.patient@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '4 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'priya.sharma.health@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '6 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'michael.chen.care@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '10 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'sarah.johnson.med@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '15 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'ravi.kumar.patient@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '7 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'emma.wilson.health@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '5 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'carlos.garcia.pt@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '11 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'amara.osei.patient@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '20 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'lisa.zhang.care@gmail.com',
login l WHERE l.email = 'himabindu9979@gmail.com';

INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '30 days'
FROM patient_profiles pp JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'david.brown.health@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Nurse Abhiram → all 10 new patients (VITAL_SIGNS, MEDICAL_RECORDS, PRESCRIPTIONS)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, unnested.consent_type, 'ACTIVE', NOW() - INTERVAL '1 day'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id,
login l,
(VALUES ('VITAL_SIGNS'), ('MEDICAL_RECORDS'), ('PRESCRIPTIONS')) AS unnested(consent_type)
WHERE pl.email IN (
    'john.doe.patient@gmail.com', 'priya.sharma.health@gmail.com', 'michael.chen.care@gmail.com',
    'sarah.johnson.med@gmail.com', 'ravi.kumar.patient@gmail.com', 'emma.wilson.health@gmail.com',
    'carlos.garcia.pt@gmail.com', 'amara.osei.patient@gmail.com', 'lisa.zhang.care@gmail.com',
    'david.brown.health@gmail.com'
) AND l.email = 'abhirambikkina@gmail.com';

-- Lab Tech Abhiramamrita → all 10 new patients (LAB_RESULTS access)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'LAB_RESULTS', 'ACTIVE', NOW() - INTERVAL '1 day'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id,
login l
WHERE pl.email IN (
    'john.doe.patient@gmail.com', 'priya.sharma.health@gmail.com', 'michael.chen.care@gmail.com',
    'sarah.johnson.med@gmail.com', 'ravi.kumar.patient@gmail.com', 'emma.wilson.health@gmail.com',
    'carlos.garcia.pt@gmail.com', 'amara.osei.patient@gmail.com', 'lisa.zhang.care@gmail.com',
    'david.brown.health@gmail.com'
) AND l.email = 'abhiramamrita@gmail.com';

-- ---------------------------------------------------------------------------------
-- J. AUDIT LOGS for new users
-- ---------------------------------------------------------------------------------

INSERT INTO audit_logs (email, action, ip_address, details, timestamp)
VALUES
    ('himabindu9979@gmail.com',       'LOGIN_SUCCESS',        '203.0.113.20', 'method=password+2fa',                                               NOW() - INTERVAL '1 hour'),
    ('john.doe.patient@gmail.com',    'LOGIN_SUCCESS',        '203.0.113.21', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('priya.sharma.health@gmail.com', 'LOGIN_SUCCESS',        '203.0.113.22', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('michael.chen.care@gmail.com',   'LOGIN_SUCCESS',        '203.0.113.23', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('sarah.johnson.med@gmail.com',   'LOGIN_SUCCESS',        '203.0.113.24', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('ravi.kumar.patient@gmail.com',  'LOGIN_SUCCESS',        '203.0.113.25', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('emma.wilson.health@gmail.com',  'LOGIN_SUCCESS',        '203.0.113.26', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('carlos.garcia.pt@gmail.com',    'LOGIN_SUCCESS',        '203.0.113.27', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('amara.osei.patient@gmail.com',  'LOGIN_SUCCESS',        '203.0.113.28', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('lisa.zhang.care@gmail.com',     'LOGIN_SUCCESS',        '203.0.113.29', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('david.brown.health@gmail.com',  'LOGIN_SUCCESS',        '203.0.113.30', 'method=password',                                                   NOW() - INTERVAL '1 day'),
    ('himabindu9979@gmail.com',       'PRESCRIPTION_CREATED', '203.0.113.20', 'medication=Ferrous Sulfate patient=emma.wilson.health@gmail.com',    NOW() - INTERVAL '7 days'),
    ('himabindu9979@gmail.com',       'PRESCRIPTION_CREATED', '203.0.113.20', 'medication=Methotrexate patient=lisa.zhang.care@gmail.com',          NOW() - INTERVAL '20 days'),
    ('himabindu9979@gmail.com',       'LAB_TEST_ORDERED',     '203.0.113.20', 'test=CBC patient=emma.wilson.health@gmail.com',                      NOW() - INTERVAL '7 days'),
    ('himabindu9979@gmail.com',       'LAB_TEST_ORDERED',     '203.0.113.20', 'test=Liver Function Test patient=lisa.zhang.care@gmail.com',         NOW() - INTERVAL '20 days'),
    ('riyomen.mikey@gmail.com',       'PRESCRIPTION_CREATED', '203.0.113.11', 'medication=Metformin patient=john.doe.patient@gmail.com',            NOW() - INTERVAL '30 days'),
    ('riyomen.mikey@gmail.com',       'PRESCRIPTION_CREATED', '203.0.113.11', 'medication=Levothyroxine patient=sarah.johnson.med@gmail.com',       NOW() - INTERVAL '10 days'),
    ('riyomen.mikey@gmail.com',       'PRESCRIPTION_CREATED', '203.0.113.11', 'medication=Tiotropium patient=david.brown.health@gmail.com',         NOW() - INTERVAL '30 days'),
    ('riyomen.mikey@gmail.com',       'LAB_TEST_ORDERED',     '203.0.113.11', 'test=HbA1c patient=john.doe.patient@gmail.com',                     NOW() - INTERVAL '28 days'),
    ('2004arjunk@gmail.com',          'PRESCRIPTION_CREATED', '203.0.113.12', 'medication=Rosuvastatin patient=ravi.kumar.patient@gmail.com',       NOW() - INTERVAL '15 days'),
    ('2004arjunk@gmail.com',          'LAB_TEST_ORDERED',     '203.0.113.12', 'test=Lipid Panel patient=ravi.kumar.patient@gmail.com',              NOW() - INTERVAL '15 days');

-- ---------------------------------------------------------------------------------
-- 12. PATIENT CONSENTS
--     Grant staff access to patient data so dashboards are not blocked.
--     consent_type values: MEDICAL_RECORDS | LAB_RESULTS | PRESCRIPTIONS | VITAL_SIGNS | ALL
--     status values: ACTIVE | REVOKED
-- ---------------------------------------------------------------------------------

-- Dr. Mikey → Diya (ALL access — treating physician)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '14 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'riyomen.mikey@gmail.com';

-- Dr. Arjun → Ani (ALL access — treating physician)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'ALL', 'ACTIVE', NOW() - INTERVAL '21 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = '2004arjunk@gmail.com';

-- Nurse Abhiram → Diya (VITAL_SIGNS + MEDICAL_RECORDS access)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, unnested.consent_type, 'ACTIVE', NOW() - INTERVAL '14 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l,
(VALUES ('VITAL_SIGNS'), ('MEDICAL_RECORDS'), ('PRESCRIPTIONS')) AS unnested(consent_type)
WHERE l.email = 'abhirambikkina@gmail.com';

-- Nurse Abhiram → Ani (VITAL_SIGNS + MEDICAL_RECORDS access)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, unnested.consent_type, 'ACTIVE', NOW() - INTERVAL '21 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l,
(VALUES ('VITAL_SIGNS'), ('MEDICAL_RECORDS'), ('PRESCRIPTIONS')) AS unnested(consent_type)
WHERE l.email = 'abhirambikkina@gmail.com';

-- Lab Tech Abhiramamrita → Diya (LAB_RESULTS access)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'LAB_RESULTS', 'ACTIVE', NOW() - INTERVAL '13 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'diyabhat2005@gmail.com',
login l WHERE l.email = 'abhiramamrita@gmail.com';

-- Lab Tech Abhiramamrita → Ani (LAB_RESULTS access)
INSERT INTO patient_consents (patient_id, granted_to_id, consent_type, status, granted_at)
SELECT pp.profile_id, l.user_id, 'LAB_RESULTS', 'ACTIVE', NOW() - INTERVAL '20 days'
FROM patient_profiles pp
JOIN login pl ON pp.user_id = pl.user_id AND pl.email = 'editzzz.ani@gmail.com',
login l WHERE l.email = 'abhiramamrita@gmail.com';
