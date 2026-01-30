/* ============================================================================
-- SUPABASE JAVASCRIPT CLIENT UTILITIES
-- Place this file in: frontend/app/src/lib/supabaseClient.js
-- ============================================================================*/

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// AUTH FUNCTIONS
// ============================================================================

/**
 * Sign up a new user with email and password
 */
export async function signUpUser(email, password, userData) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userData.full_name,
          phone_number: userData.phone_number,
          role: userData.role || 'patient',
        },
      },
    });

    if (error) throw error;

    // Create user profile in users table
    if (data.user) {
      await createUserProfile(data.user.id, email, userData);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sign in user with email and password
 */
export async function signInUser(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Log login event
    if (data.user) {
      await logAuditEvent('login', 'user_account', data.user.id, 'success');
      await updateUserLastLogin(data.user.id);
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  try {
    const user = await getCurrentUser();
    
    // Log logout event
    if (user) {
      await logAuditEvent('logout', 'user_account', user.id, 'success');
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { error };
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  try {
    const { data } = await supabase.auth.getUser();
    return data.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get user session
 */
export async function getUserSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Reset password with email
 */
export async function resetPassword(email) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// ============================================================================
// USER PROFILE FUNCTIONS
// ============================================================================

/**
 * Create user profile in database
 */
async function createUserProfile(userId, email, userData) {
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        role: userData.role || 'patient',
        full_name: userData.full_name,
        phone_number: userData.phone_number,
        is_active: true,
      });

    if (error) throw error;

    // If patient, create patient profile
    if (userData.role === 'patient') {
      await createPatientProfile(userId, userData);
    }

    // If provider, create provider profile
    if (['doctor', 'nurse', 'lab_technician'].includes(userData.role)) {
      await createProviderProfile(userId, userData);
    }

    return { error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { error };
  }
}

/**
 * Create patient profile
 */
async function createPatientProfile(userId, data) {
  try {
    const { error } = await supabase
      .from('patient_profiles')
      .insert({
        user_id: userId,
        date_of_birth: data.date_of_birth || null,
        gender: data.gender || null,
        blood_type: data.blood_type || null,
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error creating patient profile:', error);
    return { error };
  }
}

/**
 * Create provider profile (for doctors, nurses, etc.)
 */
async function createProviderProfile(userId, data) {
  try {
    const { error } = await supabase
      .from('provider_profiles')
      .insert({
        user_id: userId,
        license_number: data.license_number || 'PENDING',
        specialization: data.specialization || null,
        qualification: data.qualification || null,
        years_of_experience: data.years_of_experience || 0,
        department: data.department || null,
        is_verified: false,
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error creating provider profile:', error);
    return { error };
  }
}

/**
 * Get user profile with role
 */
export async function getUserProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { data: null, error };
  }
}

/**
 * Get patient profile
 */
export async function getPatientProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return { data: null, error };
  }
}

/**
 * Update user last login timestamp
 */
async function updateUserLastLogin(userId) {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date() })
      .eq('id', userId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error updating last login:', error);
    return { error };
  }
}

// ============================================================================
// AUDIT LOG FUNCTIONS
// ============================================================================

/**
 * Log audit event for compliance and traceability
 */
export async function logAuditEvent(action, resourceType, resourceId, status, errorMessage = null) {
  try {
    const user = await getCurrentUser();
    
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: user?.id || null,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        status,
        error_message: errorMessage,
        ip_address: null, // Can be captured server-side
        user_agent: navigator.userAgent,
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error logging audit event:', error);
    return { error };
  }
}

// ============================================================================
// PATIENT CONSENT FUNCTIONS
// ============================================================================

/**
 * Grant consent for data sharing
 */
export async function grantConsent(patientId, consentType, grantedTo, scope, expiresAt = null) {
  try {
    const { data, error } = await supabase
      .from('patient_consents')
      .insert({
        patient_id: patientId,
        consent_type: consentType,
        granted_to: grantedTo,
        scope,
        expires_at: expiresAt,
        is_active: true,
      });

    if (error) throw error;

    // Log consent event
    await logAuditEvent('create', 'patient_consent', data[0].id, 'success');

    return { data, error: null };
  } catch (error) {
    console.error('Error granting consent:', error);
    return { data: null, error };
  }
}

/**
 * Revoke consent
 */
export async function revokeConsent(consentId) {
  try {
    const { data, error } = await supabase
      .from('patient_consents')
      .update({ is_active: false, revoked_at: new Date() })
      .eq('id', consentId);

    if (error) throw error;

    // Log revocation event
    await logAuditEvent('update', 'patient_consent', consentId, 'success');

    return { data, error: null };
  } catch (error) {
    console.error('Error revoking consent:', error);
    return { data: null, error };
  }
}

/**
 * Get active consents for patient
 */
export async function getActiveConsents(patientId) {
  try {
    const { data, error } = await supabase
      .from('patient_consents')
      .select('*')
      .eq('patient_id', patientId)
      .eq('is_active', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching consents:', error);
    return { data: null, error };
  }
}

// ============================================================================
// MEDICAL RECORDS FUNCTIONS
// ============================================================================

/**
 * Get patient medical records
 */
export async function getPatientRecords(patientId) {
  try {
    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Log access event
    await logAuditEvent('read', 'medical_records', patientId, 'success');

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return { data: null, error };
  }
}

/**
 * Create medical record
 */
export async function createMedicalRecord(patientId, recordType, title, description) {
  try {
    const user = await getCurrentUser();

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        patient_id: patientId,
        record_type: recordType,
        title,
        description,
        created_by: user.id,
      });

    if (error) throw error;

    // Log creation event
    await logAuditEvent('create', 'medical_record', data[0].id, 'success');

    return { data, error: null };
  } catch (error) {
    console.error('Error creating medical record:', error);
    return { data: null, error };
  }
}

// ============================================================================
// SUBSCRIPTION (REAL-TIME UPDATES)
// ============================================================================

/**
 * Subscribe to real-time updates on medical records
 */
export function subscribeToRecordChanges(patientId, callback) {
  return supabase
    .from(`medical_records:patient_id=eq.${patientId}`)
    .on('*', (payload) => {
      callback(payload);
    })
    .subscribe();
}

export default supabase;
