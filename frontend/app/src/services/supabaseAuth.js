// Authentication service for backend API
const API_BASE_URL = 'http://localhost:8081/api/auth';

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

      return await response.json();
   } catch (error) {
      throw error;
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

      return await response.json();
   } catch (error) {
      throw error;
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

      return await response.json();
   } catch (error) {
      throw error;
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
