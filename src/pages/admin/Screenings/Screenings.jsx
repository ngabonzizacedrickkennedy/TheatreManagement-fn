// src/pages/admin/Screenings/Screenings.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useScreenings } from '@hooks/useScreenings';
import { useMovies } from '@hooks/useMovies';
import { useGetTheatres } from '@hooks/useTheatres';  // Import theatres hook directly
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatEnumValue, formatCurrency } from '@utils/formatUtils';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  TrashIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  FilmIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';

const ScreeningsPage = () => {
  const { showSuccess, showError } = useToast();
  
  // State for search, filters, and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedTheatreId, setSelectedTheatreId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [sortBy, setSortBy] = useState('startTime');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Get all theatres for filter dropdown
  const { data: theatresData = [], isLoading: isLoadingTheatres } = useGetTheatres();
  const theatres = Array.isArray(theatresData) ? theatresData : [];
  
  // Get screenings with optional filters
  const { useGetScreenings, useGetScreeningFormats, useDeleteScreening } = useScreenings();
  const { 
    data: screeningsData = [], 
    isLoading: isLoadingScreenings,
    refetch: refetchScreenings
  } = useGetScreenings({
    movieId: selectedMovieId || undefined,
    theatreId: selectedTheatreId || undefined,
    date: selectedDate || undefined
  });
  
  // Ensure screenings is always an array by checking data structure
  const [screenings, setScreenings] = useState([]);
  
  // Process screenings data when it changes
  useEffect(() => {
    if (screeningsData) {
      // Handle different possible response formats
      if (Array.isArray(screeningsData)) {
        setScreenings(screeningsData);
      } else if (screeningsData && typeof screeningsData === 'object') {
        // If it's an object, check for a screenings property
        if (Array.isArray(screeningsData.screenings)) {
          setScreenings(screeningsData.screenings);
        } else {
          // If no screenings property, try to convert object to array of values
          const extractedScreenings = Object.values(screeningsData).filter(item => item && typeof item === 'object');
          setScreenings(extractedScreenings);
        }
      } else {
        // Fallback to empty array
        setScreenings([]);
      }
    } else {
      setScreenings([]);
    }
  }, [screeningsData]);
  
  // Get screening formats
  const {
    data: formatsData = [],
    isLoading: isLoadingFormats
  } = useGetScreeningFormats();
  const formats = Array.isArray(formatsData) ? formatsData : [];
  
  // Get all movies for filter dropdown
  const { useGetMovies } = useMovies();
  const {
    data: moviesData = [],
    isLoading: isLoadingMovies
  } = useGetMovies();
  const movies = Array.isArray(moviesData) ? moviesData : [];
  
  // Delete screening mutation
  const {
    mutate: deleteScreening,
    isPending: isDeleting
  } = useDeleteScreening({
    onSuccess: () => {
      showSuccess('Screening deleted successfully');
      refetchScreenings();
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete screening');
    }
  });
  
  // Handle screening deletion
  const handleDeleteScreening = (id) => {
    if (window.confirm('Are you sure you want to delete this screening?')) {
      deleteScreening(id);
    }
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle movie filter change
  const handleMovieChange = (e) => {
    setSelectedMovieId(e.target.value);
  };
  
  // Handle theatre filter change
  const handleTheatreChange = (e) => {
    setSelectedTheatreId(e.target.value);
  };
  
  // Handle date filter change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedMovieId('');
    setSelectedTheatreId('');
    setSelectedDate('');
  };
  
  // Filter and sort screenings safely
  const filteredScreenings = screenings
    .filter(screening => {
      if (!screening) return false;
      
      // Safely access properties that might not exist
      const movieTitle = screening.movieTitle || '';
      const theatreName = screening.theatreName || '';
      
      // Search filter for movie title or theatre name
      return searchQuery === '' || 
        movieTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theatreName.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      // Handle null/undefined values safely
      if (!a || !b) return 0;
      
      // Sort by selected field
      let comparison = 0;
      
      switch (sortBy) {
        case 'movieTitle':
          comparison = (a.movieTitle || '').localeCompare(b.movieTitle || '');
          break;
        case 'theatreName':
          comparison = (a.theatreName || '').localeCompare(b.theatreName || '');
          break;
        case 'startTime':
          const aTime = a.startTime ? new Date(a.startTime) : new Date(0);
          const bTime = b.startTime ? new Date(b.startTime) : new Date(0);
          comparison = aTime - bTime;
          break;
        case 'format':
          comparison = (a.format || '').localeCompare(b.format || '');
          break;
        case 'basePrice':
          const aPrice = a.basePrice || 0;
          const bPrice = b.basePrice || 0;
          comparison = aPrice - bPrice;
          break;
        default:
          const aDefaultTime = a.startTime ? new Date(a.startTime) : new Date(0);
          const bDefaultTime = b.startTime ? new Date(b.startTime) : new Date(0);
          comparison = aDefaultTime - bDefaultTime;
      }
      
      // Apply sort order
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  
  // Format current date as YYYY-MM-DD for date input default
  const today = new Date().toISOString().split('T')[0];
  
  // Loading state
  if (isLoadingScreenings || isLoadingFormats || isLoadingMovies || isLoadingTheatres) {
    return <LoadingSpinner />;
  }
  
  // Debug info - this would be removed in production but helps diagnose issues
  console.log('Screenings data structure:', screeningsData);
  console.log('Processed screenings:', screenings);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4 md:mb-0">Screenings</h1>
        <Link to="/admin/screenings/create">
          <Button 
            variant="primary"
            icon={<PlusIcon className="h-5 w-5 mr-2" />}
          >
            Add Screening
          </Button>
        </Link>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="search"
                  type="text"
                  placeholder="Search screenings..."
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Movie filter */}
            <div>
              <label htmlFor="movie" className="block text-sm font-medium text-gray-700 mb-1">
                Movie
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FilmIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="movie"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedMovieId}
                  onChange={handleMovieChange}
                >
                  <option value="">All Movies</option>
                  {movies.map(movie => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Theatre filter */}
            <div>
              <label htmlFor="theatre" className="block text-sm font-medium text-gray-700 mb-1">
                Theatre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  id="theatre"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedTheatreId}
                  onChange={handleTheatreChange}
                >
                  <option value="">All Theatres</option>
                  {theatres.map(theatre => (
                    <option key={theatre.id} value={theatre.id}>
                      {theatre.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Date filter */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="date"
                  type="date"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  value={selectedDate}
                  onChange={handleDateChange}
                  min={today}
                />
              </div>
            </div>
          </div>
          
          {/* Reset filters */}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              disabled={!searchQuery && !selectedMovieId && !selectedTheatreId && !selectedDate}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
      
      {/* Screenings list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredScreenings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Table headers with sort functionality */}
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('movieTitle')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Movie</span>
                      {sortBy === 'movieTitle' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('theatreName')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Theatre</span>
                      {sortBy === 'theatreName' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('startTime')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date & Time</span>
                      {sortBy === 'startTime' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Screen
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('format')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Format</span>
                      {sortBy === 'format' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('basePrice')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Base Price</span>
                      {sortBy === 'basePrice' && (
                        <ArrowsUpDownIcon className={`h-4 w-4 ${sortOrder === 'asc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredScreenings.map(screening => (
                  <tr key={screening.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {screening.movieTitle || 'Unknown Movie'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{screening.theatreName || 'Unknown Theatre'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {screening.startTime ? formatDate(screening.startTime) : 'No date'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {screening.screenNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {screening.format ? formatEnumValue(screening.format) : 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(screening.basePrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/admin/screenings/${screening.id}/bookings`}>
                          <Button variant="ghost" size="sm">
                            Bookings
                          </Button>
                        </Link>
                        <Link to={`/admin/screenings/${screening.id}/edit`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={<PencilSquareIcon className="h-4 w-4" />}
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button 
                          variant="danger" 
                          size="sm"
                          icon={<TrashIcon className="h-4 w-4" />}
                          onClick={() => handleDeleteScreening(screening.id)}
                          loading={isDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No screenings found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedMovieId || selectedTheatreId || selectedDate
                ? 'No screenings match your filters. Try adjusting your search criteria.'
                : 'There are no screenings in the system yet. Add your first screening to get started.'
              }
            </p>
            <Link to="/admin/screenings/create">
              <Button 
                variant="primary"
                icon={<PlusIcon className="h-5 w-5 mr-2" />}
              >
                Add Screening
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScreeningsPage;