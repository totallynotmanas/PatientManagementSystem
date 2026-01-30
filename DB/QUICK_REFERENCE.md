# RBAC & Database Quick Reference Guide

## 🎯 Quick Start (5 minutes)

### 1. Copy Supabase Client
```bash
cp DB/supabaseClient.js frontend/app/src/lib/
```

### 2. Set Environment Variables
```bash
cd frontend/app
# Create .env.local file
# Copy variables from DB/.env.example
# Add your Supabase URL and Anon Key
```

### 3. Install Package
```bash
npm install @supabase/supabase-js
```

### 4. Use in Components
```javascript
import { signUpUser, signInUser, getCurrentUser } from '../lib/supabaseClient';
```

---

## 🔑 Key Concepts

### What is RBAC?
**Role-Based Access Control** - Users have roles, roles have permissions.

Example:
- Patient role → Can see own records only
- Doctor role → Can see consented patient records
- Admin role → Can see all records

### What is RLS?
**Row-Level Security** - Database enforces access rules automatically.

Without RLS: Application must check access (can be hacked)
With RLS: Database refuses to return data (can't be hacked)

### What is JWT?
**JSON Web Token** - Contains encrypted user info including role.

Flow:
1. User logs in → Server creates JWT
2. Frontend stores JWT
3. Every API call includes JWT
4. Server verifies JWT signature
5. Database checks role from JWT

---

## 👥 User Roles Matrix

```
┌────────────────┬──────────────────┬───────────────────────────────┐
│ Role           │ Primary Access   │ Key Restrictions              │
├────────────────┼──────────────────┼───────────────────────────────┤
│ ADMIN          │ Everything       │ Can delete/modify any data    │
│ DOCTOR         │ Patients         │ Only consented patients       │
│ NURSE          │ Patients         │ Read-only on most data        │
│ LAB_TECH       │ Lab results      │ Cannot access clinical notes  │
│ PATIENT        │ Own data         │ Cannot view other patients    │
└────────────────┴──────────────────┴───────────────────────────────┘
```

---

## 📋 Table Access by Role

### medical_records
```
ADMIN         → SELECT, INSERT, UPDATE, DELETE (all records)
DOCTOR        → SELECT (own + consented), INSERT (own)
NURSE         → SELECT (assigned), INSERT (own)
LAB_TECH      → ❌ NO ACCESS
PATIENT       → SELECT (own only)
```

### prescriptions
```
ADMIN         → Full access
DOCTOR        → SELECT (own), INSERT (own)
NURSE         → SELECT (assigned)
LAB_TECH      → ❌ NO ACCESS
PATIENT       → SELECT (own only)
```

### lab_results
```
ADMIN         → Full access
DOCTOR        → SELECT (own orders)
NURSE         → ❌ NO ACCESS
LAB_TECH      → SELECT (own), UPDATE (own)
PATIENT       → SELECT (own only)
```

---

## 🔐 Authentication Flow

```
User visits login page
         ↓
Enters email & password
         ↓
signInUser() function
         ↓
Supabase validates credentials
         ↓
Supabase creates JWT token
         ↓
Frontend stores JWT in localStorage
         ↓
JWT sent with every API request
         ↓
Database checks role in JWT
         ↓
RLS policy allows/blocks access
         ↓
User sees only permitted data
```

---

## 💻 Common Code Examples

### Register New Patient
```javascript
import { signUpUser } from '../lib/supabaseClient';

const result = await signUpUser(
  'patient@example.com',
  'Password123!',
  {
    full_name: 'John Doe',
    phone_number: '+1-555-0001',
    role: 'patient',
    date_of_birth: '1990-01-15'
  }
);

if (result.error) {
  console.error('Signup failed:', result.error.message);
} else {
  console.log('User created:', result.data.user.id);
}
```

### Login User
```javascript
import { signInUser } from '../lib/supabaseClient';

const { data, error } = await signInUser(
  'patient@example.com',
  'Password123!'
);

if (data.user) {
  // Redirect to dashboard
  navigate('/dashboard');
  
  // Check user role
  const role = data.user.user_metadata?.role;
  console.log('User role:', role);
}
```

### Get Patient Records (auto-filtered by role)
```javascript
import { getPatientRecords } from '../lib/supabaseClient';

// For patients, this returns only their own records
// For doctors, this returns records of consented patients
// For nurses, this returns assigned patient records
// For lab techs, throws error (no access)

const { data: records, error } = await getPatientRecords(patientId);
```

### Grant Consent (GDPR)
```javascript
import { grantConsent } from '../lib/supabaseClient';

const { data, error } = await grantConsent(
  patientId,
  'data_sharing',
  doctorId,
  'Access to prescriptions, lab results',
  null // No expiration
);

// Doctor can now see this patient's records
```

### Log Access Event
```javascript
import { logAuditEvent } from '../lib/supabaseClient';

// Automatically called by read/write functions
// You can also call manually:
await logAuditEvent(
  'read',
  'medical_records',
  patientId,
  'success'
);
```

### Protected Route Component
```javascript
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/supabaseClient';
import { Navigate } from 'react-router-dom';

function DoctorDashboard() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user?.user_metadata?.role === 'doctor') {
        setAuthorized(true);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!authorized) return <Navigate to="/" />;

  return <div>Doctor Dashboard Content</div>;
}
```

---

## 🐛 Debugging Tips

### Check Current User Role
```javascript
const user = await getCurrentUser();
console.log('User role:', user?.user_metadata?.role);
```

### Verify JWT Token
```javascript
const session = await getUserSession();
console.log('JWT token:', session?.access_token);
// Decode at https://jwt.io/ to inspect claims
```

### Check RLS Policies
```sql
-- In Supabase SQL Editor
SELECT schemaname, tablename, policyname, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### View Audit Logs
```sql
-- See all access events
SELECT user_id, action, resource_type, status, created_at
FROM audit_logs
ORDER BY created_at DESC
LIMIT 50;

-- See failed access attempts
SELECT * FROM audit_logs
WHERE status = 'access_denied'
ORDER BY created_at DESC;
```

### Test RLS Policy
```sql
-- Connect as doctor user
SET ROLE doctor;

-- Try to access patient record
SELECT * FROM medical_records
WHERE patient_id = '...' 
-- Should fail if no consent
```

---

## 🚨 Common Issues & Solutions

### Issue: "Policy violates"
**Cause:** User trying to access data their role doesn't permit
**Fix:** Check RLS policy allows action, verify user role, check consent

### Issue: "Auth token expired"
**Cause:** JWT token has expired (default 1 hour)
**Fix:** Refresh token or re-login
```javascript
// Refresh token
const { data, error } = await supabase.auth.refreshSession();
```

### Issue: "Records are empty"
**Cause:** RLS is blocking access
**Fix:** 
1. Verify user is authenticated
2. Check user role matches policy
3. If patient access: check consent exists
4. Review audit logs for "access_denied"

### Issue: "Role not showing in JWT"
**Cause:** Role not synced from database
**Fix:** Ensure trigger sync_role_to_jwt is created:
```sql
CREATE OR REPLACE FUNCTION sync_role_to_jwt()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users 
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'::jsonb),
    '{role}',
    to_jsonb(NEW.role)
  )
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_auth_role
AFTER INSERT OR UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION sync_role_to_jwt();
```

---

## 📈 Performance Optimization

### Add Indexes
```sql
-- Already included in schema.sql
-- Key indexes:
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### Query Optimization
```javascript
// ❌ Inefficient: Multiple queries
const user = await getUser(id);
const records = await getRecords(user.id);
const consents = await getConsents(user.id);

// ✅ Efficient: Join in single query
const { data } = await supabase
  .from('users')
  .select(`
    id, role,
    patient_profiles(*),
    medical_records(*)
  `)
  .eq('id', userId)
  .single();
```

---

## 🔒 Security Checklist

- [ ] All auth tokens use HTTPS only
- [ ] JWT tokens stored securely (httpOnly cookie better than localStorage)
- [ ] No sensitive data in JWT token body
- [ ] RLS policies enabled on all tables
- [ ] Audit logging enabled for all sensitive operations
- [ ] Encryption at rest enabled in Supabase
- [ ] Regular backups configured
- [ ] Breach monitoring in place
- [ ] Rate limiting enabled on auth endpoints
- [ ] CORS properly configured

---

## 🧪 Testing Credentials

Use these for development/testing:

```
Admin:
Email: admin@patientsystem.com
Role: admin

Doctor:
Email: dr.smith@patientsystem.com
Role: doctor

Patient:
Email: patient1@example.com
Role: patient
```

All have password: `Test123!@#` (from seed data - change in production)

---

## 📚 Learn More

| Topic | Resource |
|-------|----------|
| Supabase Basics | https://supabase.com/docs |
| PostgreSQL RLS | https://www.postgresql.org/docs/current/ddl-rowsecurity.html |
| JWT Tokens | https://jwt.io/ |
| HIPAA Rules | https://www.hhs.gov/hipaa/for-professionals/privacy/index.html |
| GDPR | https://gdpr-info.eu/ |
| React Auth | https://reactrouter.com/docs/en/v6 |

---

## 📞 Support

**Having issues?**

1. Check audit logs: `SELECT * FROM audit_logs ORDER BY created_at DESC;`
2. Verify RLS policies: `SELECT * FROM pg_policies;`
3. Check Supabase Dashboard → Logs
4. Review this quick reference
5. Consult DB_README.md for detailed docs

---

**Version:** 1.0  
**Last Updated:** January 29, 2026
**Questions?** Check SETUP_GUIDE.md for detailed instructions
