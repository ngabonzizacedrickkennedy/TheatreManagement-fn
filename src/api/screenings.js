// src/api/screenings.js - Improved version with better error handling and format compatibility
import apiClient from './client';

/**
 * Screening API service with robust error handling
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
    try {
      const response = await apiClient.get('/screenings', { params });
      
      // Normalize response data
      const responseData = response.data || {};
      return Array.isArray(responseData) ? responseData : 
             Array.isArray(responseData.data) ? responseData.data : 
             Array.isArray(responseData.screenings) ? responseData.screenings : [];
    } catch (error) {
      console.error('Error fetching screenings:', error);
      return [];
    }
  },

  /**
   * Get a screening by ID
   * @param {number|string} id - Screening ID
   * @returns {Promise<Object>} Screening details
   */
  getScreeningById: async (id) => {
    try {
      const response = await apiClient.get(`/screenings/${id}`);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const screeningData = responseData.data || responseData;
      
      // Ensure dates are in ISO format for consistency
      if (screeningData.startTime && typeof screeningData.startTime === 'string') {
        try {
          // Check if the date needs ISO formatting
          if (!screeningData.startTime.includes('T')) {
            const dateParts = screeningData.startTime.split(/[- :]/);
            if (dateParts.length >= 3) {
              const year = parseInt(dateParts[0]);
              const month = parseInt(dateParts[1]) - 1; // Month is 0-based in Date constructor
              const day = parseInt(dateParts[2]);
              const hour = dateParts.length > 3 ? parseInt(dateParts[3]) : 0;
              const minute = dateParts.length > 4 ? parseInt(dateParts[4]) : 0;
              
              const date = new Date(year, month, day, hour, minute);
              screeningData.startTime = date.toISOString();
            }
          }
        } catch (dateError) {
          console.error('Error normalizing date format:', dateError);
          // Keep the original format if conversion fails
        }
      }
      
      return screeningData;
    } catch (error) {
      console.error(`Error fetching screening with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Get screenings for a movie
   * @param {number|string} movieId - Movie ID
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Movie screenings grouped by date
   */
  getMovieScreenings: async (movieId, days = 7) => {
    try {
      const response = await apiClient.get(`/movies/${movieId}/screenings`, {
        params: { days }
      });
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      return responseData.data || responseData;
    } catch (error) {
      console.error(`Error fetching screenings for movie ${movieId}:`, error);
      return {};
    }
  },

  /**
   * Get screenings for a theatre
   * @param {number|string} theatreId - Theatre ID
   * @returns {Promise<Array>} List of screenings
   */
  getTheatreScreenings: async (theatreId) => {
    try {
      const response = await apiClient.get(`/theatres/${theatreId}/screenings`);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const screeningsData = responseData.data || responseData;
      
      return Array.isArray(screeningsData) ? screeningsData : 
             Array.isArray(screeningsData.screenings) ? screeningsData.screenings : [];
    } catch (error) {
      console.error(`Error fetching screenings for theatre ${theatreId}:`, error);
      return [];
    }
  },

  /**
   * Get screenings by date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @returns {Promise<Array>} List of screenings
   */
  getScreeningsByDateRange: async (startDate, endDate) => {
    try {
      const formattedStartDate = formatDateParam(startDate);
      const formattedEndDate = formatDateParam(endDate);
      
      const response = await apiClient.get('/screenings', { 
        params: { 
          startDate: formattedStartDate,
          endDate: formattedEndDate
        } 
      });
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const screeningsData = responseData.data || responseData;
      
      return Array.isArray(screeningsData) ? screeningsData : 
             Array.isArray(screeningsData.screenings) ? screeningsData.screenings : [];
    } catch (error) {
      console.error('Error fetching screenings by date range:', error);
      return [];
    }
  },

  /**
   * Get upcoming screenings
   * @param {number} [days=7] - Number of days to include
   * @returns {Promise<Object>} Upcoming screenings grouped by date
   */
  getUpcomingScreenings: async (days = 7) => {
    try {
      // Try the primary endpoint
      try {
        const response = await apiClient.get('/screenings/upcoming', {
          params: { days }
        });
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Return the data if successful
        return responseData.data || responseData;
      } catch (primaryError) {
        console.warn('Primary upcoming screenings endpoint failed, trying alternative:', primaryError);
        
        // Try alternative endpoint (common in Spring Boot APIs)
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
        
        const response = await apiClient.get('/screenings', {
          params: { 
            startDate: formattedDate,
            days
          }
        });
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats and convert to grouped by date format
        const screeningsData = responseData.data || responseData;
        
        if (Array.isArray(screeningsData)) {
          // Convert array of screenings to object grouped by date
          return screeningsData.reduce((acc, screening) => {
            if (screening.startTime) {
              const date = new Date(screening.startTime);
              const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
              
              if (!acc[dateString]) {
                acc[dateString] = [];
              }
              
              acc[dateString].push(screening);
            }
            return acc;
          }, {});
        }
        
        return screeningsData;
      }
    } catch (error) {
      console.error('Error fetching upcoming screenings:', error);
      return {};
    }
  },

  /**
   * Get available seats for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Array>} List of available seats
   */
  getScreeningSeats: async (screeningId) => {
    try {
      const response = await apiClient.get(`/screenings/${screeningId}/seats`);
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const seatsData = responseData.data || responseData;
      
      return Array.isArray(seatsData) ? seatsData : 
             Array.isArray(seatsData.seats) ? seatsData.seats : [];
    } catch (error) {
      console.error(`Error fetching seats for screening ${screeningId}:`, error);
      return [];
    }
  },

  /**
   * Get booked seats for a screening
   * @param {number|string} screeningId - Screening ID
   * @returns {Promise<Array>} List of booked seats
   */
  getBookedSeats: async (screeningId) => {
    try {
      // Try getting booked seats using the primary endpoint
      try {
        const response = await apiClient.get(`/screenings/${screeningId}/booked-seats`);
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats
        const seatsData = responseData.data || responseData;
        
        return Array.isArray(seatsData) ? seatsData : 
               Array.isArray(seatsData.seats) ? seatsData.seats : 
               Array.isArray(seatsData.bookedSeats) ? seatsData.bookedSeats : [];
      } catch (primaryError) {
        // Try the alternative endpoint (sometimes used in Spring Boot APIs)
        console.warn('Primary booked seats endpoint failed, trying alternative:', primaryError);
        
        const response = await apiClient.get(`/bookings/screening/${screeningId}/seats`);
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats
        const seatsData = responseData.data || responseData;
        
        return Array.isArray(seatsData) ? seatsData : 
               Array.isArray(seatsData.seats) ? seatsData.seats : 
               Array.isArray(seatsData.bookedSeats) ? seatsData.bookedSeats : [];
      }
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
      // Try the primary endpoint
      try {
        const response = await apiClient.get(`/screenings/${screeningId}/layout`);
        
        // Normalize response data
        const responseData = response.data || {};
        
        // Check for different response formats
        const layoutData = responseData.data || responseData;
        
        return layoutData;
      } catch (primaryError) {
        console.warn('Primary layout endpoint failed, trying alternative:', primaryError);
        
        // Try alternative endpoint sometimes used in Spring Boot APIs
        const response = await apiClient.get(`/admin/seats/theatre/1/screen/1`);
        
        // This endpoint might return a different format that needs conversion
        const seatsData = response.data || [];
        
        // Convert to the expected layout format
        if (Array.isArray(seatsData) && seatsData.length > 0) {
          // Group seats by row
          const seatsByRow = seatsData.reduce((acc, seat) => {
            if (!acc[seat.rowName]) {
              acc[seat.rowName] = {
                seats: [],
                seatType: seat.seatType,
                priceMultiplier: seat.priceMultiplier || 1.0
              };
            }
            
            acc[seat.rowName].seats.push(seat);
            return acc;
          }, {});
          
          // Convert to layout format with rows
          const rows = Object.entries(seatsByRow).map(([name, rowData]) => ({
            name,
            seatsCount: rowData.seats.length,
            seatType: rowData.seatType,
            priceMultiplier: rowData.priceMultiplier
          }));
          
          return {
            rows,
            basePrice: 10.99 // Assume a default base price
          };
        }
        
        // If conversion fails, return a default layout
        return {
          rows: [
            { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
            { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
            { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
          ],
          basePrice: 10.99
        };
      }
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
   * Get all screening formats
   * @returns {Promise<Array>} List of screening formats
   */
  getScreeningFormats: async () => {
    try {
      const response = await apiClient.get('/admin/screenings/formats');
      
      // Normalize response data
      const responseData = response.data || {};
      
      // Check for different response formats
      const formatsData = responseData.data || responseData;
      
      // Return the list of formats, or a default list if the API fails
      return Array.isArray(formatsData) ? formatsData : ['STANDARD', 'IMAX', '3D', 'DOLBY'];
    } catch (error) {
      console.error('Error fetching screening formats:', error);
      return ['STANDARD', 'IMAX', '3D', 'DOLBY'];
    }
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