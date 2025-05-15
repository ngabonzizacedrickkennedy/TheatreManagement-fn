import { useQuery } from '@tanstack/react-query';
import * as screeningApi from '@api/screenings';

/**
 * Custom hook for managing screenings
 * Centralizes all screening-related data fetching and mutations
 */
export const useScreenings = () => {
  /**
   * Get all screenings with optional filtering
   */
  const useGetScreenings = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ['screenings', params],
      queryFn: () => screeningApi.getScreenings(params),
      ...options
    });
  };

  /**
   * Get a screening by ID
   */
  const useGetScreening = (id, options = {}) => {
    return useQuery({
      queryKey: ['screening', id],
      queryFn: () => screeningApi.getScreeningById(id),
      enabled: !!id,
      ...options
    });
  };

  /**
   * Get screenings for a movie
   */
  const useGetMovieScreenings = (movieId, days = 7, options = {}) => {
    return useQuery({
      queryKey: ['movie-screenings', movieId, days],
      queryFn: () => screeningApi.getMovieScreenings(movieId, days),
      enabled: !!movieId,
      ...options
    });
  };

  /**
   * Get screenings for a theatre
   */
  const useGetTheatreScreenings = (theatreId, options = {}) => {
    return useQuery({
      queryKey: ['theatre-screenings', theatreId],
      queryFn: () => screeningApi.getTheatreScreenings(theatreId),
      enabled: !!theatreId,
      ...options
    });
  };

  /**
   * Get screenings by date range
   */
  const useGetScreeningsByDateRange = (startDate, endDate, options = {}) => {
    return useQuery({
      queryKey: ['screenings-by-date', startDate, endDate],
      queryFn: () => screeningApi.getScreeningsByDateRange(startDate, endDate),
      enabled: !!startDate && !!endDate,
      ...options
    });
  };

  /**
   * Get upcoming screenings (next 7 days by default)
   */
  const useGetUpcomingScreenings = (days = 7, options = {}) => {
    return useQuery({
      queryKey: ['upcoming-screenings', days],
      queryFn: () => screeningApi.getUpcomingScreenings(days),
      ...options
    });
  };

  /**
   * Get available seats for a screening
   */
  const useGetScreeningSeats = (screeningId, options = {}) => {
    return useQuery({
      queryKey: ['screening-seats', screeningId],
      queryFn: () => screeningApi.getScreeningSeats(screeningId),
      enabled: !!screeningId,
      ...options
    });
  };

  /**
   * Get screening formats
   */
  const useGetScreeningFormats = (options = {}) => {
    return useQuery({
      queryKey: ['screening-formats'],
      queryFn: screeningApi.getScreeningFormats,
      ...options
    });
  };

  return {
    useGetScreenings,
    useGetScreening,
    useGetMovieScreenings,
    useGetTheatreScreenings,
    useGetScreeningsByDateRange,
    useGetUpcomingScreenings,
    useGetScreeningSeats,
    useGetScreeningFormats
  };
};

export default useScreenings;