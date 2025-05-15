import apiClient from './client';

/**
 * Movie API service
 * Handles all movie-related operations
 */
const movieApi = {
  /**
   * Get all movies with optional filtering
   * @param {Object} params - Query parameters
   * @param {string} [params.query] - Search query
   * @param {string} [params.genre] - Filter by genre
   * @param {string} [params.status] - Filter by status (NOW_PLAYING, UPCOMING)
   * @returns {Promise<Array>} List of movies
   */
  getMovies: async (params = {}) => {
    const response = await apiClient.get('/movies', { params });
    return response.data;
  },

  /**
   * Get a movie by ID
   * @param {number|string} id - Movie ID
   * @returns {Promise<Object>} Movie details
   */
  getMovieById: async (id) => {
    const response = await apiClient.get(`/movies/${id}`);
    return response.data;
  },

  /**
   * Search movies by title
   * @param {string} query - Search query
   * @returns {Promise<Array>} List of movies matching the search
   */
  searchMovies: async (query) => {
    const response = await apiClient.get('/movies/search', { params: { query } });
    return response.data;
  },

  /**
   * Get movies by genre
   * @param {string} genre - Genre name
   * @returns {Promise<Array>} List of movies in the genre
   */
  getMoviesByGenre: async (genre) => {
    const response = await apiClient.get(`/movies/genre/${genre}`);
    return response.data;
  },

  /**
   * Get movies by IDs
   * @param {Set|Array} ids - Set or array of movie IDs
   * @returns {Promise<Array>} List of movies
   */
  getMoviesByIds: async (ids) => {
    if (!ids || ids.size === 0 || ids.length === 0) {
      return [];
    }
    
    const idsArray = Array.from(ids);
    const response = await apiClient.get('/movies/batch', { params: { ids: idsArray.join(',') } });
    return response.data;
  },

  /**
   * Get upcoming movies
   * @returns {Promise<Array>} List of upcoming movies
   */
  getUpcomingMovies: async () => {
    const response = await apiClient.get('/movies', { params: { status: 'UPCOMING' } });
    return response.data;
  },

  /**
   * Get now playing movies
   * @returns {Promise<Array>} List of now playing movies
   */
  getNowPlayingMovies: async () => {
    const response = await apiClient.get('/movies', { params: { status: 'NOW_PLAYING' } });
    return response.data;
  },

  /**
   * Get all movie genres
   * @returns {Promise<Array>} List of genres
   */
  getGenres: async () => {
    const response = await apiClient.get('/movies/genres');
    return response.data;
  },

  /**
   * Create a new movie (Admin only)
   * @param {Object} movieData - Movie data
   * @returns {Promise<Object>} Created movie
   */
  createMovie: async (movieData) => {
    const response = await apiClient.post('/movies', movieData);
    return response.data;
  },

  /**
   * Update a movie (Admin only)
   * @param {number|string} id - Movie ID
   * @param {Object} movieData - Updated movie data
   * @returns {Promise<Object>} Updated movie
   */
  updateMovie: async (id, movieData) => {
    const response = await apiClient.put(`/movies/${id}`, movieData);
    return response.data;
  },

  /**
   * Delete a movie (Admin only)
   * @param {number|string} id - Movie ID
   * @returns {Promise<Object>} Response
   */
  deleteMovie: async (id) => {
    const response = await apiClient.delete(`/movies/${id}`);
    return response.data;
  },

  /**
   * Get screenings for a movie
   * @param {number|string} id - Movie ID
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Movie screenings
   */
  getMovieScreenings: async (id, days = 7) => {
    const response = await apiClient.get(`/movies/${id}/screenings`, { params: { days } });
    return response.data;
  }
};

export default movieApi;