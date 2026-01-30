# Patient Management System - Database Setup Guide

## Overview
This database implements a **HIPAA and GDPR-compliant** patient management system using **Supabase** (PostgreSQL) with **Role-Based Access Control (RBAC)**, audit logging, and patient consent management.

---

## 📁 Database Folder Structure

```
DB/
├── DB_README.md                 # This file - Database documentation
├── schema.sql                   # Complete database schema with RBAC tables
├── seed_data.sql               # Sample data for development/testing
├── rls_policies.sql            # Row-Level Security (RLS) policies for RBAC
├── supabaseClient.js           # Supabase JavaScript client library
├── .env.example                # Environment variables template
└── setup-guide.md              # Detailed setup instructions
```

---

## 🔐 Role-Based Access Control (RBAC)

The system implements **5 user roles** with distinct permissions:

### 1. **Admin** (`admin`)
- Full system access
- Can manage users and view all records
- Access to breach notifications and audit logs
- Can verify healthcare providers
- **Permissions:**
  - View all users, patient records, and medical data
  - Manage system settings
  - Generate compliance reports
  - View audit logs

### 2. **Doctor** (`doctor`)
- Access to assigned patients' medical records
- Can create diagnoses, consultations, and prescriptions
- Can order lab tests and imaging
- Can document treatment plans
- **Permissions:**
  - View appointment list
  - Create/update medical records for assigned patients
  - Create and manage prescriptions
  - Order lab tests
  - View patient history and lab results
  - Document clinical notes

### 3. **Nurse** (`nurse`)
- Can document patient observations and vital signs
- Assists with patient care coordination
- Cannot prescribe medications
- Read/limited write access to patient records
- **Permissions:**
  - View assigned patient records
  - Log vital signs and observations
  - Document patient interactions
  - View appointments and schedules
  - Cannot modify prescriptions or diagnoses

### 4. **Lab Technician** (`lab_technician`)
- Process and document lab test results
- Can only view assigned lab work
- Cannot access clinical notes or prescriptions
- **Permissions:**
  - View lab orders assigned to them
  - Update lab result values and status
  - Document test completion
  - Cannot access patient clinical information

### 5. **Patient** (`patient`)
- View own medical records and health data
- Request data export
- Manage consent for data sharing
- Cannot view other patients' data
- **Permissions:**
  - View personal medical records
  - View prescriptions
  - View lab results
  - Schedule appointments
  - Grant/revoke consent for data sharing
  - Request data export

---

## 📊 Database Tables

### **Core Tables**

#### `users` - User Authentication & Profile
Stores all system users with role information.

```sql
Fields:
- id (UUID): Primary key
- email (VARCHAR): Unique email address
- role (ENUM): admin, doctor, nurse, lab_technician, patient
- full_name (VARCHAR): User's full name
- phone_number (VARCHAR): Contact number
- is_active (BOOLEAN): Account status
- last_login (TIMESTAMP): Last login time
- created_at, updated_at: Timestamps
```

**Security Features:**
- Email format validation
- Active/inactive status management
- Last login tracking for security
- Audit fields for creator tracking

---

#### `patient_profiles` - Patient Health Information
Extended profile information for patients.

```sql
Fields:
- id (UUID): Primary key
- user_id (UUID FK): Reference to users table
- date_of_birth (DATE): DOB
- gender (VARCHAR): Male, Female, Other, Prefer not to say
- blood_type (VARCHAR): O+, O-, A+, A-, B+, B-, AB+, AB-
- height_cm, weight_kg (NUMERIC): Biometric data
- allergies (TEXT): Known allergies
- emergency_contact_name, phone (VARCHAR): Emergency contact
- medical_history (TEXT): Historical medical information
```

**Compliance Features:**
- GDPR: Only necessary data collected
- HIPAA: Sensitive health information secured
- Minimal data principle applied

---

#### `provider_profiles` - Healthcare Provider Credentials
Extended profile for doctors, nurses, and technicians.

```sql
Fields:
- id (UUID): Primary key
- user_id (UUID FK): Reference to users table
- license_number (VARCHAR): Professional license (unique, audited)
- specialization (VARCHAR): Medical specialty
- qualification (TEXT): Educational qualifications
- years_of_experience (INT): Professional experience
- department (VARCHAR): Department assignment
- is_verified (BOOLEAN): License verification status
- verified_by (UUID FK): Admin who verified
```

---

### **Medical Records Tables**

#### `medical_records` - Patient Clinical Documents
Core storage for patient medical information.

```sql
Fields:
- id, patient_id, created_by (UUID)
- record_type (ENUM): diagnosis, prescription, lab_result, consultation, treatment, imaging, vaccination
- title, description (VARCHAR/TEXT)
- is_sensitive (BOOLEAN): Flag for highly sensitive data
- created_at, updated_at (TIMESTAMP)
```

**Features:**
- Comprehensive categorization of medical records
- Audit trail via created_by field
- Sensitive data flagging

---

#### `prescriptions` - Medication Orders
Medication management and tracking.

```sql
Fields:
- id, patient_id, prescribed_by (UUID)
- medication_name, dosage, frequency (VARCHAR)
- duration_days (INT): Treatment duration
- start_date, end_date (DATE)
- instructions (TEXT)
- status (ENUM): active, completed, discontinued
```

---

#### `lab_results` - Laboratory Test Results
Lab test ordering and result documentation.

```sql
Fields:
- id, patient_id, ordered_by, lab_technician_id (UUID)
- test_name, test_category (VARCHAR)
- result_value, normal_range, unit (VARCHAR)
- status (ENUM): pending, completed, reviewed, cancelled
- result_date, reviewed_at (DATE/TIMESTAMP)
- reviewed_by (UUID): Doctor who reviewed
```

**Workflow:**
1. Doctor orders test → status: `pending`
2. Lab tech processes → status: `completed`
3. Doctor reviews → status: `reviewed`

---

#### `appointments` - Patient-Provider Scheduling
Appointment management system.

```sql
Fields:
- id, patient_id, provider_id (UUID)
- appointment_date (TIMESTAMP)
- duration_minutes (INT)
- type (ENUM): in-person, telemedicine, follow-up
- status (ENUM): scheduled, completed, cancelled, no-show
```

---

### **Consent & Privacy Tables**

#### `patient_consents` - Consent Management (GDPR Compliance)
Tracks patient consent for data access and treatment.

```sql
Fields:
- id, patient_id, granted_to (UUID)
- consent_type (ENUM): data_sharing, treatment, research, telemedicine, export
- scope (TEXT): What data/services are authorized
- is_active (BOOLEAN)
- granted_at, revoked_at, expires_at (TIMESTAMP)
```

**Features:**
- Granular consent tracking
- Consent expiration support
- Revocation audit trail
- Specific scope documentation

**Example Use Cases:**
```json
{
  "consent_type": "data_sharing",
  "granted_to": "doctor_id",
  "scope": "Access to: prescriptions, lab results, imaging reports",
  "expires_at": "2026-01-29"
}
```

---

### **Compliance & Audit Tables**

#### `audit_logs` - System Audit Trail (HIPAA Requirement)
Comprehensive logging of all system access and modifications.

```sql
Fields:
- id, user_id (UUID)
- action (ENUM): create, read, update, delete, export, access_denied, login, logout
- resource_type (VARCHAR): Entity type (e.g., patient_record, prescription)
- resource_id (UUID): Specific resource accessed
- resource_details (JSONB): Details about the action
- ip_address (INET): Source IP
- user_agent (TEXT): Browser/app info
- status (ENUM): success, failure, unauthorized
- error_message (TEXT): If applicable
- created_at (TIMESTAMP)
```

**Purpose:**
- Track WHO accessed WHAT and WHEN
- Detect unauthorized access attempts
- Support forensic analysis in case of breaches
- Compliance with HIPAA audit requirements

**Indexed for Performance:**
- By user_id: Find all actions by a user
- By resource_id: Find all access to a record
- By created_at: Time-based queries
- By action: Filter by operation type

---

#### `breach_notifications` - Data Breach Logging (HIPAA Requirement)
Incident reporting and tracking.

```sql
Fields:
- id, reported_by (UUID)
- breach_date, discovery_date (TIMESTAMP)
- affected_records_count (INT)
- breach_type (ENUM): unauthorized_access, data_loss, system_compromise, insider_threat, other
- description, containment_measures (TEXT)
- affected_users (JSONB): Array of affected user IDs
- status (ENUM): open, resolved, under_investigation
```

---

## 🔒 Security Features

### 1. **Row-Level Security (RLS)**
All sensitive tables have RLS enabled with role-based policies:

```sql
-- Example: Patients can only see their own records
CREATE POLICY "Patient view own records" ON medical_records
  FOR SELECT USING (patient_id = auth.uid());
```

### 2. **Authentication**
- Uses Supabase Auth (managed JWT tokens)
- Password hashing with bcrypt
- Session management
- Optional MFA support

### 3. **Data Encryption**
- **In Transit:** SSL/TLS (HTTPS)
- **At Rest:** PostgreSQL encryption
- Sensitive fields can use additional encryption

### 4. **Audit Logging**
Every access to patient data is logged with:
- User ID
- Action type
- Resource accessed
- Timestamp
- IP address
- Success/failure status

### 5. **Consent Management**
Granular consent system prevents unauthorized access:
- Doctors can only access consented patient data
- Patients can revoke access at any time
- Consent expiration support
- Scope-based permissions

---

## 🚀 Quick Setup Guide

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save URL and API keys

### Step 2: Initialize Database
1. Go to Supabase Dashboard → SQL Editor
2. Copy and paste contents of `schema.sql`
3. Execute script
4. Apply `rls_policies.sql` for security

### Step 3: Load Sample Data
In SQL Editor:
```sql
-- Run seed_data.sql (optional, for testing)
```

### Step 4: Configure Frontend
Create `.env.local` in `frontend/app/`:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

### Step 5: Install Dependencies
```bash
cd frontend/app
npm install @supabase/supabase-js
```

### Step 6: Use Supabase Client
Import and use in React:
```javascript
import { supabase, signUpUser, signInUser } from '../../lib/supabaseClient';
```

---

## 📝 Usage Examples

### Register New Patient
```javascript
const { data, error } = await signUpUser(
  'patient@example.com',
  'SecurePassword123!',
  {
    full_name: 'John Doe',
    phone_number: '+1-555-0001',
    role: 'patient',
    date_of_birth: '1990-01-15'
  }
);
```

### Grant Consent
```javascript
await grantConsent(
  patientId,
  'data_sharing',
  doctorId,
  'Access to prescriptions, lab results, and imaging reports',
  expiryDate
);
```

### Access Medical Records
```javascript
const { data: records } = await getPatientRecords(patientId);
// RLS policies automatically filter based on user role and consent
```

### Log Access Event
```javascript
await logAuditEvent('read', 'medical_records', patientId, 'success');
```

---

## 📋 HIPAA Compliance Checklist

- ✅ Audit logging of all PHI access
- ✅ Role-based access control
- ✅ Encryption in transit (HTTPS)
- ✅ Data integrity checks
- ✅ User authentication
- ✅ Breach notification system
- ✅ Consent management
- ✅ Minimum necessary data principle

---

## 📋 GDPR Compliance Checklist

- ✅ Right to access (patient views own data)
- ✅ Right to rectification (patient updates profile)
- ✅ Right to erasure (account deletion)
- ✅ Right to data portability (export functionality)
- ✅ Right to object to processing (consent-based)
- ✅ Granular consent management
- ✅ Privacy by design
- ✅ Audit trails for transparency

---

## 🔧 Troubleshooting

### RLS Policies Not Working
- Ensure you're authenticated with Supabase Auth
- Check JWT token contains correct role claim
- Verify policy syntax in `rls_policies.sql`

### Audit Logs Not Recording
- Ensure `audit_logs` table exists
- Check application is calling `logAuditEvent()`
- Verify user permissions on audit_logs table

### Consent Not Blocking Access
- Verify consent policy is applied to table
- Check consent is_active status
- Ensure expiry date is in future

---

## 📚 Further Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [HIPAA Compliance Guide](https://www.hhs.gov/hipaa)
- [GDPR Requirements](https://gdpr-info.eu/)

---

## 🤝 Support

For questions or issues:
1. Check Supabase Dashboard logs
2. Review audit_logs table for errors
3. Consult PostgreSQL documentation
4. Contact your database administrator
