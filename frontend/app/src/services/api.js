// API Service - Centralized API calls for the Patient Management System
const API_BASE_URL = 'http://localhost:8081/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
   const config = {
      headers: {
         'Content-Type': 'application/json',
         ...options.headers,
      },
      credentials: 'include', // Include cookies for authentication
      ...options,
   };

   try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      if (!response.ok) {
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
   cancel: async (id) => {
      return apiCall(`/appointments/${id}/cancel`, {
         method: 'PUT',
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

export default {
   auth: authAPI,
   patients: patientAPI,
   appointments: appointmentAPI,
   medicalRecords: medicalRecordAPI,
   prescriptions: prescriptionAPI,
   labResults: labResultAPI,
   doctors: doctorAPI,
   vitalSigns: vitalSignsAPI,
};
