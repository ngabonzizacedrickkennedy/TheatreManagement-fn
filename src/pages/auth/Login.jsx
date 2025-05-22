// src/pages/auth/Login.jsx - Updated with 2FA support
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { AtSymbolIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initiateLogin, isAuthenticated, loading, requiresTwoFactor } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get form utilities from react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors }
  } = useForm();
  
  // If already authenticated, redirect to home or the page they were trying to access
  useEffect(() => {
    if (isAuthenticated && !loading) {
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    }
    
    // If 2FA is required, redirect to the 2FA page
    if (requiresTwoFactor && !loading) {
      navigate('/two-factor-auth', { 
        state: { from: location.state?.from || '/' } 
      });
    }
  }, [isAuthenticated, loading, requiresTwoFactor, navigate, location]);
  
  // Handle form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    
    try {
      const result = await initiateLogin(data.username, data.password);
      
      if (result.success) {
        if (result.requires2FA) {
          // Redirect to 2FA page will happen in the useEffect hook above
          showSuccess('Please enter the verification code sent to your email.');
        } else {
          // Already logged in, redirect will happen in the useEffect hook above
          showSuccess('Login successful!');
        }
      } else {
        // Login failed
        showError('Invalid username or password.');
      }
    } catch (error) {
      showError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If already authenticated or requires 2FA and not loading, don't render the form
  if ((isAuthenticated || requiresTwoFactor) && !loading) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
              create a new account
            </Link>
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Username"
              autoComplete="username"
              startIcon={<AtSymbolIcon className="h-5 w-5 text-gray-400" />}
              className="rounded-t-md rounded-b-none"
              required
              error={errors.username?.message}
              {...register('username', { 
                required: 'Username is required'
              })}
            />
            
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              startIcon={<LockClosedIcon className="h-5 w-5 text-gray-400" />}
              className="rounded-t-none rounded-b-md"
              required
              error={errors.password?.message}
              {...register('password', { 
                required: 'Password is required'
              })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>
            
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-primary-600 hover:text-primary-500">
                Forgot your password?
              </Link>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
            >
              Sign in
            </Button>
          </div>
        </form>
        
        {/* Demo credentials notice */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Demo Credentials</span>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-center text-sm text-gray-500">
              Username: <span className="font-medium">demo</span> | Password: <span className="font-medium">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;