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
        queryClient.invalidateQueries({ queryKey: ['booking', id] });
      },
      onError: (error) => {
        showError(error.message || 'Failed to cancel booking. Please try again.');
      },
      ...options
    });
  };

  // Return all hooks
  return {
    useGetUserBookings,
    useGetBooking,
    useGetBookedSeats,
    useGetSeatingLayout,
    useCalculatePrice,
    useCreateBooking,
    useCancelBooking
  };
};

export default useBookings;