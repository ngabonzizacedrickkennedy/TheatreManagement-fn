// src/pages/admin/Theatres/View.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import Tabs from '@components/common/Tabs';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingStorefrontIcon,
  PlusIcon,
  CalendarIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const ViewTheatrePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [theatre, setTheatre] = useState(null);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Mock API function to get theatre details
  useEffect(() => {
    const fetchTheatre = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const theatreData = {
          id,
          name: 'Downtown Cinema',
          address: '123 Main Street, Anytown, ST 12345',
          phoneNumber: '+1 555-123-4567',
          email: 'downtown@theatrecinema.com',
          description: 'Our flagship theatre located in the heart of downtown with 8 screens including IMAX and 4DX. The cinema features a full-service concession stand, arcade, and lounge area.',
          totalScreens: 8,
          imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c',
          screens: [
            { number: 1, capacity: 120, format: 'STANDARD' },
            { number: 2, capacity: 120, format: 'STANDARD' },
            { number: 3, capacity: 80, format: 'STANDARD' },
            { number: 4, capacity: 80, format: 'STANDARD' },
            { number: 5, capacity: 150, format: 'IMAX' },
            { number: 6, capacity: 60, format: 'VIP' },
            { number: 7, capacity: 60, format: 'VIP' },
            { number: 8, capacity: 100, format: '4DX' }
          ],
          upcomingScreenings: 15
        };
        
        setTheatre(theatreData);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load theatre details');
        setIsLoading(false);
      }
    };
    
    fetchTheatre();
  }, [id]);
  
  // Mock API function to delete a theatre
  const deleteTheatre = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  };
  
  // Handle theatre deletion
  const handleDeleteTheatre = async () => {
    setIsDeleting(true);
    
    // Show confirmation dialog
    if (window.confirm('Are you sure you want to delete this theatre? This will also delete all associated screens, seats, screenings, and bookings.')) {
      try {
        await deleteTheatre();
        showSuccess('Theatre deleted successfully');
        navigate('/admin/theatres');
      } catch (err) {
        showError(err.message || 'Failed to delete theatre');
        setIsDeleting(false);
      }
    } else {
      setIsDeleting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error || !theatre) {
    return <NotFound message="Theatre not found" />;
  }
  
  // Define tabs for the theatre details
  const tabs = [
    {
      label: 'Overview',
      content: (
        <div className="py-4">
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600">{theatre.description || 'No description available.'}</p>
            </div>
            
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="text-sm text-gray-900">{theatre.address}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Phone</dt>
                <dd className="text-sm text-gray-900">{theatre.phoneNumber}</dd>
                
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="text-sm text-gray-900">{theatre.email}</dd>
              </dl>
            </div>
          </div>
        </div>
      )
    },
    {
      label: `Screens (${theatre.totalScreens})`,
      content: (
        <div className="py-4">
          <div className="overflow-hidden border border-gray-200 sm:rounded-lg mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Screen Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {theatre.screens.map(screen => (
                  <tr key={screen.number}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Screen {screen.number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {screen.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {screen.capacity} seats
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/admin/theatres/${id}/screens/${screen.number}/seats`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                        >
                          Manage Seats
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-center">
            <Link to={`/admin/theatres/${id}/seats`}>
              <Button 
                variant="primary"
                icon={<PlusIcon className="h-5 w-5 mr-2" />}
              >
                Manage All Seats
              </Button>
            </Link>
          </div>
        </div>
      )
    },
    {
      label: `Screenings (${theatre.upcomingScreenings})`,
      content: (
        <div className="py-4">
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">View Screenings</h3>
            <p className="mt-1 text-sm text-gray-500">
              {theatre.upcomingScreenings > 0
                ? `There are ${theatre.upcomingScreenings} upcoming screenings scheduled for this theatre.`
                : 'There are no upcoming screenings at this theatre.'
              }
            </p>
            <div className="mt-6 flex justify-center space-x-4">
              <Link to={`/admin/screenings?theatreId=${id}`}>
                <Button 
                  variant="outline"
                  icon={<CalendarIcon className="h-5 w-5 mr-2" />}
                >
                  View All Screenings
                </Button>
              </Link>
              <Link to={`/admin/screenings/create?theatreId=${id}`}>
                <Button 
                  variant="primary"
                  icon={<PlusIcon className="h-5 w-5 mr-2" />}
                >
                  Add Screening
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
  ];
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/theatres')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Theatres
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Theatre Details</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header section with theatre image and basic details */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Theatre image */}
            <div className="flex-shrink-0 h-44 w-60 bg-gray-200 rounded-lg overflow-hidden">
              {theatre.imageUrl ? (
                <img 
                  src={theatre.imageUrl} 
                  alt={theatre.name} 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/path/to/placeholder-image.jpg';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <BuildingStorefrontIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Theatre info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{theatre.name}</h2>
                  <p className="text-gray-500 flex items-center mt-1">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {theatre.address}
                  </p>
                </div>
                
                {/* Action buttons */}
                <div className="flex space-x-3 mt-4 md:mt-0">
                  <Link to={`/admin/theatres/${id}/edit`}>
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
                    loading={isDeleting}
                    onClick={handleDeleteTheatre}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              
              {/* Additional meta */}
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <span className="text-gray-500 mr-2">Total Screens:</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {theatre.totalScreens}
                  </span>
                </div>
                
                <div className="flex items-start text-sm">
                  <PhoneIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <span className="text-gray-900">{theatre.phoneNumber}</span>
                  </div>
                </div>
                
                <div className="flex items-start text-sm">
                  <EnvelopeIcon className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <span className="text-gray-900">{theatre.email}</span>
                  </div>
                </div>
              </div>
              
              {/* Quick actions */}
              <div className="mt-6 space-x-3">
                <Link to={`/admin/screenings/create?theatreId=${id}`}>
                  <Button 
                    variant="primary" 
                    size="sm"
                    icon={<PlusIcon className="h-5 w-5 mr-1" />}
                  >
                    Add Screening
                  </Button>
                </Link>
                
                <Link to={`/admin/theatres/${id}/seats`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    icon={<TicketIcon className="h-5 w-5 mr-1" />}
                  >
                    Manage Seats
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs section for details, screens, and screenings */}
        <div className="p-6">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
};

export default ViewTheatrePage;