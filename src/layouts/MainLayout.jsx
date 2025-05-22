import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import useResponsive from '@hooks/useResponsive';
import GlobalSearch from '@components/common/GlobalSearch';

// Icons
import { 
  HomeIcon, 
  FilmIcon, 
  TicketIcon, 
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  InformationCircleIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const { isAuthenticated, user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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

  // Handle search navigation
  const handleSearchNavigate = (path) => {
    navigate(path);
    setMobileMenuOpen(false); // Close mobile menu if open
  };
  
  // Navigation items
  const navigationItems = [
    { name: 'Home', to: '/', icon: <HomeIcon className="w-5 h-5" /> },
    { name: 'Movies', to: '/movies', icon: <FilmIcon className="w-5 h-5" /> },
    { name: 'About', to: '/about', icon: <InformationCircleIcon className="w-5 h-5" /> },
    { name: 'Contact', to: '/contact', icon: <PhoneIcon className="w-5 h-5" /> },
  ];
  
  // User navigation items (when authenticated)
  const userNavigationItems = [
    { name: 'My Bookings', to: '/bookings', icon: <TicketIcon className="w-5 h-5" /> },
    { name: 'Profile', to: '/profile', icon: <UserIcon className="w-5 h-5" /> },
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo and main navigation */}
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <FilmIcon className="h-8 w-8 text-primary-600" />
                  <span className="text-2xl font-bold text-primary-600">THMS</span>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    className={({ isActive }) => 
                      `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 ${
                        isActive 
                          ? 'border-primary-500 text-gray-900' 
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`
                    }
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </NavLink>
                ))}
              </nav>
            </div>

            {/* Global Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <GlobalSearch
                userRole={user?.role}
                onNavigate={handleSearchNavigate}
                className="w-full"
              />
            </div>
            
            {/* User navigation */}
            <div className="hidden md:ml-6 md:flex md:items-center">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {/* Admin Link */}
                  {hasRole(['ROLE_ADMIN', 'ROLE_MANAGER']) && (
                    <Link
                      to="/admin"
                      className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                    >
                      Admin Panel
                    </Link>
                  )}

                  {/* User navigation */}
                  {userNavigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) => 
                        `inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
                          isActive 
                            ? 'bg-primary-50 text-primary-700' 
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`
                      }
                    >
                      <span className="mr-2">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}
                  
                  {/* User Menu Dropdown */}
                  <div className="relative ml-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium text-sm">
                        {user?.firstName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="ml-2 inline-flex items-center px-3 py-1 border border-transparent rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
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
          <div className="md:hidden border-t border-gray-200">
            {/* Mobile Search */}
            <div className="px-4 py-3 border-b border-gray-200">
              <GlobalSearch
                userRole={user?.role}
                onNavigate={handleSearchNavigate}
                onClose={() => setMobileMenuOpen(false)}
                className="w-full"
              />
            </div>

            {/* Mobile Navigation */}
            <div className="pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) => 
                    `flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                      isActive 
                        ? 'bg-primary-50 border-primary-500 text-primary-700' 
                        : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                    }`
                  }
                >
                  <span className="mr-3">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </div>
            
            {isAuthenticated ? (
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                      {user?.firstName?.charAt(0) || user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.firstName ? `${user.firstName} ${user.lastName}` : user?.username}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {/* Admin Link for Mobile */}
                  {hasRole(['ROLE_ADMIN', 'ROLE_MANAGER']) && (
                    <Link
                      to="/admin"
                      className="flex items-center pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-primary-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700"
                    >
                      Admin Panel
                    </Link>
                  )}

                  {userNavigationItems.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      className={({ isActive }) => 
                        `flex items-center pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 ${
                          isActive 
                            ? 'bg-primary-50 border-primary-500 text-primary-700' 
                            : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                        }`
                      }
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </NavLink>
                  ))}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 transition-colors duration-200"
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
                    className="flex items-center py-2 text-base font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center py-2 text-base font-medium text-primary-600 hover:text-primary-700 transition-colors duration-200"
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
        <Outlet />
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex justify-center md:justify-start space-x-6 mb-4 md:mb-0">
              <Link to="/" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                Home
              </Link>
              <Link to="/movies" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                Movies
              </Link>
              <Link to="/about" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
                About
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-gray-500 transition-colors duration-200">
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
