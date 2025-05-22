// src/pages/auth/ForgotPassword.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import { AtSymbolIcon, KeyIcon } from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const { requestPasswordReset } = useAuth();
  const { showSuccess, showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showError('Please enter your email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await requestPasswordReset(email);
      
      if (success) {
        setRequestSent(true);
        showSuccess('Password reset email sent. Please check your inbox.');
      } else {
        showError('Failed to send password reset email. Please try again.');
      }
    } catch (error) {
      showError(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If request is sent, show success message
  if (requestSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="rounded-md bg-green-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Email sent</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>A password reset link has been sent to your email address. Please check your inbox and follow the instructions to reset your password.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Link to="/login">
              <Button variant="primary">
                Return to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <KeyIcon className="mx-auto h-16 w-16 text-primary-600" />
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Forgot Password
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm">
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              autoComplete="email"
              startIcon={<AtSymbolIcon className="h-5 w-5 text-gray-400" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-md"
              required
            />
          </div>
          
          <div>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              size="lg"
              loading={isSubmitting}
            >
              Send Reset Link
            </Button>
          </div>
          
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Return to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
