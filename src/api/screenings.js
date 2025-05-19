import apiClient from './client';

/**
 * Screening API service
 * Handles all screening-related operations
 */
const screeningApi = {
  /**
   * Get all screenings with optional filtering
   * @param {Object} params - Query parameters
   * @param {number} [params.movieId] - Filter by movie ID
   * @param {number} [params.theatreId] - Filter by theatre ID
   * @param {string} [params.date] - Filter by date (YYYY-MM-DD)
   * @returns {Promise<Array>} List of screenings
   */
  getScreenings: async (params = {}) => {
    const response = await apiClient.get('/admin/screenings', { params });
    return response.data;
  },

  /**
   * Get a screening by ID
   * @param {number|string} id - Screening ID
   * @returns {Promise<Object>} Screening details
   */
  getScreeningById: async (id) => {
    const response = await apiClient.get(`/admin/screenings/${id}`);
    return response.data;
  },

  /**
   * Get screenings for a movie
   * @param {number|string} movieId - Movie ID
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Movie screenings grouped by date
   */
  getMovieScreenings: async (movieId, days = 7) => {
    const response = await apiClient.get(`/movies/${movieId}/screenings`, {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get screenings for a theatre
   * @param {number|string} theatreId - Theatre ID
   * @returns {Promise<Array>} List of screenings
   */
  getTheatreScreenings: async (theatreId) => {
    const response = await apiClient.get(`/theatres/${theatreId}/screenings`);
    return response.data;
  },

  /**
   * Get screenings by date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array>} List of screenings
   */
  getScreeningsByDateRange: async (startDate, endDate) => {
    const formattedStartDate = formatDateParam(startDate);
    const formattedEndDate = formatDateParam(endDate);
    
    const response = await apiClient.get('/admin/screenings', { 
      params: { 
        startDate: formattedStartDate,
        endDate: formattedEndDate
      } 
    });
    return response.data;
  },

  /**
   * Get upcoming screenings
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Upcoming screenings grouped by date
   */
  getUpcomingScreenings: async (days = 7) => {
    const response = await apiClient.get('/screenings/upcoming', {
      params: { days }
    });
    return response.data;
  },

  /**
   * Get screenings for movie and theatre
   * @param {number|string} movieId - Movie ID
   * @param {number|string} theatreId - Theatre ID
   * @returns {Promise<Array>} List of screenings
   */
  getScreeningsByMovieAndTheatre: async (movieId, theatreId) => {
    const response = await apiClient.get('/admin/screenings', {
      params: { movieId, theatreId }
    });
    return response.data;
  },

  /**
   * Get available screenings
   * @param {number|string} movieId - Movie ID
   * @param {number|string} theatreId - Theatre ID
   * @param {Date|string} startDate - Start date
   * @returns {Promise<Array>} List of available screenings
   */
  getAvailableScreenings: async (movieId, theatreId, startDate) => {
    const formattedStartDate = formatDateParam(startDate);
    
    const response = await apiClient.get('/admin/screenings', {
      params: { 
        movieId, 
        theatreId, 
        startDate: formattedStartDate,
        available: true
      }
    });
    return response.data;
  },

  /**
   * Get available seats for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Object>} Seat layout and availability
   */
  getScreeningSeats: async (screeningId) => {
    const response = await apiClient.get(`/bookings/screening/${screeningId}/seats`);
    return response.data;
  },

  /**
   * Get all screening formats
   * @returns {Promise<Array>} List of screening formats
   */
  getScreeningFormats: async () => {
    const response = await apiClient.get('/admin/screenings/formats');
    return response.data;
  },

  /**
   * Create a new screening (Admin only)
   * @param {Object} screeningData - Screening data
   * @returns {Promise<Object>} Created screening
   */
  createScreening: async (screeningData) => {
    const response = await apiClient.post('/admin/screenings', screeningData);
    return response.data;
  },

  /**
   * Update a screening (Admin only)
   * @param {number|string} id - Screening ID
   * @param {Object} screeningData - Updated screening data
   * @returns {Promise<Object>} Updated screening
   */
  updateScreening: async (id, screeningData) => {
    const response = await apiClient.put(`/admin/screenings/${id}`, screeningData);
    return response.data;
  },

  /**
   * Delete a screening (Admin only)
   * @param {number|string} id - Screening ID
   * @returns {Promise<Object>} Response
   */
  deleteScreening: async (id) => {
    const response = await apiClient.delete(`/admin/screenings/${id}`);
    return response.data;
  }
};

/**
 * Helper function to format date parameters
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
function formatDateParam(date) {
  if (!date) return '';
  
  if (typeof date === 'string') {
    // Check if already in ISO format
    if (date.includes('T')) {
      return date;
    }
    return `${date}T00:00:00`;
  }
  
  return date.toISOString();
}

export default screeningApi;