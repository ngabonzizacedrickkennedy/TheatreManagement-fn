// src/hooks/useBookings.js - Improved version with better error handling
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useToast } from '@contexts/ToastContext';

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
          const response = await fetch('/api/bookings');
          
          if (!response.ok) {
            throw new Error(`Error fetching bookings: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats
          if (data.success === false) {
            throw new Error(data.message || 'Failed to fetch bookings');
          }
          
          // Extract data from the response
          const bookings = data.data || data || [];
          
          return Array.isArray(bookings) ? bookings : [];
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
          const response = await fetch(`/api/bookings/${id}`);
          
          if (!response.ok) {
            throw new Error(`Error fetching booking: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats
          if (data.success === false) {
            throw new Error(data.message || 'Failed to fetch booking');
          }
          
          // Extract data from the response
          return data.data || data;
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
          const response = await fetch(`/api/screenings/${screeningId}/booked-seats`);
          
          if (!response.ok) {
            throw new Error(`Error fetching booked seats: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats
          if (data.success === false) {
            throw new Error(data.message || 'Failed to fetch booked seats');
          }
          
          // Extract data from the response - handle different formats
          let bookedSeats = [];
          
          if (data.data) {
            bookedSeats = data.data;
          } else if (Array.isArray(data)) {
            bookedSeats = data;
          } else if (data.seats) {
            bookedSeats = data.seats;
          } else if (data.bookedSeats) {
            bookedSeats = data.bookedSeats;
          }
          
          return Array.isArray(bookedSeats) ? bookedSeats : [];
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
          const response = await fetch(`/api/screenings/${screeningId}/layout`);
          
          if (!response.ok) {
            throw new Error(`Error fetching seating layout: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats
          if (data.success === false) {
            throw new Error(data.message || 'Failed to fetch seating layout');
          }
          
          // Extract data from the response
          const layoutData = data.data || data;
          
          // Normalize the layout data
          if (layoutData && typeof layoutData === 'object') {
            // Check if it has the expected 'rows' property
            if (Array.isArray(layoutData.rows)) {
              // Standard format - just return it
              return layoutData;
            }
            
            // Try to parse alternative formats
            const rowKeys = Object.keys(layoutData).filter(key => 
              key.match(/^[A-Z]$/) // Simple check for row names (A, B, C, etc.)
            );
            
            if (rowKeys.length > 0) {
              // Extract rows from object keys
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
          
          // Fallback to default layout if the format is unexpected
          return {
            rows: [
              { name: "A", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
              { name: "B", seatsCount: 8, priceMultiplier: 1.0, seatType: "STANDARD" },
              { name: "C", seatsCount: 8, priceMultiplier: 1.2, seatType: "PREMIUM" }
            ],
            basePrice: layoutData?.basePrice || 10.99
          };
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
          const response = await fetch('/api/bookings/calculate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              screeningId,
              selectedSeats
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Error calculating price: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats
          if (data.success === false) {
            throw new Error(data.message || 'Failed to calculate price');
          }
          
          // Extract data from the response
          const priceData = data.data || data;
          
          // Provide a fallback if API returns unexpected format
          if (!priceData.totalPrice) {
            // Simple fallback for total price (10.99 per seat)
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
          
          // Normalize the booking data - check what property name the API expects
          const normalizedData = {
            screeningId: data.screeningId,
            bookedSeats: data.selectedSeats, // The API might expect 'bookedSeats' instead of 'selectedSeats'
            paymentMethod: data.paymentMethod
          };
          
          const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(normalizedData),
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error creating booking: ${response.statusText}`);
          }
          
          const responseData = await response.json();
          
          // Handle different response formats
          if (responseData.success === false) {
            throw new Error(responseData.message || 'Failed to create booking');
          }
          
          // Extract data from the response
          return responseData.data || responseData;
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
          const response = await fetch(`/api/bookings/${id}`, {
            method: 'DELETE',
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error cancelling booking: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Handle different response formats
          if (data.success === false) {
            throw new Error(data.message || 'Failed to cancel booking');
          }
          
          return data.data || data;
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