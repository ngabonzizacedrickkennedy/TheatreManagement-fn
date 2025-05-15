import apiClient from './client';

/**
 * Authentication API service
 * Handles user registration, login, and related operations
 */
const authApi = {
  /**
   * Login a user with username and password
   * @param {Object} credentials - User credentials
   * @param {string} credentials.username - Username
   * @param {string} credentials.password - Password
   * @returns {Promise<Object>} Login response with token and user info
   */
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Register a new user
   * @param {Object} userData - User data for registration
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email
   * @param {string} userData.password - Password
   * @param {string} userData.firstName - First name
   * @param {string} userData.lastName - Last name
   * @param {string} [userData.phoneNumber] - Optional phone number
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  /**
   * Get the current user's profile
   * @returns {Promise<Object>} User profile data
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  /**
   * Update the user's profile
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user profile
   */
  updateProfile: async (userData) => {
    const response = await apiClient.put('/user/profile', userData);
    return response.data;
  },

  /**
   * Change the user's password
   * @param {Object} passwordData - Password change data
   * @param {string} passwordData.currentPassword - Current password
   * @param {string} passwordData.newPassword - New password
   * @returns {Promise<Object>} Response
   */
  changePassword: async (passwordData) => {
    const response = await apiClient.post('/user/change-password', passwordData);
    return response.data;
  },

  /**
   * Request password reset
   * @param {Object} data - Password reset request data
   * @param {string} data.email - User email
   * @returns {Promise<Object>} Response
   */
  requestPasswordReset: async (data) => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  /**
   * Reset password with token
   * @param {Object} data - Password reset data
   * @param {string} data.token - Reset token
   * @param {string} data.newPassword - New password
   * @returns {Promise<Object>} Response
   */
  resetPassword: async (data) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  }
};

export default authApi;