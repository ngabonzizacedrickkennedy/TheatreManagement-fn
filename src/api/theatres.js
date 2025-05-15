import apiClient from './client';

/**
 * Theatre API service
 * Handles all theatre-related operations
 */
const theatreApi = {
  /**
   * Get all theatres
   * @param {Object} params - Query parameters
   * @param {string} [params.search] - Search query
   * @returns {Promise<Array>} List of theatres
   */
  getAllTheatres: async (params = {}) => {
    const response = await apiClient.get('/theatres', { params });
    return response.data;
  },

  /**
   * Get a theatre by ID
   * @param {number|string} id - Theatre ID
   * @returns {Promise<Object>} Theatre details
   */
  getTheatreById: async (id) => {
    const response = await apiClient.get(`/theatres/${id}`);
    return response.data;
  },

  /**
   * Search theatres by name
   * @param {string} name - Theatre name to search for
   * @returns {Promise<Array>} List of theatres matching the search
   */
  searchTheatresByName: async (name) => {
    const response = await apiClient.get('/theatres/search', { params: { name } });
    return response.data;
  },

  /**
   * Get theatres that show a specific movie
   * @param {number|string} movieId - Movie ID
   * @returns {Promise<Array>} List of theatres showing the movie
   */
  getTheatresByMovie: async (movieId) => {
    const response = await apiClient.get(`/theatres/movie/${movieId}`);
    return response.data;
  },

  /**
   * Create a new theatre (Admin only)
   * @param {Object} theatreData - Theatre data
   * @returns {Promise<Object>} Created theatre
   */
  createTheatre: async (theatreData) => {
    const response = await apiClient.post('/admin/theatres', theatreData);
    return response.data;
  },

  /**
   * Update a theatre (Admin only)
   * @param {number|string} id - Theatre ID
   * @param {Object} theatreData - Updated theatre data
   * @returns {Promise<Object>} Updated theatre
   */
  updateTheatre: async (id, theatreData) => {
    const response = await apiClient.put(`/admin/theatres/${id}`, theatreData);
    return response.data;
  },

  /**
   * Delete a theatre (Admin only)
   * @param {number|string} id - Theatre ID
   * @returns {Promise<Object>} Response
   */
  deleteTheatre: async (id) => {
    const response = await apiClient.delete(`/admin/theatres/${id}`);
    return response.data;
  },

  /**
   * Get seating layout for a theatre's screen
   * @param {number|string} theatreId - Theatre ID
   * @param {number} screenNumber - Screen number
   * @returns {Promise<Object>} Seating layout
   */
  getSeatingLayout: async (theatreId, screenNumber) => {
    const response = await apiClient.get(`/theatres/${theatreId}/screens/${screenNumber}/layout`);
    return response.data;
  }
};

export default theatreApi;