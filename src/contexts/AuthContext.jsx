// src/contexts/AuthContext.jsx - Debug version with better error handling
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '@api/auth';

// Create the authentication context
const AuthContext = createContext(null);

/**
 * User roles enum for easier role checking
 */
export const UserRoles = {
  USER: 'ROLE_USER',
  MANAGER: 'ROLE_MANAGER',
  ADMIN: 'ROLE_ADMIN'
};

/**
 * Auth Provider component to wrap the application
 * Provides authentication state and methods
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [twoFactorData, setTwoFactorData] = useState(null);

  /**
   * Initialize auth state from localStorage
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } catch (err) {
          // Invalid stored user data
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Initiate login with 2FA
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<Object>} Login response
   */
  const initiateLogin = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.initiateLogin({ username, password });
      console.log('Initiate login response:', response); // Debug log
      
      if (response.success && response.data.requires2FA) {
        setTwoFactorData({
          username,
          password,
          email: response.data.email
        });
        return { success: true, requires2FA: true };
      }
      
      // If 2FA is not required for some reason, handle normal login
      const { token, username: user, roles } = response.data;
      
      // Store auth data
      localStorage.setItem('auth_token', token);
      
      const userData = { username: user, roles };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      
      return { success: true, requires2FA: false };
    } catch (err) {
      console.error('Initiate login error:', err); // Debug log
      setError(err.message || 'Login failed');
      return { success: false, error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Complete login by verifying OTP
   * @param {string} otp - OTP code
   * @returns {Promise<boolean>} Verification success status
   */
  const verifyOtp = useCallback(async (otp) => {
    if (!twoFactorData) {
      setError('No 2FA session available. Please try logging in again.');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { username, password } = twoFactorData;
      const response = await authApi.verifyOtp({ username, password, otp });
      console.log('Verify OTP response:', response); // Debug log
      
      const { token, username: user, roles } = response.data;
      
      // Store auth data
      localStorage.setItem('auth_token', token);
      
      const userData = { username: user, roles };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      setTwoFactorData(null); // Clear 2FA data
      
      return true;
    } catch (err) {
      console.error('Verify OTP error:', err); // Debug log
      setError(err.message || 'OTP verification failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, [twoFactorData]);

  /**
   * Legacy login method (without 2FA)
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<boolean>} Login success status
   */
  const login = useCallback(async (username, password) => {
    // Use the new 2FA flow
    const result = await initiateLogin(username, password);
    return result.success && !result.requires2FA;
  }, [initiateLogin]);

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<boolean>} Registration success status
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      await authApi.register(userData);
      return true;
    } catch (err) {
      console.error('Registration error:', err); // Debug log
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Request password reset
   * @param {string} email - User's email
   * @returns {Promise<boolean>} Request success status
   */
  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.requestPasswordReset({ email });
      console.log('Password reset request response:', response); // Debug log
      return true;
    } catch (err) {
      console.error('Password reset request error:', err); // Debug log
      setError(err.message || 'Password reset request failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Validate password reset token
   * @param {string} token - Reset token
   * @returns {Promise<Object>} Validation result
   */
  const validateResetToken = useCallback(async (token) => {
    setLoading(true);
    setError(null);
    
    console.log('Validating reset token:', token); // Debug log
    
    try {
      const response = await authApi.validateResetToken({ token });
      console.log('Token validation response:', response); // Debug log
      
      if (response.success) {
        return { valid: true, data: response.data };
      } else {
        console.log('Token validation failed:', response.message); // Debug log
        return { valid: false, error: response.message || 'Invalid token' };
      }
    } catch (err) {
      console.error('Token validation error:', err); // Debug log
      setError(err.message || 'Invalid or expired token');
      return { valid: false, error: err.message || 'Invalid or expired token' };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<boolean>} Reset success status
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);
    
    console.log('Resetting password with token:', token); // Debug log
    
    try {
      const response = await authApi.resetPassword({ token, newPassword });
      console.log('Password reset response:', response); // Debug log
      return true;
    } catch (err) {
      console.error('Password reset error:', err); // Debug log
      setError(err.message || 'Password reset failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setTwoFactorData(null);
  }, []);

  /**
   * Check if user has a specific role
   * @param {string|string[]} roles - Role or array of roles to check
   * @returns {boolean} Whether user has any of the specified roles
   */
  const hasRole = useCallback((roles) => {
    if (!user) return false;
    
    const userRoles = user.roles || '';
    
    // Check for multiple roles
    if (Array.isArray(roles)) {
      return roles.some(role => userRoles.includes(role));
    }
    
    // Check for a single role
    return userRoles.includes(roles);
  }, [user]);

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Check if user is in 2FA step
  const requiresTwoFactor = !!twoFactorData;

  // Check if user is an admin
  const isAdmin = hasRole(UserRoles.ADMIN);

  // Check if user is a manager
  const isManager = hasRole([UserRoles.MANAGER, UserRoles.ADMIN]);

  // Context value
  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isManager,
    requiresTwoFactor,
    twoFactorData,
    hasRole,
    initiateLogin,
    verifyOtp,
    login,
    register,
    requestPasswordReset,
    validateResetToken,
    resetPassword,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};