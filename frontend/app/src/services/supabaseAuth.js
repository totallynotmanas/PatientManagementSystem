// Authentication service for backend API
const API_BASE_URL = 'http://localhost:8081/api/auth';

// Auth state change listeners
let authStateListeners = [];

export const signup = async (email, password, role = 'PATIENT') => {
   try {
      const response = await fetch(`${API_BASE_URL}/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
         const error = await response.json();
         throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      notifyAuthStateChange(data);
      return data;
   } catch (error) {
      throw error;
   }
};

export const signUp = async (email, password, userData) => {
   try {
      const role = userData?.role || 'PATIENT';
      const result = await signup(email, password, role);
      return { success: true, user: result.user, session: result };
   } catch (error) {
      return { success: false, error: error.message };
   }
};

export const login = async (email, password) => {
   try {
      const response = await fetch(`${API_BASE_URL}/login`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         credentials: 'include',
         body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
         const error = await response.json();
         throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      notifyAuthStateChange(data);
      return data;
   } catch (error) {
      throw error;
   }
};

export const signIn = async (email, password) => {
   try {
      const result = await login(email, password);
      return { success: true, user: result.user, session: result };
   } catch (error) {
      return { success: false, error: error.message };
   }
};

export const logout = async () => {
   try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
         method: 'POST',
         credentials: 'include',
      });

      if (!response.ok) {
         throw new Error('Logout failed');
      }

      const data = await response.json();
      notifyAuthStateChange(null);
      return data;
   } catch (error) {
      throw error;
   }
};

export const signOut = async () => {
   try {
      await logout();
      return { success: true };
   } catch (error) {
      return { success: false, error: error.message };
   }
};

export const getCurrentUser = async () => {
   try {
      const response = await fetch(`${API_BASE_URL}/me`, {
         method: 'GET',
         credentials: 'include',
      });

      if (!response.ok) {
         return null;
      }

      return await response.json();
   } catch (error) {
      return null;
   }
};

export const getCurrentSession = async () => {
   try {
      const user = await getCurrentUser();
      return user ? { user } : null;
   } catch (error) {
      return null;
   }
};

// Auth state change listener
export const onAuthStateChange = (callback) => {
   authStateListeners.push(callback);

   // Return unsubscribe function
   return () => {
      authStateListeners = authStateListeners.filter(listener => listener !== callback);
   };
};

// Notify all listeners of auth state change
const notifyAuthStateChange = (session) => {
   authStateListeners.forEach(listener => listener(session));
};
