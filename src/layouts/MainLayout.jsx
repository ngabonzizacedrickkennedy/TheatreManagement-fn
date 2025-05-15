import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import useResponsive from '@hooks/useResponsive';

// Icons (you can replace these with your preferred icon library)
import { 
  HomeIcon, 
  FilmIcon, 
  TicketIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const { isMobile } = useResponsive();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Handle logout
  const handleLogout = () => {
    logout();
  };
  
  // Navigation items
  const navigationItems = [
    { name: 'Home', to: '/', icon: <HomeIcon className="w-5 h-5" /> },
    { name: 'Movies', to: '/movies', icon: <FilmIcon className="w-5 h-5" /> },
  ];
  
  // User navigation items (when authenticated)
  const userNavigationItems = [
    { name: 'My Bookings', to: '/bookings', icon: <TicketIcon className="w-5 h-5" /> },
    { name: 'Profile', to: '/profile', icon: <UserIcon className="w-5 h-5" /> },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main navigation */}
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="text-2xl font-bold text-primary-600">
                  THMS
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) => 
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive 
                          ? 'border-primary-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    <span className="mr-1">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>
            
            {/* User navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* User navigation */}
                  {userNavigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) => 
                        `inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`
                      }
                    >
                      <span className="mr-1">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}
                  
                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobile && mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) => 
                    `flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                      isActive 
                        ? 'bg-primary-50 border-primary-500 text-primary-700' 
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
            
            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.username}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {userNavigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) => 
                        `flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                          isActive 
                            ? 'bg-primary-50 border-primary-500 text-primary-700' 
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                        }`
                      }
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="space-y-1 px-4">
                  <Link
                    to="/login"
                    className="flex items-center py-2 text-base font-medium text-gray-500 hover:text-gray-700"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center py-2 text-base font-medium text-primary-600 hover:text-primary-700"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </header>
      
      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-200 pt-6">
            <div className="flex justify-center md:justify-start space-x-6 mb-4 md:mb-0">
              <Link to="/" className="text-gray-400 hover:text-gray-500">
                Home
              </Link>
              <Link to="/movies" className="text-gray-400 hover:text-gray-500">
                Movies
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-gray-500">
                About
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-gray-500">
                Contact
              </Link>
            </div>
            <div className="text-center md:text-right text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Theatre Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;