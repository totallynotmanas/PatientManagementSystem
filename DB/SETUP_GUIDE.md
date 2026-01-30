# Supabase Setup Guide for Patient Management System

## Complete Step-by-Step Instructions

### Prerequisites
- Node.js 14+ installed
- npm or yarn
- Supabase account (free at https://supabase.com)
- Git

---

## Step 1: Create Supabase Project

### 1.1 Create Organization & Project
1. Go to https://supabase.com and sign up/login
2. Click **"New Project"**
3. Fill in project details:
   - **Project Name:** `patient-management-system`
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Select closest to your location
4. Click **"Create New Project"** (wait 2-3 minutes for setup)

### 1.2 Get Your Credentials
After project creation:
1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xyzabc123.supabase.co`)
   - **Anon Public Key** (long JWT token)
3. Save these securely

---

## Step 2: Initialize Database Schema

### 2.1 Access SQL Editor
1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**

### 2.2 Create Schema
1. Copy entire contents of `DB/schema.sql`
2. Paste into SQL Editor
3. Click **"Run"** button
4. Wait for execution to complete (watch for ✓ check mark)

### 2.3 Apply RLS Policies
1. Create a new query in SQL Editor
2. Copy entire contents of `DB/rls_policies.sql`
3. Paste and run

### 2.4 Load Sample Data (Optional)
1. Create a new query
2. Copy entire contents of `DB/seed_data.sql`
3. Paste and run
4. This creates test users and sample data

---

## Step 3: Configure Authentication

### 3.1 Enable Email Authentication
1. Go to **Authentication** (left sidebar)
2. Click **"Providers"** tab
3. Find **Email** provider
4. Ensure it's **enabled** (toggle ON)
5. Configure settings:
   - Enable sign-ups: **ON**
   - Enable email confirmations: Can be OFF for development

### 3.2 Set Redirect URLs
1. Still in Authentication section
2. Go to **URL Configuration**
3. Add to **Redirect URLs:**
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000
   http://localhost:3000/dashboard
   ```
4. For production, add your production URL

### 3.3 JWT Settings (Optional Advanced)
1. Go to **JWT Settings** in Authentication
2. Under "Custom Claims", you can add:
   - `role` claim for RBAC
   - This is handled via database trigger (see advanced setup)

---

## Step 4: Configure Frontend

### 4.1 Copy Environment Template
```bash
cd frontend/app
cp ../../DB/.env.example .env.local
```

### 4.2 Fill in .env.local
Edit `frontend/app/.env.local`:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_API_URL=http://localhost:8080/api
```

Replace with your actual Supabase credentials from Step 1.2

### 4.3 Install Dependencies
```bash
cd frontend/app
npm install @supabase/supabase-js
```

---

## Step 5: Test Authentication Setup

### 5.1 Copy Supabase Client
The `DB/supabaseClient.js` file contains all authentication functions.

**Copy to React project:**
```bash
# Create lib directory if it doesn't exist
mkdir -p frontend/app/src/lib

# Copy the client file
cp DB/supabaseClient.js frontend/app/src/lib/
```

### 5.2 Verify Installation
```bash
cd frontend/app
npm list @supabase/supabase-js
```

Should show version 2.x or higher.

---

## Step 6: Update React Login Component

### 6.1 Enhance Login Page
Update `frontend/app/src/pages/login.jsx`:

```javascript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInUser, logAuditEvent } from '../lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter email and password');
        setLoading(false);
        return;
      }

      const { data, error } = await signInUser(email, password);
      
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        // Navigate based on role
        const userRole = data.user.user_metadata?.role || 'patient';
        navigate(`/dashboard?role=${userRole}`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    // ... existing JSX with updated handleLogin
  );
}
```

### 6.2 Enhance Create Account Page
Update `frontend/app/src/pages/createAccount.jsx`:

```javascript
import { signUpUser } from '../lib/supabaseClient';

// In handleSignUp function:
const { data, error } = await signUpUser(email, password, {
  full_name: name,
  phone_number: phone,
  role: 'patient',
});

if (error) {
  setError(error.message);
  return;
}

setSuccess('Account created! Check your email to confirm.');
// Redirect after delay
```

---

## Step 7: Create Protected Route Component

Create `frontend/app/src/components/ProtectedRoute.jsx`:

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentUser } from '../lib/supabaseClient';

export default function ProtectedRoute({ children, requiredRole }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div>Loading...</div>;
  
  if (!user) return <Navigate to="/" />;
  
  if (requiredRole && user.user_metadata?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return children;
}
```

---

## Step 8: Test the System

### 8.1 Start Development Server
```bash
cd frontend/app
npm start
```

Application runs at http://localhost:3000

### 8.2 Test Registration
1. Click "Create Account"
2. Fill in form with test data
3. Submit
4. Check Supabase Dashboard → Authentication → Users
5. New user should appear

### 8.3 Test Login
1. Go to login page
2. Use registered email and password
3. Should redirect to dashboard
4. Check audit logs: `SELECT * FROM audit_logs WHERE action='login' ORDER BY created_at DESC;`

### 8.4 Verify Database
In Supabase SQL Editor:
```sql
-- Check users table
SELECT id, email, role, full_name FROM users;

-- Check audit logs
SELECT user_id, action, resource_type, status, created_at FROM audit_logs;

-- Check patient profiles
SELECT p.* FROM patient_profiles p
JOIN users u ON p.user_id = u.id
WHERE u.email = 'test@example.com';
```

---

## Step 9: Enable Advanced Features (Optional)

### 9.1 Email Verification Trigger
Create a function to automatically sync Supabase Auth with users table:

```sql
-- Trigger for auth.users → public.users sync
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, is_active)
  VALUES (new.id, new.email, true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 9.2 Real-Time Updates
The `supabaseClient.js` includes real-time subscription function:

```javascript
// Subscribe to record changes
import { subscribeToRecordChanges } from './lib/supabaseClient';

useEffect(() => {
  const subscription = subscribeToRecordChanges(patientId, (payload) => {
    console.log('Record updated:', payload);
    // Update UI with new data
  });

  return () => subscription.unsubscribe();
}, [patientId]);
```

### 9.3 Multi-Factor Authentication (MFA)
In Supabase Authentication → MFA:
1. Toggle **Enable MFA**
2. Choose provider (TOTP recommended)
3. Update login component to handle MFA challenge

---

## Step 10: Production Deployment

### 10.1 Database Backup
In Supabase Dashboard:
1. Go to **Settings** → **Backups**
2. Enable **Point-in-time Recovery**
3. Set backup retention

### 10.2 Environment Variables
Create `.env.production` for production deployment:
```env
REACT_APP_SUPABASE_URL=https://your-prod-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=prod-anon-key-here
```

### 10.3 Enable HTTPS
Ensure all endpoints use HTTPS for data in transit encryption.

### 10.4 Rate Limiting
In Supabase Authentication:
1. Go to **Settings** → **Rate Limiting**
2. Set limits for:
   - Sign up: 5 per hour per IP
   - Sign in: 10 per hour per IP

---

## Troubleshooting Guide

### Problem: "Missing Supabase credentials"
**Solution:**
```bash
# Verify .env.local exists
ls frontend/app/.env.local

# Check variables are set
cat frontend/app/.env.local | grep REACT_APP_SUPABASE
```

### Problem: Authentication fails with 401 error
**Solution:**
1. Verify user exists in Supabase **Authentication** → **Users**
2. Confirm email matches exactly (case-sensitive)
3. Check RLS policies are applied: `SELECT * FROM pg_policies;`

### Problem: RLS blocks all access
**Solution:**
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables WHERE schemaname = 'public';

-- Temporarily disable RLS for testing (NOT for production)
ALTER TABLE medical_records DISABLE ROW LEVEL SECURITY;
```

### Problem: CORS errors when accessing API
**Solution:**
1. Go to Supabase **Settings** → **Auth** → **URL Configuration**
2. Add your frontend URL to **Redirect URLs**
3. Restart development server

---

## Testing Checklist

- [ ] Supabase project created
- [ ] Schema loaded successfully
- [ ] RLS policies applied
- [ ] Sample data inserted
- [ ] .env.local configured
- [ ] Dependencies installed
- [ ] Login page loads
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Audit logs record access
- [ ] User roles enforced
- [ ] Patient data isolated by consent

---

## Next Steps

1. ✅ Set up backend API (Java) to handle business logic
2. ✅ Create dashboard components for each role
3. ✅ Implement appointment scheduling
4. ✅ Add prescription management
5. ✅ Build laboratory results interface
6. ✅ Deploy to production

---

## Support Resources

- Supabase Docs: https://supabase.com/docs
- PostgreSQL RLS: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- HIPAA Compliance: https://www.hhs.gov/hipaa/
- GDPR Requirements: https://gdpr-info.eu/

---

**Last Updated:** January 29, 2026
**Status:** Ready for Development
