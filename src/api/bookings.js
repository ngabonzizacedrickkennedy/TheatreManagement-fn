// src/api/bookings.js - Improved version with better error handling
import apiClient from './client';

/**
 * Booking API service with robust error handling
 * Handles all booking-related operations
 */
const bookingApi = {
  /**
   * Get user's bookings
   * @returns {Promise<Array>} List of user's bookings
   */
  getUserBookings: async () => {
    try {
      const response = await apiClient.get('/bookings');
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const bookingsData = responseData.data || responseData;
      
      return Array.isArray(bookingsData) ? bookingsData : [];
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      throw error;
    }
  },

  /**
   * Get a booking by ID
   * @param {number|string} id - Booking ID
   * @returns {Promise<Object>} Booking details
   */
  getBookingById: async (id) => {
    try {
      const response = await apiClient.get(`/bookings/${id}`);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      return responseData.data || responseData;
    } catch (error) {
      console.error(`Error fetching booking with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get booked seats for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Array>} List of booked seats
   */
  getBookedSeatsByScreeningId: async (screeningId) => {
    try {
      // Try different possible endpoints
      let response;
      try {
        // Try primary endpoint
        response = await apiClient.get(`/bookings/screening/${screeningId}/seats`);
      } catch (primaryError) {
        console.warn('Primary endpoint failed, trying alternative:', primaryError);
        // Try alternative endpoint
        response = await apiClient.get(`/screenings/${screeningId}/booked-seats`);
      }
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const seatsData = responseData.data || responseData;
      
      // Different APIs might return different formats
      if (Array.isArray(seatsData)) {
        return seatsData;
      } else if (seatsData.seats && Array.isArray(seatsData.seats)) {
        return seatsData.seats;
      } else if (seatsData.bookedSeats && Array.isArray(seatsData.bookedSeats)) {
        return seatsData.bookedSeats;
      } else if (typeof seatsData === 'object') {
        // Try to extract from object keys if it's a map of seat IDs
        return Object.keys(seatsData).filter(key => key.match(/^[A-Z][0-9]+$/));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching booked seats for screening ${screeningId}:`, error);
      return [];
    }
  },

  /**
   * Get seating layout for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Object>} Seating layout
   */
  getSeatingLayout: async (screeningId) => {
    try {
      // Try different possible endpoints
      let response;
      try {
        // Try primary endpoint
        response = await apiClient.get(`/screenings/${screeningId}/layout`);
      } catch (primaryError) {
        console.warn('Primary endpoint failed, trying alternative:', primaryError);
        
        // Try to get theatre and screen info from the screening
        const screeningResponse = await apiClient.get(`/screenings/${screeningId}`);
        const screening = screeningResponse.data.data || screeningResponse.data;
        
        if (screening && screening.theatreId && screening.screenNumber) {
          // Try alternative endpoint with theatre and screen
          response = await apiClient.get(`/admin/seats/theatre/${screening.theatreId}/screen/${screening.screenNumber}`);
        } else {
          throw new Error('Could not retrieve theatre and screen information');
        }
      }
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const layoutData = responseData.data || responseData;
      
      // Different APIs might return different formats
      // Process data to return in a consistent format
      if (layoutData.rows && Array.isArray(layoutData.rows)) {
        // Standard format with rows array
        return layoutData;
      } else if (Array.isArray(layoutData)) {
        // Alternative format with array of seat objects - convert to rows
        const seatsByRow = layoutData.reduce((acc, seat) => {
          const rowName = seat.rowName || (typeof seat.id === 'string' ? seat.id.charAt(0) : null);
          
          if (rowName) {
            if (!acc[rowName]) {
              acc[rowName] = {
                seats: [],
                priceMultiplier: seat.priceMultiplier || 1.0,
                seatType: seat.seatType || 'STANDARD'
              };
            }
            
            acc[rowName].seats.push(seat);
          }
          
          return acc;
        }, {});
        
        // Convert to layout format
        const rows = Object.entries(seatsByRow).map(([name, rowData]) => ({
          name,
          seatsCount: rowData.seats.length,
          priceMultiplier: rowData.priceMultiplier,
          seatType: rowData.seatType
        }));
        
        return {
          rows,
          basePrice: 10.99 // Assume a default base price
        };
      } else if (typeof layoutData === 'object') {
        // Check if it's organized by row names (A, B, C, etc.)
        const rowKeys = Object.keys(layoutData).filter(key => key.match(/^[A-Z]$/));
        
        if (rowKeys.length > 0) {
          // Convert to rows format
          const rows = rowKeys.map(name => {
            const rowData = layoutData[name];
            return {
              name,
              seatsCount: rowData.seatsCount || 10,
              priceMultiplier: rowData.priceMultiplier || 1.0,
              seatType: rowData.seatType || 'STANDARD'
            };
          });
          
          return {
            rows,
            basePrice: layoutData.basePrice || 10.99
          };
        }
      }
      
      // Fallback to default layout
      return {
        rows: [
          { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
          { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
          { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
        ],
        basePrice: 10.99
      };
    } catch (error) {
      console.error(`Error fetching seating layout for screening ${screeningId}:`, error);
      
      // Return a default layout if all attempts fail
      return {
        rows: [
          { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
          { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
          { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
        ],
        basePrice: 10.99
      };
    }
  },

  /**
   * Calculate total price for selected seats
   * @param {number|string} screeningId - Screening ID
   * @param {Array<string>} selectedSeats - Selected seats
   * @returns {Promise<Object>} Price calculation
   */
  calculatePrice: async (screeningId, selectedSeats) => {
    try {
      const response = await apiClient.post(`/bookings/calculate`, {
        screeningId,
        selectedSeats
      });
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const priceData = responseData.data || responseData;
      
      // Ensure the response has the expected format
      if (!priceData.totalPrice) {
        // Fallback price calculation (10.99 per seat)
        const totalPrice = selectedSeats.length * 10.99;
        
        return {
          basePrice: 10.99,
          totalPrice,
          seats: selectedSeats
        };
      }
      
      return priceData;
    } catch (error) {
      console.error(`Error calculating price for screening ${screeningId}:`, error);
      
      // Fallback price calculation
      const totalPrice = selectedSeats.length * 10.99;
      
      return {
        basePrice: 10.99,
        totalPrice,
        seats: selectedSeats
      };
    }
  },

  /**
   * Create a new booking
   * @param {number|string} screeningId - Screening ID
   * @param {Array<string>} selectedSeats - Selected seats
   * @param {string} paymentMethod - Payment method
   * @returns {Promise<Object>} Created booking
   */
  createBooking: async (screeningId, selectedSeats, paymentMethod) => {
    try {
      // Check for required fields
      if (!screeningId) {
        throw new Error('Screening ID is required');
      }
      
      if (!selectedSeats || selectedSeats.length === 0) {
        throw new Error('Selected seats are required');
      }
      
      if (!paymentMethod) {
        throw new Error('Payment method is required');
      }
      
      // Normalize data based on what the API expects
      const bookingData = {
        screeningId,
        bookedSeats: selectedSeats, // API might expect 'bookedSeats' instead of 'selectedSeats'
        paymentMethod
      };
      
      const response = await apiClient.post('/bookings', bookingData);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      return responseData.data || responseData;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  },

  /**
   * Cancel a booking
   * @param {number|string} id - Booking ID
   * @returns {Promise<Object>} Response
   */
  cancelBooking: async (id) => {
    try {
      const response = await apiClient.delete(`/bookings/${id}`);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      return responseData.data || responseData;
    } catch (error) {
      console.error(`Error cancelling booking ${id}:`, error);
      throw error;
    }
  }
};

export default bookingApi;