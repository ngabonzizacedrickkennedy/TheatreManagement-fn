// src/pages/admin/screenings/View.jsx
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useScreenings } from '@hooks/useScreenings';
import { useBookings } from '@hooks/useBookings';
import { useToast } from '@contexts/ToastContext';
import { formatDate, formatEnumValue, formatCurrency } from '@utils/formatUtils';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  TicketIcon,
  ClockIcon,
  FilmIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

const ViewScreeningPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get screening details
  const { useGetScreening, useDeleteScreening } = useScreenings();
  const {
    data: screeningData,
    isLoading: isLoadingScreening,
    error: screeningError
  } = useGetScreening(id);
  
  // Get booked seats for the screening
  const { useGetBookedSeats } = useBookings();
  const {
    data: bookedSeats = [],
    isLoading: isLoadingSeats
  } = useGetBookedSeats(id);
  
  // Delete screening mutation
  const { mutate: deleteScreening, isPending: isPendingDelete } = useDeleteScreening({
    onSuccess: () => {
      showSuccess('Screening deleted successfully');
      navigate('/admin/screenings');
    },
    onError: (error) => {
      showError(error.message || 'Failed to delete screening');
      setIsDeleting(false);
    }
  });
  
  // Handle screening deletion
  const handleDeleteScreening = () => {
    setIsDeleting(true);
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this screening? This cannot be undone.')) {
      deleteScreening(id);
    } else {
      setIsDeleting(false);
    }
  };
  
  // Loading state
  if (isLoadingScreening || isLoadingSeats) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (screeningError || !screeningData) {
    return <NotFound message="Screening not found" />;
  }
  
  // Destructure screening data for easier access
  const screening = screeningData;
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/screenings')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Screenings
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Screening Details</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{screening.movieTitle}</h2>
              <p className="text-gray-600">{formatDate(screening.startTime)}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Link to={`/admin/screenings/${id}/edit`}>
                <Button 
                  variant="outline" 
                  size="sm"
                  icon={<PencilSquareIcon className="h-5 w-5 mr-1" />}
                >
                  Edit
                </Button>
              </Link>
              <Button 
                variant="danger" 
                size="sm"
                icon={<TrashIcon className="h-5 w-5 mr-1" />}
                loading={isDeleting || isPendingDelete}
                onClick={handleDeleteScreening}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
        
        {/* Screening details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Screening Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <FilmIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Movie</h4>
                    <p className="text-gray-600">{screening.movieTitle}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <Link to={`/admin/movies/${screening.movieId}`} className="text-primary-600 hover:text-primary-500">
                        View Movie Details
                      </Link>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <BuildingStorefrontIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Theatre</h4>
                    <p className="text-gray-600">{screening.theatreName}</p>
                    <p className="text-sm text-gray-500">Screen {screening.screenNumber}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      <Link to={`/admin/theatres/${screening.theatreId}`} className="text-primary-600 hover:text-primary-500">
                        View Theatre Details
                      </Link>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Date & Time</h4>
                    <p className="text-gray-600">{formatDate(screening.startTime)}</p>
                    {screening.endTime && (
                      <p className="text-sm text-gray-500">
                        Ends at: {formatDate(screening.endTime, { dateStyle: undefined, timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start">
                  <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Pricing</h4>
                    <p className="text-gray-600">Base Price: {formatCurrency(screening.basePrice)}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="h-5 w-5 text-gray-400 mt-0.5 mr-3 flex items-center justify-center">
                    <span className="text-xs font-bold">HD</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Format</h4>
                    <p className="text-gray-600">{formatEnumValue(screening.format)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right column */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Seats & Bookings</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Booked Seats</h4>
                  
                  {bookedSeats.length > 0 ? (
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {bookedSeats.map(seat => (
                          <div key={seat} className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium">
                            {seat}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500">{bookedSeats.length} seats booked</p>
                    </div>
                  ) : (
                    <p className="text-gray-500">No seats booked yet.</p>
                  )}
                </div>
                
                <div className="mt-6">
                  <Link to={`/admin/screenings/${id}/bookings`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<TicketIcon className="h-5 w-5 mr-1" />}
                      className="w-full sm:w-auto"
                    >
                      View Bookings
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Additional information */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Actions</h3>
                
                <div className="space-y-3">
                  <Link to={`/admin/screenings/${id}/edit`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<PencilSquareIcon className="h-5 w-5 mr-1" />}
                      className="w-full"
                    >
                      Edit Screening
                    </Button>
                  </Link>
                  
                  <Link to={`/admin/screenings/create?movieId=${screening.movieId}&theatreId=${screening.theatreId}`}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      icon={<FilmIcon className="h-5 w-5 mr-1" />}
                      className="w-full"
                    >
                      Create Similar Screening
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewScreeningPage;