-- ============================================================================
-- SUPABASE CONFIGURATION & SETUP GUIDE
-- ============================================================================

-- 1. CREATE SUPABASE POLICIES FOR RBAC
-- These policies enforce role-based access control at the database level

-- ============================================================================
-- ADMIN POLICIES
-- ============================================================================

-- Admins can see all users
CREATE POLICY "Admin view all users" ON users
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- Admins can update any user
CREATE POLICY "Admin update users" ON users
  FOR UPDATE USING (
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- Admins can see all records
CREATE POLICY "Admin view all records" ON medical_records
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- ============================================================================
-- DOCTOR POLICIES
-- ============================================================================

-- Doctors can see their patient appointments
CREATE POLICY "Doctor view assigned appointments" ON appointments
  FOR SELECT USING (
    provider_id = auth.uid() OR 
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- Doctors can create medical records for their patients
CREATE POLICY "Doctor create medical records" ON medical_records
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'user_role' = 'doctor' AND
    created_by = auth.uid()
  );

-- Doctors can update their own medical records
CREATE POLICY "Doctor update own records" ON medical_records
  FOR UPDATE USING (
    created_by = auth.uid() AND
    auth.jwt() ->> 'user_role' = 'doctor'
  );

-- Doctors can view prescriptions they created
CREATE POLICY "Doctor view own prescriptions" ON prescriptions
  FOR SELECT USING (
    prescribed_by = auth.uid() OR
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- Doctors can create prescriptions
CREATE POLICY "Doctor create prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'user_role' = 'doctor' AND
    prescribed_by = auth.uid()
  );

-- ============================================================================
-- NURSE POLICIES
-- ============================================================================

-- Nurses can view patient records (read-only or limited write)
CREATE POLICY "Nurse view assigned patient records" ON medical_records
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'nurse'
  );

-- Nurses can create medical records (observations, vitals)
CREATE POLICY "Nurse create medical records" ON medical_records
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'user_role' = 'nurse' AND
    created_by = auth.uid() AND
    record_type IN ('consultation', 'treatment')
  );

-- Nurses can view appointments
CREATE POLICY "Nurse view appointments" ON appointments
  FOR SELECT USING (
    auth.jwt() ->> 'user_role' = 'nurse'
  );

-- ============================================================================
-- LAB TECHNICIAN POLICIES
-- ============================================================================

-- Lab technicians can view lab results assigned to them
CREATE POLICY "Lab tech view assigned results" ON lab_results
  FOR SELECT USING (
    lab_technician_id = auth.uid() OR
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- Lab technicians can update lab results
CREATE POLICY "Lab tech update results" ON lab_results
  FOR UPDATE USING (
    lab_technician_id = auth.uid() AND
    auth.jwt() ->> 'user_role' = 'lab_technician'
  );

-- Lab technicians can create lab result entries
CREATE POLICY "Lab tech create results" ON lab_results
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'user_role' = 'lab_technician' AND
    lab_technician_id = auth.uid()
  );

-- ============================================================================
-- PATIENT POLICIES
-- ============================================================================

-- Patients can only see their own data
CREATE POLICY "Patient view own profile" ON patient_profiles
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Patients can update their own profile
CREATE POLICY "Patient update own profile" ON patient_profiles
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Patients can view their own medical records
CREATE POLICY "Patient view own records" ON medical_records
  FOR SELECT USING (
    patient_id = auth.uid()
  );

-- Patients can view their own prescriptions
CREATE POLICY "Patient view own prescriptions" ON prescriptions
  FOR SELECT USING (
    patient_id = auth.uid()
  );

-- Patients can view their own lab results
CREATE POLICY "Patient view own lab results" ON lab_results
  FOR SELECT USING (
    patient_id = auth.uid()
  );

-- Patients can view their own appointments
CREATE POLICY "Patient view own appointments" ON appointments
  FOR SELECT USING (
    patient_id = auth.uid()
  );

-- Patients can create appointments
CREATE POLICY "Patient create appointments" ON appointments
  FOR INSERT WITH CHECK (
    patient_id = auth.uid()
  );

-- Patients can manage their own consents
CREATE POLICY "Patient view own consents" ON patient_consents
  FOR SELECT USING (
    patient_id = auth.uid()
  );

CREATE POLICY "Patient create consents" ON patient_consents
  FOR INSERT WITH CHECK (
    patient_id = auth.uid()
  );

CREATE POLICY "Patient revoke consents" ON patient_consents
  FOR UPDATE USING (
    patient_id = auth.uid()
  );

-- ============================================================================
-- AUDIT LOG POLICIES (Read-only for users)
-- ============================================================================

-- Users can view their own audit logs
CREATE POLICY "User view own audit logs" ON audit_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    auth.jwt() ->> 'user_role' = 'admin'
  );

-- System can insert audit logs
CREATE POLICY "System insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
