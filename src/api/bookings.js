import apiClient from './client';

/**
 * Booking API service
 * Handles all booking-related operations
 */
const bookingApi = {
  /**
   * Get user's bookings
   * @returns {Promise<Array>} List of user's bookings
   */
  getUserBookings: async () => {
    const response = await apiClient.get('/bookings');
    return response.data;
  },

  /**
   * Get a booking by ID
   * @param {number|string} id - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  getBookingById: async (id) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Get booked seats for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Array>} List of booked seats
   */
  getBookedSeatsByScreeningId: async (screeningId) => {
    const response = await apiClient.get(`/bookings/screening/${screeningId}/seats`);
    return response.data;
  },

  /**
   * Get seating layout for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Object>} Seating layout
   */
  getSeatingLayout: async (screeningId) => {
    const response = await apiClient.get(`/bookings/screening/${screeningId}/layout`);
    return response.data;
  },

  /**
   * Calculate total price for selected seats
   * @param {number|string} screeningId - Screening ID
   * @param {Array<string>} selectedSeats - Selected seats
   * @returns {Promise<Object>} Price calculation
   */
  calculatePrice: async (screeningId, selectedSeats) => {
    const response = await apiClient.post(`/bookings/calculate`, {
      screeningId,
      selectedSeats
    });
    return response.data;
  },

  /**
   * Create a new booking
   * @param {number|string} screeningId - Screening ID
   * @param {Array<string>} selectedSeats - Selected seats
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Object>} Created booking
   */
  createBooking: async (screeningId, selectedSeats, paymentMethod) => {
    const response = await apiClient.post('/bookings', {
      screeningId,
      selectedSeats,
      paymentMethod
    });
    return response.data;
  },

  /**
   * Cancel a booking
   * @param {number|string} id - Booking ID
   * @returns {Promise<Object>} Response
   */
  cancelBooking: async (id) => {
    const response = await apiClient.delete(`/bookings/${id}`);
    return response.data;
  },

  /**
   * Admin functions
   */

  /**
   * Get all bookings (Admin only)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} List of bookings
   */
  getAllBookings: async (params = {}) => {
    const response = await apiClient.get('/admin/bookings', { params });
    return response.data;
  },

  /**
   * Update booking status (Admin only)
   * @param {number|string} id - Booking ID
   * @param {string} status - New status
   * @returns {Promise<Object>} Updated booking
   */
  updateBookingStatus: async (id, status) => {
    const response = await apiClient.post(`/admin/bookings/${id}/update-status`, null, {
      params: { status }
    });
    return response.data;
  },

  /**
   * Delete a booking (Admin only)
   * @param {number|string} id - Booking ID
   * @returns {Promise<Object>} Response
   */
  deleteBooking: async (id) => {
    const response = await apiClient.delete(`/admin/bookings/${id}`);
    return response.data;
  }
};

export default bookingApi;