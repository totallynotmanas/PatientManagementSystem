import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {object} userMetadata - Additional user metadata (name, phone, etc.)
 * @returns {Promise} - Supabase auth response
 */
export const signUp = async (email, password, userMetadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userMetadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign in an existing user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Supabase auth response
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Sign out the current user
 * @returns {Promise} - Supabase response
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Get the current session
 * @returns {Promise} - Current session or null
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

/**
 * Get the current authenticated user
 * @returns {Promise} - Current user or null
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return data.user;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function when auth state changes
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChange = (callback) => {
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      callback(session);
    }
  );

  return authListener?.subscription?.unsubscribe || (() => {});
};

/**
 * Update user metadata (profile info)
 * @param {object} metadata - User metadata to update
 * @returns {Promise} - Updated user
 */
export const updateUserMetadata = async (metadata) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default supabase;
