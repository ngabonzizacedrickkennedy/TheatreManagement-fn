// src/pages/admin/Users/View.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  TicketIcon
} from '@heroicons/react/24/outline';
import { formatDate } from '@utils/formatUtils';

const ViewUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Mock API function to get user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const userData = {
          id,
          username: 'johndoe',
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1 555-123-4567',
          role: 'ROLE_USER',
          createdAt: '2023-01-15T10:30:00Z'
        };
        
        // Mock bookings for this user
        const userBookings = [
          {
            id: 1,
            bookingNumber: 'BK10012345',
            movieTitle: 'The Matrix Resurrections',
            screeningTime: '2023-03-20T14:30:00Z',
            totalAmount: 35.50,
            paymentStatus: 'COMPLETED'
          },
          {
            id: 2,
            bookingNumber: 'BK10012346',
            movieTitle: 'Spider-Man: No Way Home',
            screeningTime: '2023-03-25T19:00:00Z',
            totalAmount: 42.00,
            paymentStatus: 'PENDING'
          }
        ];
        
        setUser(userData);
        setBookings(userBookings);
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load user details');
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [id]);
  
  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showSuccess('User deleted successfully');
      navigate('/admin/users');
    } catch (error) {
      showError(error.message || 'Failed to delete user');
      setIsDeleting(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error || !user) {
    return <NotFound message="User not found" />;
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/users')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Users
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User info card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                  <UserIcon className="h-10 w-10" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-bold text-gray-900">{user.username}</h2>
                  <p className="text-sm text-gray-500">
                    {user.firstName} {user.lastName}
                  </p>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ROLE_ADMIN' 
                      ? 'bg-red-100 text-red-800' 
                      : user.role === 'ROLE_MANAGER'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                  }`}>
                    {user.role.replace('ROLE_', '')}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email</h4>
                    <p className="text-gray-600">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Phone</h4>
                    <p className="text-gray-600">{user.phoneNumber}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Member Since</h4>
                    <p className="text-gray-600">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 flex space-x-3">
                <Link to={`/admin/users/${id}/edit`}>
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
                  onClick={handleDeleteUser}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bookings and activity section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Bookings</h2>
            </div>
            
            <div className="p-6">
              {bookings.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <div key={booking.id} className="py-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">{booking.movieTitle}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            Booking #: {booking.bookingNumber}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.screeningTime)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            booking.paymentStatus === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {booking.paymentStatus}
                          </span>
                          <span className="text-base font-semibold text-gray-900 mt-1">
                            ${booking.totalAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Link to={`/admin/bookings/${booking.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            icon={<TicketIcon className="h-4 w-4 mr-1" />}
                          >
                            View Booking
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This user has not made any bookings yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewUserPage;