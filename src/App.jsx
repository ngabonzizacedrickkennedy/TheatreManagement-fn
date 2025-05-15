import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AuthProvider } from '@contexts/AuthContext';
import { ToastProvider } from '@contexts/ToastContext';

import MainLayout from '@layouts/MainLayout';
import AdminLayout from '@layouts/AdminLayout';
import ProtectedRoute from '@components/routing/ProtectedRoute';
import RoleBasedRoute from '@components/routing/RoleBasedRoute';

// Public Pages
import Home from '@pages/public/Home';
import MoviesPage from '@pages/public/Movies';
import MovieDetailsPage from '@pages/public/MovieDetails';
import LoginPage from '@pages/auth/Login';
import RegisterPage from '@pages/auth/Register';
import NotFoundPage from '@pages/public/NotFound';

// User Pages
import ProfilePage from '@pages/user/Profile';
import BookingsPage from '@pages/user/Bookings';
import BookingDetailsPage from '@pages/user/BookingDetails';
import SeatSelectionPage from '@pages/user/SeatSelection';
import CheckoutPage from '@pages/user/Checkout';

// Admin Pages
import AdminDashboardPage from '@pages/admin/Dashboard';
import AdminMoviesPage from '@pages/admin/Movies';
import AdminTheatresPage from '@pages/admin/Theatres';
import AdminScreeningsPage from '@pages/admin/Screenings';
import AdminBookingsPage from '@pages/admin/Bookings';
import AdminUsersPage from '@pages/admin/Users';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Create router
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // Public routes
      { index: true, element: <Home /> },
      { path: 'movies', element: <MoviesPage /> },
      { path: 'movies/:id', element: <MovieDetailsPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      
      // Protected user routes
      { 
        path: 'profile', 
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )
      },
      { 
        path: 'bookings', 
        element: (
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        )
      },
      { 
        path: 'bookings/:id', 
        element: (
          <ProtectedRoute>
            <BookingDetailsPage />
          </ProtectedRoute>
        )
      },
      { 
        path: 'screening/:id/seats', 
        element: (
          <ProtectedRoute>
            <SeatSelectionPage />
          </ProtectedRoute>
        )
      },
      { 
        path: 'checkout/:screeningId', 
        element: (
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        )
      }
    ]
  },
  // Admin routes
  {
    path: '/admin',
    element: (
      <RoleBasedRoute roles={['ROLE_ADMIN', 'ROLE_MANAGER']}>
        <AdminLayout />
      </RoleBasedRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'movies', element: <AdminMoviesPage /> },
      { path: 'theatres', element: <AdminTheatresPage /> },
      { path: 'screenings', element: <AdminScreeningsPage /> },
      { path: 'bookings', element: <AdminBookingsPage /> },
      { 
        path: 'users', 
        element: (
          <RoleBasedRoute roles={['ROLE_ADMIN']}>
            <AdminUsersPage />
          </RoleBasedRoute>
        )
      }
    ]
  },
  // Fallback route
  {
    path: '*',
    element: <NotFoundPage />
  }
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
      {/* Only show React Query Devtools in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;