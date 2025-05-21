// src/pages/admin/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useBookings } from '@hooks/useBookings';
import { useMovies } from '@hooks/useMovies';
import { useGetTheatres } from '@hooks/useTheatres';
import { formatDate, formatCurrency } from '@utils/formatUtils';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  UserIcon,
  FilmIcon,
  BuildingStorefrontIcon,
  TicketIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const [totalStats, setTotalStats] = useState({
    totalUsers: 0,
    totalMovies: 0,
    totalTheatres: 0,
    totalBookings: 0
  });
  const [bookingStats, setBookingStats] = useState({
    completed: 0,
    pending: 0,
    cancelled: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Use hooks for data fetching
  // Get all bookings - Using the correct hook
  const { useGetUserBookings } = useBookings();
  const { 
    data: bookingsData = [], 
    isLoading: isLoadingBookings 
  } = useGetUserBookings();
  
  // Get movies
  const { useGetMovies } = useMovies();
  const { 
    data: moviesData = [], 
    isLoading: isLoadingMovies 
  } = useGetMovies();
  
  // Get theatres
  const { 
    data: theatresData = [], 
    isLoading: isLoadingTheatres 
  } = useGetTheatres();
  
  // Process data when it's loaded
  useEffect(() => {
    if (!isLoadingBookings && !isLoadingMovies && !isLoadingTheatres) {
      // Calculate total stats
      setTotalStats({
        totalUsers: 0, // This would normally come from a users API call
        totalMovies: Array.isArray(moviesData) ? moviesData.length : 0,
        totalTheatres: Array.isArray(theatresData) ? theatresData.length : 0,
        totalBookings: Array.isArray(bookingsData) ? bookingsData.length : 0
      });
      
      // Calculate booking stats
      if (Array.isArray(bookingsData)) {
        const completed = bookingsData.filter(b => b.paymentStatus === 'COMPLETED').length;
        const pending = bookingsData.filter(b => b.paymentStatus === 'PENDING').length;
        const cancelled = bookingsData.filter(b => b.paymentStatus === 'CANCELLED').length;
        
        setBookingStats({
          completed,
          pending,
          cancelled
        });
      }
      
      setIsLoading(false);
    }
  }, [bookingsData, moviesData, theatresData, isLoadingBookings, isLoadingMovies, isLoadingTheatres]);
  
  // Recent bookings (last 5)
  const recentBookings = Array.isArray(bookingsData) 
    ? [...bookingsData].sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime)).slice(0, 5)
    : [];
  
  // Popular movies (films with most bookings)
  const getPopularMovies = () => {
    if (!Array.isArray(bookingsData) || !Array.isArray(moviesData)) return [];
    
    // Count bookings per movie
    const movieBookingCounts = bookingsData.reduce((acc, booking) => {
      const movieId = booking.movieId;
      if (!acc[movieId]) acc[movieId] = 0;
      acc[movieId]++;
      return acc;
    }, {});
    
    // Sort movies by booking count and get top 5
    return moviesData
      .map(movie => ({
        ...movie,
        bookingCount: movieBookingCounts[movie.id] || 0
      }))
      .sort((a, b) => b.bookingCount - a.bookingCount)
      .slice(0, 5);
  };
  
  const popularMovies = getPopularMovies();
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.username || 'Admin'}</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Users</h2>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/users"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all users
            </Link>
          </div>
        </div>
        
        {/* Movies */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <FilmIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Movies</h2>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalMovies}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/movies"
              className="text-sm text-green-600 hover:text-green-700"
            >
              View all movies
            </Link>
          </div>
        </div>
        
        {/* Theatres */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-purple-100 p-3 mr-4">
              <BuildingStorefrontIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Theatres</h2>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalTheatres}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/theatres"
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              View all theatres
            </Link>
          </div>
        </div>
        
        {/* Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <TicketIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">Total Bookings</h2>
              <p className="text-2xl font-bold text-gray-900">{totalStats.totalBookings}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link 
              to="/admin/bookings"
              className="text-sm text-yellow-600 hover:text-yellow-700"
            >
              View all bookings
            </Link>
          </div>
        </div>
      </div>
      
      {/* Booking Status Stats */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Booking Statistics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Completed Bookings */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Completed</h3>
                <p className="text-xl font-bold text-gray-900">{bookingStats.completed}</p>
              </div>
            </div>
          </div>
          
          {/* Pending Bookings */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2 mr-3">
                <ClockIcon className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Pending</h3>
                <p className="text-xl font-bold text-gray-900">{bookingStats.pending}</p>
              </div>
            </div>
          </div>
          
          {/* Cancelled Bookings */}
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-2 mr-3">
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Cancelled</h3>
                <p className="text-xl font-bold text-gray-900">{bookingStats.cancelled}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chart could go here in a real implementation */}
        <div className="h-48 bg-gray-100 rounded-lg mt-6 flex items-center justify-center">
          <ChartBarIcon className="h-8 w-8 text-gray-400" />
          <span className="ml-2 text-gray-500">Booking Trends Chart</span>
        </div>
      </div>
      
      {/* Recent Bookings & Popular Movies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Bookings</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {recentBookings.length > 0 ? recentBookings.map(booking => (
              <div key={booking.id} className="px-6 py-4">
                <div className="flex justify-between mb-1">
                  <h3 className="font-medium text-gray-900">{booking.movieTitle}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    booking.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    booking.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <p>{booking.username} • {formatDate(booking.bookingTime)}</p>
                  <p>{formatCurrency(booking.totalAmount)} • {Array.from(booking.bookedSeats || []).length} seats</p>
                </div>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No recent bookings found.
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link 
              to="/admin/bookings"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all bookings
            </Link>
          </div>
        </div>
        
        {/* Popular Movies */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Popular Movies</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {popularMovies.length > 0 ? popularMovies.map(movie => (
              <div key={movie.id} className="px-6 py-4 flex items-center">
                <div className="flex-shrink-0 h-16 w-12 bg-gray-200 rounded overflow-hidden mr-4">
                  {movie.posterUrl || movie.posterImageUrl ? (
                    <img 
                      src={movie.posterUrl || movie.posterImageUrl} 
                      alt={movie.title} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <FilmIcon className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{movie.title}</h3>
                  <p className="text-sm text-gray-500">
                    {movie.bookingCount} bookings
                  </p>
                </div>
                <div className="ml-4">
                  <Link 
                    to={`/admin/movies/${movie.id}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            )) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No popular movies found.
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <Link 
              to="/admin/movies"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View all movies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;