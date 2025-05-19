import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import  theatreApi  from '@api/theatres';

// Get all theatres
export const useGetTheatres = () => {
  return useQuery({
    queryKey: ['theatres'],
    queryFn: async () => {
      const response = await theatreApi.get('/theatres');
      return response.data;
    }
  });
};

// Get a single theatre by ID
export const useGetTheatre = (id) => {
  return useQuery({
    queryKey: ['theatres', id],
    queryFn: async () => {
      const response = await theatreApi.get(`/theatres/${id}`);
      return response.data;
    },
    enabled: !!id
  });
};

// Create a new theatre
export const useCreateTheatre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (theatreData) => {
      const response = await theatreApi.post('/theatres', theatreData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theatres'] });
    }
  });
};

// Update a theatre
export const useUpdateTheatre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, theatreData }) => {
      const response = await theatreApi.put(`/theatres/${id}`, theatreData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['theatres'] });
      queryClient.invalidateQueries({ queryKey: ['theatres', variables.id] });
    }
  });
};

// Delete a theatre
export const useDeleteTheatre = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await theatreApi.delete(`/theatres/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['theatres'] });
    }
  });
};

// Get theatre seats
export const useGetTheatreSeats = (theatreId) => {
  return useQuery({
    queryKey: ['theatres', theatreId, 'seats'],
    queryFn: async () => {
      const response = await theatreApi.get(`/theatres/${theatreId}/seats`);
      return response.data;
    },
    enabled: !!theatreId
  });
};

// Update theatre seats
export const useUpdateTheatreSeats = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ theatreId, seatsData }) => {
      const response = await theatreApi.put(`/theatres/${theatreId}/seats`, seatsData);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['theatres', variables.theatreId, 'seats'] });
    }
  });
};

// Get theatre screenings
export const useGetTheatreScreenings = (theatreId) => {
  return useQuery({
    queryKey: ['theatres', theatreId, 'screenings'],
    queryFn: async () => {
      const response = await theatreApi.get(`/theatres/${theatreId}/screenings`);
      return response.data;
    },
    enabled: !!theatreId
  });
};

// Export all hooks
export const useTheatres = {
  useGetTheatres,
  useGetTheatre,
  useCreateTheatre,
  useUpdateTheatre,
  useDeleteTheatre,
  useGetTheatreSeats,
  useUpdateTheatreSeats,
  useGetTheatreScreenings
}; 