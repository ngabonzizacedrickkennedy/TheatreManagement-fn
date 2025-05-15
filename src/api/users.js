import apiClient from './client';

/**
 * API service for user-related operations
 * Handles user management and profile operations
 */
const userApi = {
  /**
   * Get current user's profile
   * @returns {Promise<Object>} User profile
   */
  getCurrentUser: async () => {
    const response = await apiClient.get('/user/profile');
    return response.data;
  },

  /**
   * Update current user's profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise<Object>} Updated profile
   */
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/user/profile', profileData);
    return response.data;
  },

  /**
   * Change current user's password
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
   * Get all users (Admin only)
   * @returns {Promise<Array>} List of users
   */
  getAllUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  /**
   * Get a user by ID (Admin only)
   * @param {number|string} id - User ID
   * @returns {Promise<Object>} User details
   */
  getUserById: async (id) => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Create a new user (Admin only)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  createUser: async (userData) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },

  /**
   * Update a user (Admin only)
   * @param {number|string} id - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`/admin/users/${id}`, userData);
    return response.data;
  },

  /**
   * Delete a user (Admin only)
   * @param {number|string} id - User ID
   * @returns {Promise<Object>} Response
   */
  deleteUser: async (id) => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Check if a username exists
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} Whether the username exists
   */
  existsByUsername: async (username) => {
    const response = await apiClient.get('/auth/check-username', { params: { username } });
    return response.data;
  },

  /**
   * Check if an email exists
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} Whether the email exists
   */
  existsByEmail: async (email) => {
    const response = await apiClient.get('/auth/check-email', { params: { email } });
    return response.data;
  }
};

export default userApi;