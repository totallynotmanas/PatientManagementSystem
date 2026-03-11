// API Service - Centralized API calls for the Patient Management System
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
   // Retrieve access token from secure_health_user in localStorage
   const userDataStr = localStorage.getItem('secure_health_user');
   let accessToken = null;
   if (userDataStr) {
      try {
         const userSession = JSON.parse(userDataStr);
         accessToken = userSession.accessToken;
      } catch (e) {
         console.error('Failed to parse secure_health_user from localStorage', e);
      }
   }

   const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
   };

   // Inject Authorization header if we have an accessToken
   if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
   }

   const config = {
      headers,
      credentials: 'include', // Include cookies for authentication
      ...options,
   };

   try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
         // Handle 401 Unauthorized - token may be expired
         if (response.status === 401) {
            console.warn('Session expired. Redirecting to login...');
            localStorage.removeItem('secure_health_user');
            window.location.href = '/login';
         }

         const error = await response.json().catch(() => ({ message: 'Request failed' }));
         throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
   } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
   }
};

// ============================================
// AUTHENTICATION APIs
// ============================================

export const authAPI = {
   // Register a new user
   register: async (email, password, role = 'PATIENT') => {
      return apiCall('/auth/register', {
         method: 'POST',
         body: JSON.stringify({ email, password, role }),
      });
   },

   // Login user
   login: async (email, password) => {
      return apiCall('/auth/login', {
         method: 'POST',
         body: JSON.stringify({ email, password }),
      });
   },

   // Logout user
   logout: async () => {
      return apiCall('/auth/logout', {
         method: 'POST',
      });
   },

   // Get current user
   getCurrentUser: async () => {
      return apiCall('/auth/me', {
         method: 'GET',
      });
   },
};

// ============================================
// PATIENT APIs
// ============================================

export const patientAPI = {
   // Get current patient profile
   getMe: async () => {
      return apiCall('/patients/me', {
         method: 'GET',
      });
   },

   // Get all patients
   getAll: async () => {
      return apiCall('/patients', {
         method: 'GET',
      });
   },

   // Get patient by ID
   getById: async (id) => {
      return apiCall(`/patients/${id}`, {
         method: 'GET',
      });
   },

   // Create new patient
   create: async (patientData) => {
      return apiCall('/patients', {
         method: 'POST',
         body: JSON.stringify(patientData),
      });
   },

   // Update patient
   update: async (id, patientData) => {
      return apiCall(`/patients/${id}`, {
         method: 'PUT',
         body: JSON.stringify(patientData),
      });
   },

   // Delete patient
   delete: async (id) => {
      return apiCall(`/patients/${id}`, {
         method: 'DELETE',
      });
   },
};

// ============================================
// APPOINTMENT APIs
// ============================================

export const appointmentAPI = {
   // Get all appointments
   getAll: async () => {
      return apiCall('/appointments', {
         method: 'GET',
      });
   },

   // Get appointment by ID
   getById: async (id) => {
      return apiCall(`/appointments/${id}`, {
         method: 'GET',
      });
   },

   // Get appointments by patient ID
   getByPatient: async (patientId) => {
      return apiCall(`/appointments/patient/${patientId}`, {
         method: 'GET',
      });
   },

   // Get appointments by doctor ID
   getByDoctor: async (doctorId) => {
      return apiCall(`/appointments/doctor/${doctorId}`, {
         method: 'GET',
      });
   },

   // Create new appointment
   create: async (appointmentData) => {
      return apiCall('/appointments', {
         method: 'POST',
         body: JSON.stringify(appointmentData),
      });
   },

   // Update appointment
   update: async (id, appointmentData) => {
      return apiCall(`/appointments/${id}`, {
         method: 'PUT',
         body: JSON.stringify(appointmentData),
      });
   },

   // Cancel appointment
   cancel: async (id, data = {}) => {
      return apiCall(`/appointments/${id}/cancel`, {
         method: 'PUT',
         body: JSON.stringify({ status: 'CANCELLED', ...data }),
      });
   },

   // Get all pending-approval appointments (ADMIN only)
   getPending: async () => {
      return apiCall('/appointments/pending', {
         method: 'GET',
      });
   },

   // Approve a pending appointment (ADMIN only)
   approve: async (id) => {
      return apiCall(`/appointments/${id}/approve`, {
         method: 'PUT',
      });
   },

   // Reject a pending appointment with optional reason (ADMIN only)
   reject: async (id, reason = '') => {
      return apiCall(`/appointments/${id}/reject`, {
         method: 'PUT',
         body: JSON.stringify(reason),
      });
   },

   // Delete appointment
   delete: async (id) => {
      return apiCall(`/appointments/${id}`, {
         method: 'DELETE',
      });
   },
};

// ============================================
// MEDICAL RECORD APIs
// ============================================

export const medicalRecordAPI = {
   // Get all medical records for a patient
   getByPatient: async (patientId) => {
      return apiCall(`/medical-records/patient/${patientId}`, {
         method: 'GET',
      });
   },

   // Get medical record by ID
   getById: async (id) => {
      return apiCall(`/medical-records/${id}`, {
         method: 'GET',
      });
   },

   // Create new medical record
   create: async (recordData) => {
      return apiCall('/medical-records', {
         method: 'POST',
         body: JSON.stringify(recordData),
      });
   },

   // Update medical record
   update: async (id, recordData) => {
      return apiCall(`/medical-records/${id}`, {
         method: 'PUT',
         body: JSON.stringify(recordData),
      });
   },

   // Delete medical record
   delete: async (id) => {
      return apiCall(`/medical-records/${id}`, {
         method: 'DELETE',
      });
   },
};

// ============================================
// PRESCRIPTION APIs
// ============================================

export const prescriptionAPI = {
   // Get all prescriptions for a patient
   getByPatient: async (patientId) => {
      return apiCall(`/prescriptions/patient/${patientId}`, {
         method: 'GET',
      });
   },

   // Get prescription by ID
   getById: async (id) => {
      return apiCall(`/prescriptions/${id}`, {
         method: 'GET',
      });
   },

   // Create new prescription
   create: async (prescriptionData) => {
      return apiCall('/prescriptions', {
         method: 'POST',
         body: JSON.stringify(prescriptionData),
      });
   },

   // Update prescription
   update: async (id, prescriptionData) => {
      return apiCall(`/prescriptions/${id}`, {
         method: 'PUT',
         body: JSON.stringify(prescriptionData),
      });
   },

   // Delete prescription
   delete: async (id) => {
      return apiCall(`/prescriptions/${id}`, {
         method: 'DELETE',
      });
   },
};

// ============================================
// LAB RESULT APIs
// ============================================

export const labResultAPI = {
   // Get all lab results (doctor/admin)
   getAll: async () => {
      return apiCall('/lab-results', {
         method: 'GET',
      });
   },

   // Get all lab results for a patient
   getByPatient: async (patientId) => {
      return apiCall(`/lab-results/patient/${patientId}`, {
         method: 'GET',
      });
   },

   // Get lab result by ID
   getById: async (id) => {
      return apiCall(`/lab-results/${id}`, {
         method: 'GET',
      });
   },

   // Create new lab result
   create: async (labResultData) => {
      return apiCall('/lab-results', {
         method: 'POST',
         body: JSON.stringify(labResultData),
      });
   },

   // Update lab result
   update: async (id, labResultData) => {
      return apiCall(`/lab-results/${id}`, {
         method: 'PUT',
         body: JSON.stringify(labResultData),
      });
   },

   // Delete lab result
   delete: async (id) => {
      return apiCall(`/lab-results/${id}`, {
         method: 'DELETE',
      });
   },
};

// ============================================
// DOCTOR APIs
// ============================================

export const doctorAPI = {
   // Get all doctors
   getAll: async () => {
      return apiCall('/doctors', {
         method: 'GET',
      });
   },

   // Get doctor by ID
   getById: async (id) => {
      return apiCall(`/doctors/${id}`, {
         method: 'GET',
      });
   },

   // Get doctor by specialty
   getBySpecialty: async (specialty) => {
      return apiCall(`/doctors/specialty/${specialty}`, {
         method: 'GET',
      });
   },

   // Get patients for a doctor
   getPatients: async (doctorId) => {
      return apiCall(`/doctors/${doctorId}/patients`, {
         method: 'GET',
      });
   },

   // Update doctor profile
   update: async (id, doctorData) => {
      return apiCall(`/doctors/${id}`, {
         method: 'PUT',
         body: JSON.stringify(doctorData),
      });
   },
};

// ============================================
// VITAL SIGNS APIs
// ============================================

export const vitalSignsAPI = {
   // Get all vital signs for a patient
   getByPatient: async (patientId) => {
      return apiCall(`/vital-signs/patient/${patientId}`, {
         method: 'GET',
      });
   },

   // Get latest vital signs for a patient
   getLatest: async (patientId) => {
      return apiCall(`/vital-signs/patient/${patientId}/latest`, {
         method: 'GET',
      });
   },

   // Create new vital signs record
   create: async (vitalSignsData) => {
      return apiCall('/vital-signs', {
         method: 'POST',
         body: JSON.stringify(vitalSignsData),
      });
   },

   // Update vital signs
   update: async (id, vitalSignsData) => {
      return apiCall(`/vital-signs/${id}`, {
         method: 'PUT',
         body: JSON.stringify(vitalSignsData),
      });
   },
};

// ============================================
// NURSE APIs
// ============================================

export const nurseAPI = {
   getDashboardOverview: async () => {
      return apiCall('/nurse/dashboard', { method: 'GET' });
   },
   getAssignedPatients: async () => {
      return apiCall('/nurse/assigned-patients', { method: 'GET' });
   },
   getTasks: async () => {
      return apiCall('/nurse/tasks', { method: 'GET' });
   },
   toggleTaskStatus: async (taskId) => {
      return apiCall(`/nurse/tasks/${taskId}/toggle`, { method: 'PUT' });
   },
   createTask: async (taskData) => {
      return apiCall('/nurse/tasks', { method: 'POST', body: JSON.stringify(taskData) });
   },
   getHandoverNotes: async () => {
      return apiCall('/nurse/handover', { method: 'GET' });
   },
   saveHandoverNote: async (payload) => {
      return apiCall('/nurse/handover', { method: 'POST', body: JSON.stringify(payload) });
   },
   recordVitals: async (vitalSignsData) => {
      return apiCall('/vital-signs', {
         method: 'POST',
         body: JSON.stringify(vitalSignsData)
      });
   },
   recordMedicationAdministration: async (medicationData) => {
      // Endpoint may not be strictly implemented on backend, but fulfilling the fix requirement
      return apiCall('/nurse/medications/record', {
         method: 'POST',
         body: JSON.stringify(medicationData)
      });
   }
};

// ============================================
// LAB TECHNICIAN APIs
// ============================================

export const labTechnicianAPI = {
   getDashboard: async () => {
      return apiCall('/lab-technician/dashboard', { method: 'GET' });
   },
   getOrders: async (status) => {
      const url = status ? `/lab-technician/orders?status=${status}` : '/lab-technician/orders';
      return apiCall(url, { method: 'GET' });
   },
   updateOrderStatus: async (testId, status) => {
      return apiCall(`/lab-technician/orders/${testId}/status`, {
         method: 'PUT',
         body: JSON.stringify({ status })
      });
   },
   uploadResults: async (testId, resultValue, remarks, fileUrl) => {
      return apiCall(`/lab-technician/orders/${testId}/upload`, {
         method: 'PUT',
         body: JSON.stringify({ resultValue, remarks, fileUrl })
      });
   }
};

// ============================================
// ADMIN APIs
// ============================================

export const adminAPI = {
   // Get dashboard metrics
   getMetrics: async () => {
      return apiCall('/admin/metrics', {
         method: 'GET',
      });
   },

   // Get all audit logs (Admin only)
   getAuditLogs: async () => {
      return apiCall('/admin/audit-logs', {
         method: 'GET',
      });
   },

   // Get audit logs for a specific user
   getAuditLogsByEmail: async (email) => {
      return apiCall(`/admin/audit-logs/${encodeURIComponent(email)}`, {
         method: 'GET',
      });
   },

   // Get all staff members (non-patient users)
   getAllStaff: async () => {
      return apiCall('/admin/staff', {
         method: 'GET',
      });
   },

   // Get all patients (patient directory)
   getAllUsers: async () => {
      return apiCall('/admin/patients', {
         method: 'GET',
      });
   },

   // Get all appointments (for admin dashboard)
   getAllAppointments: async () => {
      return apiCall('/appointments', {
         method: 'GET',
      });
   },

   // Delete a staff member
   deleteStaff: async (userId) => {
      return apiCall(`/admin/staff/${userId}`, {
         method: 'DELETE',
      });
   },

   // Update staff role
   updateStaffRole: async (userId, newRole) => {
      return apiCall(`/admin/staff/${userId}/role`, {
         method: 'PUT',
         body: JSON.stringify({ newRole }),
      });
   },

   // Create a new staff account (ADMIN only)
   createStaff: async (staffData) => {
      return apiCall('/admin/staff', {
         method: 'POST',
         body: JSON.stringify(staffData),
      });
   },
};

// ============================================
// CONSENT APIs
// ============================================

export const consentAPI = {
   // Get all consents for the logged-in patient
   getMyConsents: async () => {
      return apiCall('/consent', {
         method: 'GET',
      });
   },

   // Grant a new consent
   grantConsent: async (payload) => {
      return apiCall('/consent', {
         method: 'POST',
         body: JSON.stringify(payload),
      });
   },

   // Revoke an existing consent by ID
   revokeConsent: async (id) => {
      return apiCall(`/consent/${id}/revoke`, {
         method: 'PUT',
      });
   },
};

const api = {
   auth: authAPI,
   patients: patientAPI,
   appointments: appointmentAPI,
   medicalRecords: medicalRecordAPI,
   prescriptions: prescriptionAPI,
   labResults: labResultAPI,
   doctors: doctorAPI,
   vitalSigns: vitalSignsAPI,
   nurse: nurseAPI,
   labTechnician: labTechnicianAPI,
   admin: adminAPI,
   consent: consentAPI,
};

export default api;
