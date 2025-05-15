import axios from 'axios';

/**
 * Axios instance configured for the Theatre Management System API
 */
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

/**
 * Request interceptor to add authentication token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle common errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Extract data from the response for easier consumption
    if (response.data?.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  (error) => {
    // Handle specific error codes
    const { response } = error;
    
    if (response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // We don't redirect here to avoid coupling with the router
      // Instead, we'll let the auth context handle this
      // window.location.href = '/login';
      
      // Custom error object
      return Promise.reject({
        isAuthError: true,
        status: 401,
        message: response.data?.message || 'Unauthorized access',
        ...error
      });
    }
    
    if (response?.status === 403) {
      // Handle forbidden access
      return Promise.reject({
        isForbiddenError: true,
        status: 403,
        message: response.data?.message || 'Forbidden access',
        ...error
      });
    }
    
    if (response?.status === 404) {
      // Handle not found
      return Promise.reject({
        isNotFoundError: true,
        status: 404,
        message: response.data?.message || 'Resource not found',
        ...error
      });
    }
    
    if (response?.status >= 500) {
      // Handle server errors
      return Promise.reject({
        isServerError: true,
        status: response.status,
        message: response.data?.message || 'Server error occurred',
        ...error
      });
    }
    
    // Generic error handling
    return Promise.reject({
      status: response?.status,
      message: response?.data?.message || error.message || 'An unexpected error occurred',
      ...error
    });
  }
);

export default apiClient;