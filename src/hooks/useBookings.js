// src/hooks/useBookings.js
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@contexts/ToastContext';
import bookingApi from '@api/bookings';

/**
 * Custom hook for managing bookings
 * Centralizes all booking-related data fetching and mutations with improved error handling
 */
export const useBookings = () => {
  const queryClient = useQueryClient();
  const { showError } = useToast();

  /**
   * Get user's bookings
   */
  const useGetUserBookings = (options = {}) => {
    return useQuery({
      queryKey: ['user-bookings'],
      queryFn: async () => {
        try {
          const data = await bookingApi.getUserBookings();
          return Array.isArray(data) ? data : [];
        } catch (error) {
          console.error('Error fetching user bookings:', error);
          throw error;
        }
      },
      ...options
    });
  };
  
  /**
   * Get all bookings (Admin only)
   */
  const useGetAllBookings = (options = {}) => {
    return useQuery({
      queryKey: ['admin-bookings'],
      queryFn: async () => {
        try {
          // Try the admin endpoint first
          try {
            const data = await bookingApi.getAllBookings();
            return Array.isArray(data) ? data : [];
          } catch (error) {
            // Fallback to getUserBookings for development/testing
            console.warn('Admin bookings endpoint failed, falling back:', error);
            const data = await bookingApi.getUserBookings();
            return Array.isArray(data) ? data : [];
          }
        } catch (error) {
          console.error('Error fetching all bookings:', error);
          return []; // Return empty array instead of throwing to prevent dashboard from breaking
        }
      },
      ...options
    });
  };

  /**
   * Get a booking by ID
   */
  const useGetBooking = (id, options = {}) => {
    return useQuery({
      queryKey: ['booking', id],
      queryFn: async () => {
        try {
          return await bookingApi.getBookingById(id);
        } catch (error) {
          console.error(`Error fetching booking ${id}:`, error);
          throw error;
        }
      },
      enabled: !!id,
      ...options
    });
  };

  /**
   * Get booked seats for a screening
   */
  const useGetBookedSeats = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['booked-seats', screeningId],
      queryFn: async () => {
        try {
          return await bookingApi.getBookedSeatsByScreeningId(screeningId);
        } catch (error) {
          console.error(`Error fetching booked seats for screening ${screeningId}:`, error);
          throw error;
        }
      },
      enabled: !!screeningId,
      ...options
    });
  };

  /**
   * Get seating layout for a screening
   */
  const useGetSeatingLayout = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['seating-layout', screeningId],
      queryFn: async () => {
        try {
          return await bookingApi.getSeatingLayout(screeningId);
        } catch (error) {
          console.error(`Error fetching seating layout for screening ${screeningId}:`, error);
          throw error;
        }
      },
      enabled: !!screeningId,
      ...options
    });
  };

  /**
   * Calculate total price for selected seats
   */
  const useCalculatePrice = (screeningId, selectedSeats, options = {}) => {
    return useQuery({
      queryKey: ['calculate-price', screeningId, selectedSeats],
      queryFn: async () => {
        try {
          // Check if we can calculate the price ourselves based on the layout
          const layoutQuery = queryClient.getQueryData(['seating-layout', screeningId]);
          
          if (layoutQuery && layoutQuery.rows && layoutQuery.basePrice) {
            // Simple price calculation without API call
            let totalPrice = 0;
            
            selectedSeats.forEach(seat => {
              const rowName = seat.charAt(0);
              const row = layoutQuery.rows.find(r => r.name === rowName);
              
              if (row) {
                totalPrice += layoutQuery.basePrice * (row.priceMultiplier || 1.0);
              } else {
                totalPrice += layoutQuery.basePrice;
              }
            });
            
            return {
              basePrice: layoutQuery.basePrice,
              totalPrice,
              seats: selectedSeats
            };
          }
          
          // Fall back to API call if we can't calculate ourselves
          return await bookingApi.calculatePrice(screeningId, selectedSeats);
        } catch (error) {
          console.error(`Error calculating price for screening ${screeningId}:`, error);
          
          // Always return a valid price object even if the API fails
          const totalPrice = selectedSeats.length * 10.99;
          
          return {
            basePrice: 10.99,
            totalPrice,
            seats: selectedSeats
          };
        }
      },
      enabled: !!screeningId && Array.isArray(selectedSeats) && selectedSeats.length > 0,
      ...options
    });
  };

  /**
   * Create a new booking
   */
  const useCreateBooking = (options = {}) => {
    return useMutation({
      mutationFn: async (data) => {
        try {
          // Ensure we have the required data
          if (!data.screeningId) {
            throw new Error('Screening ID is required');
          }
          
          if (!data.selectedSeats || data.selectedSeats.length === 0) {
            throw new Error('Selected seats are required');
          }
          
          if (!data.paymentMethod) {
            throw new Error('Payment method is required');
          }
          
          // Use the bookingApi which handles token validation internally
          return await bookingApi.createBooking(
            data.screeningId, 
            data.selectedSeats, 
            data.paymentMethod
          );
        } catch (error) {
          console.error('Error creating booking:', error);
          throw error;
        }
      },
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      },
      onError: (error) => {
        showError(error.message || 'Failed to create booking. Please try again.');
      },
      ...options
    });
  };

  /**
   * Cancel a booking
   */
  const useCancelBooking = (options = {}) => {
    return useMutation({
      mutationFn: async (id) => {
        try {
          return await bookingApi.cancelBooking(id);
        } catch (error) {
          console.error(`Error cancelling booking ${id}:`, error);
          throw error;
        }
      },
      onSuccess: (_, id) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['booking', id] });
      },
      onError: (error) => {
        showError(error.message || 'Failed to cancel booking. Please try again.');
      },
      ...options
    });
  };

  /**
   * Get booking statistics by status
   */
  const useGetBookingStats = (options = {}) => {
    return useQuery({
      queryKey: ['booking-stats'],
      queryFn: async () => {
        try {
          // Try to get the stats from the API first
          try {
            const data = await bookingApi.getBookingStats();
            return data;
          } catch (error) {
            // If API fails, calculate from all bookings
            console.warn('Booking stats endpoint failed, calculating manually:', error);
            
            const bookings = await bookingApi.getAllBookings();
            
            if (!Array.isArray(bookings)) return { completed: 0, pending: 0, cancelled: 0 };
            
            const completed = bookings.filter(b => b.paymentStatus === 'COMPLETED').length;
            const pending = bookings.filter(b => b.paymentStatus === 'PENDING').length;
            const cancelled = bookings.filter(b => b.paymentStatus === 'CANCELLED').length;
            
            return { completed, pending, cancelled };
          }
        } catch (error) {
          console.error('Error getting booking stats:', error);
          return { completed: 0, pending: 0, cancelled: 0 };
        }
      },
      ...options
    });
  };

  // Return all hooks
  return {
    useGetUserBookings,
    useGetAllBookings,
    useGetBooking,
    useGetBookedSeats,
    useGetSeatingLayout,
    useCalculatePrice,
    useCreateBooking,
    useCancelBooking,
    useGetBookingStats
  };
};

export default useBookings;