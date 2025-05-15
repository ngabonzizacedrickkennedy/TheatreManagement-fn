import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import * as bookingApi from '@api/bookings';

/**
 * Custom hook for managing bookings
 * Centralizes all booking-related data fetching and mutations
 */
export const useBookings = () => {
  const queryClient = useQueryClient();

  /**
   * Get user's bookings
   */
  const useGetUserBookings = (options = {}) => {
    return useQuery({
      queryKey: ['user-bookings'],
      queryFn: bookingApi.getUserBookings,
      ...options
    });
  };

  /**
   * Get a booking by ID
   */
  const useGetBooking = (id, options = {}) => {
    return useQuery({
      queryKey: ['booking', id],
      queryFn: () => bookingApi.getBookingById(id),
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
      queryFn: () => bookingApi.getBookedSeatsByScreeningId(screeningId),
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
      queryFn: () => bookingApi.getSeatingLayout(screeningId),
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
      queryFn: () => bookingApi.calculatePrice(screeningId, selectedSeats),
      enabled: !!screeningId && Array.isArray(selectedSeats) && selectedSeats.length > 0,
      ...options
    });
  };

  /**
   * Create a new booking
   */
  const useCreateBooking = (options = {}) => {
    return useMutation({
      mutationFn: (data) => bookingApi.createBooking(
        data.screeningId, 
        data.selectedSeats, 
        data.paymentMethod
      ),
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
      },
      ...options
    });
  };

  /**
   * Cancel a booking
   */
  const useCancelBooking = (options = {}) => {
    return useMutation({
      mutationFn: bookingApi.cancelBooking,
      onSuccess: (_, id) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['user-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['booking', id] });
      },
      ...options
    });
  };

  /**
   * Admin functions
   */

  /**
   * Get all bookings (Admin only)
   */
  const useGetAllBookings = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ['admin-bookings', params],
      queryFn: () => bookingApi.getAllBookings(params),
      ...options
    });
  };

  /**
   * Update booking status (Admin only)
   */
  const useUpdateBookingStatus = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, status }) => bookingApi.updateBookingStatus(id, status),
      onSuccess: (_, variables) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['booking', variables.id] });
      },
      ...options
    });
  };

  /**
   * Delete a booking (Admin only)
   */
  const useDeleteBooking = (options = {}) => {
    return useMutation({
      mutationFn: bookingApi.deleteBooking,
      onSuccess: () => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      },
      ...options
    });
  };

  return {
    useGetUserBookings,
    useGetBooking,
    useGetBookedSeats,
    useGetSeatingLayout,
    useCalculatePrice,
    useCreateBooking,
    useCancelBooking,
    useGetAllBookings,
    useUpdateBookingStatus,
    useDeleteBooking
  };
};

export default useBookings;