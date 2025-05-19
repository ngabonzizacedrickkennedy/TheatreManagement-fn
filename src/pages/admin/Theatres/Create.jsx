import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheatres } from '@hooks/useTheatres';
import { useToast } from '@contexts/ToastContext';
import { useForm } from '@hooks/useForm';
import Button from '@components/common/Button';
import LoadingSpinner from '@components/common/LoadingSpinner';
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';

const CreateTheatrePage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { useCreateTheatre } = useTheatres();
  
  // Form state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  // Form validation rules
  const validationRules = {
    name: { required: true, minLength: 3 },
    address: { required: true },
    phoneNumber: { required: true, pattern: /^\+?[\d\s-()]+$/ },
    email: { required: true, email: true },
    description: { required: true, minLength: 10 },
    totalScreens: { required: true, min: 1, max: 20 }
  };
  
  // Initialize form
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    resetForm
  } = useForm({
    initialValues: {
      name: '',
      address: '',
      phoneNumber: '',
      email: '',
      description: '',
      totalScreens: 1
    },
    validationRules,
    onSubmit: async (values) => {
      try {
        // Create FormData for file upload
        const formData = new FormData();
        Object.keys(values).forEach(key => {
          formData.append(key, values[key]);
        });
        if (imageFile) {
          formData.append('image', imageFile);
        }
        
        // Create theatre
        await createTheatre(formData);
        showSuccess('Theatre created successfully');
        navigate('/admin/theatres');
      } catch (error) {
        showError(error.message || 'Failed to create theatre');
      }
    }
  });
  
  // Create theatre mutation
  const {
    mutate: createTheatre,
    isPending: isCreating
  } = useCreateTheatre();
  
  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      navigate('/admin/theatres');
    }
  };
  
  if (isCreating) {
    return <LoadingSpinner />;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Theatre</h1>
        <Button
          variant="outline"
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* Theatre Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theatre Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="mb-4">
                    <img
                      src={imagePreview}
                      alt="Theatre preview"
                      className="mx-auto h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image"
                      name="image"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>
          </div>
          
          {/* Theatre Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Theatre Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.name && touched.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.name && touched.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          
          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
              </div>
              <textarea
                id="address"
                name="address"
                rows={3}
                value={values.address}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.address && touched.address
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.address && touched.address && (
              <p className="mt-1 text-sm text-red-600">{errors.address}</p>
            )}
          </div>
          
          {/* Phone Number */}
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={values.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.phoneNumber && touched.phoneNumber
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.phoneNumber && touched.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
            )}
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`pl-10 block w-full rounded-md shadow-sm sm:text-sm ${
                  errors.email && touched.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                }`}
              />
            </div>
            {errors.email && touched.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.description && touched.description
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }`}
            />
            {errors.description && touched.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>
          
          {/* Total Screens */}
          <div>
            <label htmlFor="totalScreens" className="block text-sm font-medium text-gray-700 mb-1">
              Total Screens
            </label>
            <input
              type="number"
              id="totalScreens"
              name="totalScreens"
              min="1"
              max="20"
              value={values.totalScreens}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full rounded-md shadow-sm sm:text-sm ${
                errors.totalScreens && touched.totalScreens
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
              }`}
            />
            {errors.totalScreens && touched.totalScreens && (
              <p className="mt-1 text-sm text-red-600">{errors.totalScreens}</p>
            )}
          </div>
        </div>
        
        {/* Form actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || isCreating}
          >
            Create Theatre
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTheatrePage; 