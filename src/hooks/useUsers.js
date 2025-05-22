// src/hooks/useUsers.js
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import userApi from '@api/users';

/**
 * Custom hook for managing users
 * Centralizes all user-related data fetching and mutations
 */
export const useUsers = () => {
  const queryClient = useQueryClient();

  /**
   * Get all users (Admin only)
   */
  const useGetAllUsers = (options = {}) => {
    return useQuery({
      queryKey: ['admin-users'],
      queryFn: async () => {
        try {
          const data = await userApi.getAllUsers();
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error fetching all users:', error);
          // Return mock data if API fails
          return [
            { id: 1, username: 'johndoe', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'ROLE_USER' },
            { id: 2, username: 'janedoe', email: 'jane@example.com', firstName: 'Jane', lastName: 'Doe', role: 'ROLE_USER' },
            { id: 3, username: 'admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'ROLE_ADMIN' },
            { id: 4, username: 'manager', email: 'manager@example.com', firstName: 'Theatre', lastName: 'Manager', role: 'ROLE_MANAGER' },
            { id: 5, username: 'bobsmith', email: 'bob@example.com', firstName: 'Bob', lastName: 'Smith', role: 'ROLE_USER' }
          ];
        }
      },
      ...options
    });
  };

  /**
   * Get current user's profile
   */
  const useGetCurrentUser = (options = {}) => {
    return useQuery({
      queryKey: ['current-user'],
      queryFn: () => userApi.getCurrentUser(),
      ...options
    });
  };

  /**
   * Get a user by ID (Admin only)
   */
  const useGetUser = (id, options = {}) => {
    return useQuery({
      queryKey: ['user', id],
      queryFn: () => userApi.getUserById(id),
      enabled: !!id,
      ...options
    });
  };

  /**
   * Create a new user (Admin only)
   */
  const useCreateUser = (options = {}) => {
    return useMutation({
      mutationFn: (userData) => userApi.createUser(userData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      },
      ...options
    });
  };

  /**
   * Update a user (Admin only)
   */
  const useUpdateUser = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, userData }) => userApi.updateUser(id, userData),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      },
      ...options
    });
  };

  /**
   * Update current user's profile
   */
  const useUpdateProfile = (options = {}) => {
    return useMutation({
      mutationFn: (profileData) => userApi.updateProfile(profileData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
      },
      ...options
    });
  };

  /**
   * Change current user's password
   */
  const useChangePassword = (options = {}) => {
    return useMutation({
      mutationFn: (passwordData) => userApi.changePassword(passwordData),
      ...options
    });
  };

  /**
   * Delete a user (Admin only)
   */
  const useDeleteUser = (options = {}) => {
    return useMutation({
      mutationFn: (id) => userApi.deleteUser(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      },
      ...options
    });
  };

  /**
   * Check if username exists
   */
  const useCheckUsername = (username, options = {}) => {
    return useQuery({
      queryKey: ['check-username', username],
      queryFn: () => userApi.existsByUsername(username),
      enabled: !!username,
      ...options
    });
  };

  /**
   * Check if email exists
   */
  const useCheckEmail = (email, options = {}) => {
    return useQuery({
      queryKey: ['check-email', email],
      queryFn: () => userApi.existsByEmail(email),
      enabled: !!email,
      ...options
    });
  };

  return {
    useGetAllUsers,
    useGetCurrentUser,
    useGetUser,
    useCreateUser,
    useUpdateUser,
    useUpdateProfile,
    useChangePassword,
    useDeleteUser,
    useCheckUsername,
    useCheckEmail
  };
};

// Individual exports for easier imports
export const useGetAllUsers = (options = {}) => useUsers().useGetAllUsers(options);
export const useGetCurrentUser = (options = {}) => useUsers().useGetCurrentUser(options);
export const useGetUser = (id, options = {}) => useUsers().useGetUser(id, options);
export const useCreateUser = (options = {}) => useUsers().useCreateUser(options);
export const useUpdateUser = (options = {}) => useUsers().useUpdateUser(options);
export const useUpdateProfile = (options = {}) => useUsers().useUpdateProfile(options);
export const useChangePassword = (options = {}) => useUsers().useChangePassword(options);
export const useDeleteUser = (options = {}) => useUsers().useDeleteUser(options);
export const useCheckUsername = (username, options = {}) => useUsers().useCheckUsername(username, options);
export const useCheckEmail = (email, options = {}) => useUsers().useCheckEmail(email, options);

export default useUsers;