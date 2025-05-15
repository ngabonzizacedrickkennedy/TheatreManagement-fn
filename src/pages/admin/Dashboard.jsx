// src/pages/admin/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useMovies } from '@hooks/useMovies';
import { useBookings } from '@hooks/useBookings';
import { useScreenings } from '@hooks/useScreenings';
import { formatCurrency, formatDate } from '@utils/formatUtils';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import { 
  FilmIcon, 
  TicketIcon, 
  UserIcon, 
  BuildingStorefrontIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalTheatres: 0,
    totalRevenue: 0,
    recentBookings: [],
    popularMovies: [],
    upcomingScreenings: [],
    bookingStatusData: [],
    revenueData: [],
    bookingsByMovieData: []
  });
  
  // Hooks for fetching data
  const { useGetAllMovies } = useMovies();
  const { useGetAllBookings } = useBookings();
  const { useGetUpcomingScreenings } = useScreenings();
  
  // Get movies
  const { 
    data: movies = [], 
    isLoading: isLoadingMovies 
  } = useGetAllMovies();
  
  // Get bookings
  const { 
    data: bookings = [], 
    isLoading: isLoadingBookings 
  } = useGetAllBookings();
  
  // Get upcoming screenings
  const { 
    data: screenings = [], 
    isLoading: isLoadingScreenings 
  } = useGetUpcomingScreenings();
  
  // Mock function to get users (for the admin dashboard)
  const fetchUsers = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, username: 'johndoe', email: 'john@example.com' },
      { id: 2, username: 'janedoe', email: 'jane@example.com' },
      { id: 3, username: 'bobsmith', email: 'bob@example.com' },
      { id: 4, username: 'alicejones', email: 'alice@example.com' },
      { id: 5, username: 'michaelb', email: 'michael@example.com' }
    ];
  };
  
  // Mock function to get theatres
  const fetchTheatres = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return [
      { id: 1, name: 'Downtown Cinema', location: 'City Center' },
      { id: 2, name: 'Westside Theatre', location: 'West District' },
      { id: 3, name: 'North Plaza Cinema', location: 'North Plaza' }
    ];
  };
  
  // Prepare dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (isLoadingMovies || isLoadingBookings || isLoadingScreenings) {
          return;
        }
        
        // Get users and theatres
        const users = await fetchUsers();
        const theatres = await fetchTheatres();
        
        // Calculate total revenue
        const totalRevenue = bookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
        
        // Get recent bookings
        const recentBookings = [...bookings]
          .sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime))
          .slice(0, 5);
        
        // Get booking status data for pie chart
        const statusCounts = {
          COMPLETED: 0,
          PENDING: 0,
          CANCELLED: 0,
          REFUNDED: 0
        };
        
        bookings.forEach(booking => {
          if (statusCounts[booking.paymentStatus] !== undefined) {
            statusCounts[booking.paymentStatus]++;
          }
        });
        
        const bookingStatusData = Object.entries(statusCounts).map(([name, value]) => ({
          name, value
        }));
        
        // Generate revenue data for the last 7 days
        const revenueData = [];
        const currentDate = new Date();
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i);
          
          const dayBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.bookingTime);
            return bookingDate.toDateString() === date.toDateString();
          });
          
          const dayRevenue = dayBookings.reduce((sum, booking) => sum + booking.totalAmount, 0);
          
          revenueData.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            revenue: dayRevenue
          });
        }
        
        // Calculate bookings by movie
        const bookingsByMovie = {};
        
        bookings.forEach(booking => {
          if (!bookingsByMovie[booking.movieTitle]) {
            bookingsByMovie[booking.movieTitle] = 0;
          }
          bookingsByMovie[booking.movieTitle]++;
        });
        
        const bookingsByMovieData = Object.entries(bookingsByMovie)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);
        
        // Get popular movies
        const popularMovies = [...movies]
          .sort((a, b) => {
            const aBookings = bookingsByMovie[a.title] || 0;
            const bBookings = bookingsByMovie[b.title] || 0;
            return bBookings - aBookings;
          })
          .slice(0, 5);
        
        // Get upcoming screenings
        const upcomingScreenings = Object.values(screenings)
          .flat()
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
          .slice(0, 5);
        
        // Set stats
        setStats({
          totalMovies: movies.length,
          totalBookings: bookings.length,
          totalUsers: users.length,
          totalTheatres: theatres.length,
          totalRevenue,
          recentBookings,
          popularMovies,
          upcomingScreenings,
          bookingStatusData,
          revenueData,
          bookingsByMovieData
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setIsLoading(false);
      }
    };
    
    loadDashboardData();
  }, [isLoadingMovies, isLoadingBookings, isLoadingScreenings, movies, bookings, screenings]);
  
  // Define colors for charts
  const COLORS = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#6366f1'];
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {formatDate(new Date(), { dateStyle: 'full' })}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <FilmIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Movies</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalMovies}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/movies" className="text-sm text-primary-600 hover:text-primary-700">
              View all movies
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TicketIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBookings}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/bookings" className="text-sm text-primary-600 hover:text-primary-700">
              View all bookings
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
              <UserIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700">
              View all users
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <BuildingStorefrontIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Theatres</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTheatres}</p>
            </div>
          </div>
          <div className="mt-4">
            <Link to="/admin/theatres" className="text-sm text-primary-600 hover:text-primary-700">
              View all theatres
            </Link>
          </div>
        </div>
      </div>

      {/* Revenue & Status Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Revenue (Last 7 Days)</h2>
            <div className="flex items-center">
              <div className="flex items-center mx-2">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 text-sm font-medium">
                  {formatCurrency(stats.totalRevenue)}
                </span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={stats.revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip formatter={(value) => [`${formatCurrency(value)}`, 'Revenue']} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563eb"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Status Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Booking Status</h2>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-yellow-500 mr-1" />
              <span className="text-yellow-500 text-sm font-medium">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.bookingStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {stats.bookingStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Bookings']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Popular Movies & Bookings by Movie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Popular Movies */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Popular Movies</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.popularMovies.length > 0 ? (
              stats.popularMovies.map((movie, index) => (
                <div key={movie.id} className="p-6 flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                    <span className="font-semibold">{index + 1}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-semibold text-gray-900">{movie.title}</h3>
                    <p className="text-sm text-gray-500">
                      {movie.genre} • {movie.rating}
                    </p>
                  </div>
                  <div className="ml-4">
                    <Link to={`/admin/movies/${movie.id}`}>
                      <Button variant="outline" size="sm">View</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No movie data available</div>
            )}
          </div>
        </div>

        {/* Bookings by Movie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Bookings by Movie</h2>
            <div className="flex items-center">
              <CalculatorIcon className="h-5 w-5 text-indigo-500 mr-1" />
              <span className="text-indigo-500 text-sm font-medium">
                Total: {stats.totalBookings}
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.bookingsByMovieData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }}
                  width={150}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Bookings" fill="#2563eb">
                  {stats.bookingsByMovieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Upcoming Screenings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentBookings.length > 0 ? (
              stats.recentBookings.map((booking) => (
                <div key={booking.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">{booking.movieTitle}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Booked by: {booking.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(booking.bookingTime)}
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
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link to={`/admin/bookings/${booking.id}`}>
                      <Button variant="outline" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No recent bookings</div>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <Link to="/admin/bookings" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all bookings
            </Link>
          </div>
        </div>

        {/* Upcoming Screenings */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Screenings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.upcomingScreenings.length > 0 ? (
              stats.upcomingScreenings.map((screening) => (
                <div key={screening.id} className="p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                        <CalendarIcon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-base font-semibold text-gray-900">{screening.movieTitle}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {screening.theatreName} • Screen {screening.screenNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(screening.startTime)}
                      </p>
                      <div className="mt-3">
                        <Link to={`/admin/screenings/${screening.id}`}>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No upcoming screenings</div>
            )}
          </div>
          <div className="p-4 bg-gray-50 border-t">
            <Link to="/admin/screenings" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all screenings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;