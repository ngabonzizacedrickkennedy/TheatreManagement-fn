// src/pages/public/Movies.jsx
import React, { useState } from 'react';
import { useMovies } from '@hooks/useMovies';
import MovieCard from '@components/features/movies/MovieCard';
import GenreFilter from '@components/features/movies/GenreFilter';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import { FilmIcon } from '@heroicons/react/24/outline';

const MoviesPage = () => {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const { useGetMovies, useGetGenres } = useMovies();
  
  // Fetch movies with optional genre filter
  const { 
    data: movies = [], 
    isLoading: isLoadingMovies 
  } = useGetMovies(selectedGenre ? { genre: selectedGenre } : {});

  // Fetch all movie genres
  const { 
    data: genres = [], 
    isLoading: isLoadingGenres 
  } = useGetGenres();

  // Loading state
  if (isLoadingMovies) {
    return <LoadingSpinner size="lg" />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Movies</h1>
        
        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            {!isLoadingGenres && genres.length > 0 && (
              <GenreFilter
                genres={genres}
                selectedGenre={selectedGenre}
                onChange={setSelectedGenre}
              />
            )}
          </div>
          
          {/* Additional filters could go here */}
        </div>
      </div>
      
      {/* Movies grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="py-12 flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
          <FilmIcon className="w-12 h-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No movies found</h3>
          <p className="text-gray-500 mb-4">
            {selectedGenre 
              ? `There are no movies in the ${selectedGenre.replace('_', ' ')} genre.` 
              : 'There are no movies available at this time.'}
          </p>
          {selectedGenre && (
            <Button 
              variant="outline"
              onClick={() => setSelectedGenre(null)}
            >
              Clear Filter
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default MoviesPage;