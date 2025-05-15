// src/pages/public/MovieDetails.jsx
import React from 'react';
import { useParams } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import { formatDate, formatDuration } from '@utils/formatUtils';

const MovieDetailsPage = () => {
  const { id } = useParams();
  const { useGetMovie } = useMovies();
  
  // Fetch movie details
  const {
    data: movie,
    isLoading,
    error
  } = useGetMovie(id);
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }
  
  // Error state
  if (error || !movie) {
    return <NotFound message="Movie not found" />;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Movie poster */}
          <div className="flex-shrink-0">
            {movie.posterImageUrl ? (
              <img
                src={movie.posterImageUrl}
                alt={`${movie.title} poster`}
                className="w-full md:w-64 rounded-lg shadow-lg"
              />
            ) : (
              <div className="w-full md:w-64 h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No poster available</span>
              </div>
            )}
          </div>
          
          {/* Movie details */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
            
            <div className="flex items-center mb-4 text-sm text-gray-600">
              {movie.rating && (
                <span className="mr-3 px-2 py-1 bg-gray-200 rounded">{movie.rating}</span>
              )}
              {movie.genre && (
                <span className="mr-3">{movie.genre.replace('_', ' ')}</span>
              )}
              {movie.durationMinutes && (
                <span className="mr-3">{formatDuration(movie.durationMinutes)}</span>
              )}
              {movie.releaseDate && (
                <span>{formatDate(movie.releaseDate)}</span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold mb-2">Overview</h2>
            <p className="text-gray-700 mb-4">{movie.description || 'No description available.'}</p>
            
            {movie.director && (
              <div className="mb-2">
                <span className="font-semibold">Director:</span> {movie.director}
              </div>
            )}
            
            {movie.cast && (
              <div className="mb-2">
                <span className="font-semibold">Cast:</span> {movie.cast}
              </div>
            )}
            
            {movie.trailerUrl && (
              <div className="mt-6">
                <a
                  href={movie.trailerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Watch Trailer
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsPage;