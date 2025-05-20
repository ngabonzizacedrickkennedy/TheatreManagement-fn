// src/hooks/useTheatres.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import theatreApi from '@api/theatres';

/**
 * Custom hook to get all theatres
 */
export const useGetTheatres = (options = {}) => {
  return useQuery({
    queryKey: ['theatres'],
    queryFn: () => theatreApi.getAllTheatres(),
    ...options
  });
};

/**
 * Custom hook to get a single theatre by ID
 */
export const useGetTheatre = (id, options = {}) => {
  return useQuery({
    queryKey: ['theatres', id],
    queryFn: () => theatreApi.getTheatreById(id),
    enabled: !!id,
    ...options
  });
};

/**
 * Custom hook to create a new theatre
 */
export const useCreateTheatre = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (theatreData) => theatreApi.createTheatre(theatreData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theatres'] });
    },
    ...options
  });
};

/**
 * Custom hook to update a theatre
 */
export const useUpdateTheatre = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, theatreData }) => theatreApi.updateTheatre(id, theatreData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['theatres'] });
      queryClient.invalidateQueries({ queryKey: ['theatres', variables.id] });
    },
    ...options
  });
};

/**
 * Custom hook to delete a theatre
 */
export const useDeleteTheatre = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => theatreApi.deleteTheatre(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theatres'] });
    },
    ...options
  });
};

/**
 * Custom hook to get theatre seats
 */
export const useGetTheatreSeats = (theatreId, screenNumber, options = {}) => {
  return useQuery({
    queryKey: ['theatres', theatreId, 'screens', screenNumber, 'seats'],
    queryFn: () => theatreApi.getSeatsByTheatreAndScreen(theatreId, screenNumber),
    enabled: !!theatreId && !!screenNumber,
    ...options
  });
};

/**
 * Custom hook to update theatre seats
 */
export const useUpdateTheatreSeats = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ theatreId, screenNumber, seatsData }) => 
      theatreApi.updateSeats(theatreId, screenNumber, seatsData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['theatres', variables.theatreId, 'screens', variables.screenNumber, 'seats'] 
      });
    },
    ...options
  });
};