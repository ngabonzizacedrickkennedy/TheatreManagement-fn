import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import movieApi from '@api/movies';

/**
 * Custom hook for managing movies
 * Centralizes all movie-related data fetching and mutations
 */
export const useMovies = () => {
  const queryClient = useQueryClient();

  /**
   * Get all movies with optional filtering
   */
  const useGetMovies = (params = {}, options = {}) => {
    return useQuery({
      queryKey: ['movies', params],
      queryFn: async () => {
        const data = await movieApi.getMovies(params);
        // Map API response to expected component props
        return Array.isArray(data) ? data.map(movie => ({
          id: movie.id,
          title: movie.title,
          posterUrl: movie.posterImageUrl, // Map posterImageUrl to posterUrl
          genre: movie.genre,
          rating: movie.rating,
          releaseDate: movie.releaseDate,
          duration: movie.durationMinutes,
          description: movie.description,
          status: movie.status || 'NOW_PLAYING', // Default status
          durationMinutes: movie.durationMinutes,
          director: movie.director,
          cast: movie.cast,
          trailerUrl: movie.trailerUrl
        })) : [];
      },
      ...options
    });
  };

  /**
   * Get a movie by ID
   */
  const useGetMovie = (id, options = {}) => {
    return useQuery({
      queryKey: ['movie', id],
      queryFn: async () => {
        const movie = await movieApi.getMovieById(id);
        // Map API response to expected component props
        return movie ? {
          id: movie.id,
          title: movie.title,
          posterUrl: movie.posterImageUrl, // Map posterImageUrl to posterUrl
          genre: movie.genre,
          rating: movie.rating,
          releaseDate: movie.releaseDate,
          duration: movie.durationMinutes,
          description: movie.description,
          status: movie.status || 'NOW_PLAYING', // Default status
          durationMinutes: movie.durationMinutes,
          director: movie.director,
          cast: movie.cast,
          trailerUrl: movie.trailerUrl
        } : null;
      },
      enabled: !!id,
      ...options
    });
  };

  /**
   * Search movies by title
   */
  const useSearchMovies = (query, options = {}) => {
    return useQuery({
      queryKey: ['movies', 'search', query],
      queryFn: () => movieApi.searchMovies(query),
      enabled: !!query && query.length > 2,
      ...options
    });
  };

  /**
   * Get movies by genre
   */
  const useGetMoviesByGenre = (genre, options = {}) => {
    return useQuery({
      queryKey: ['movies', 'genre', genre],
      queryFn: () => movieApi.getMoviesByGenre(genre),
      enabled: !!genre,
      ...options
    });
  };

  /**
   * Get screenings for a movie
   */
  const useGetMovieScreenings = (movieId, days, options = {}) => {
    return useQuery({
      queryKey: ['movie', movieId, 'screenings', days],
      queryFn: () => movieApi.getMovieScreenings(movieId, days),
      enabled: !!movieId,
      ...options
    });
  };

  /**
   * Get all movie genres
   */
  const useGetGenres = (options = {}) => {
    return useQuery({
      queryKey: ['movies', 'genres'],
      queryFn: movieApi.getGenres,
      ...options
    });
  };

  /**
   * Create a new movie
   */
  const useCreateMovie = (options = {}) => {
    return useMutation({
      mutationFn: (movieData) => movieApi.createMovie(movieData),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['movies'] });
      },
      ...options
    });
  };

  /**
   * Update a movie
   */
  const useUpdateMovie = (options = {}) => {
    return useMutation({
      mutationFn: ({ id, data }) => movieApi.updateMovie(id, data),
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries({ queryKey: ['movies'] });
        queryClient.invalidateQueries({ queryKey: ['movie', variables.id] });
      },
      ...options
    });
  };

  /**
   * Delete a movie
   */
  const useDeleteMovie = (options = {}) => {
    return useMutation({
      mutationFn: (id) => movieApi.deleteMovie(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['movies'] });
      },
      ...options
    });
  };

  return {
    useGetMovies,
    useGetMovie,
    useSearchMovies,
    useGetMoviesByGenre,
    useGetMovieScreenings,
    useGetGenres,
    useCreateMovie,
    useUpdateMovie,
    useDeleteMovie
  };
};

export default useMovies;