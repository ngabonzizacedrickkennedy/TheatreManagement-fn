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
   * Login user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Promise<boolean>} Login success status
   */
  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await authApi.login({ username, password });
      const { token, username: user, roles } = response;
      
      // Store auth data
      localStorage.setItem('auth_token', token);
      
      const userData = { username: user, roles };
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      
      return true;
    } catch (err) {
      setError(err.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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
      setError(err.message || 'Registration failed');
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

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  const isAuthenticated = !!user;

  /**
   * Check if user is an admin
   * @returns {boolean} Admin status
   */
  const isAdmin = hasRole(UserRoles.ADMIN);

  /**
   * Check if user is a manager
   * @returns {boolean} Manager status
   */
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
    hasRole,
    login,
    register,
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