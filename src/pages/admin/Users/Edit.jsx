// src/pages/admin/Users/Edit.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const EditUserPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [passwordSection, setPasswordSection] = useState(false);
  
  // Form handling
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm();
  
  // Watch password for confirmation validation
  const password = watch('password');
  
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
          role: 'ROLE_USER'
        };
        
        setUser(userData);
        
        // Set form default values
        Object.entries(userData).forEach(([key, value]) => {
          if (key !== 'id') {
            setValue(key, value);
          }
        });
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load user details');
        setIsLoading(false);
      }
    };
    
    fetchUser();
  }, [id, setValue]);
  
  // Mock API function to update a user
  const updateUser = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { id, ...data };
  };
  
  // Form submission handler
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      // Remove confirm password before sending to API
      const { confirmPassword, ...userData } = data;
      
      // Only include password if the password section is open and a password was entered
      if (!passwordSection || !userData.password) {
        delete userData.password;
      }
      
      // Update user
      await updateUser(userData);
      
      showSuccess('User updated successfully');
      navigate(`/admin/users/${id}`);
    } catch (error) {
      showError(error.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Toggle password section
  const togglePasswordSection = () => {
    setPasswordSection(!passwordSection);
    if (!passwordSection) {
      // Reset password fields when opening section
      setValue('password', '');
      setValue('confirmPassword', '');
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
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column - Account details */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              
              {/* Username */}
              <Input
                id="username"
                label="Username"
                placeholder="Enter username"
                error={errors.username?.message}
                required
                {...register('username', { 
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters'
                  },
                  maxLength: {
                    value: 20,
                    message: 'Username cannot exceed 20 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9_]+$/,
                    message: 'Username can only contain letters, numbers and underscores'
                  }
                })}
              />
              
              {/* Email */}
              <Input
                id="email"
                type="email"
                label="Email"
                placeholder="Enter email address"
                error={errors.email?.message}
                required
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              
              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  {...register('role', { required: 'Role is required' })}
                >
                  <option value="ROLE_USER">User</option>
                  <option value="ROLE_MANAGER">Manager</option>
                  <option value="ROLE_ADMIN">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
              
              {/* Password toggle button */}
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={togglePasswordSection}
                >
                  {passwordSection ? 'Cancel Password Change' : 'Change Password'}
                </Button>
              </div>
              
              {/* Password section (conditionally shown) */}
              {passwordSection && (
                <div className="space-y-6 mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-900">Change Password</h3>
                  
                  {/* Password */}
                  <Input
                    id="password"
                    type="password"
                    label="New Password"
                    placeholder="Enter new password"
                    error={errors.password?.message}
                    {...register('password', { 
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      },
                      maxLength: {
                        value: 40,
                        message: 'Password cannot exceed 40 characters'
                      }
                    })}
                  />
                  
                  {/* Confirm Password */}
                  <Input
                    id="confirmPassword"
                    type="password"
                    label="Confirm New Password"
                    placeholder="Confirm new password"
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword', { 
                      validate: value => 
                        !password || value === password || 'The passwords do not match'
                    })}
                  />
                </div>
              )}
            </div>
            
            {/* Right column - Personal details */}
            <div className="space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              
              {/* First Name */}
              <Input
                id="firstName"
                label="First Name"
                placeholder="Enter first name"
                error={errors.firstName?.message}
                required
                {...register('firstName', { 
                  required: 'First name is required',
                  maxLength: {
                    value: 50,
                    message: 'First name cannot exceed 50 characters'
                  }
                })}
              />
              
              {/* Last Name */}
              <Input
                id="lastName"
                label="Last Name"
                placeholder="Enter last name"
                error={errors.lastName?.message}
                required
                {...register('lastName', { 
                  required: 'Last name is required',
                  maxLength: {
                    value: 50,
                    message: 'Last name cannot exceed 50 characters'
                  }
                })}
              />
              
              {/* Phone Number */}
              <Input
                id="phoneNumber"
                label="Phone Number"
                placeholder="Enter phone number"
                error={errors.phoneNumber?.message}
                {...register('phoneNumber', {
                  maxLength: {
                    value: 20,
                    message: 'Phone number cannot exceed 20 characters'
                  }
                })}
              />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isSubmitting}
            >
              Update User
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;