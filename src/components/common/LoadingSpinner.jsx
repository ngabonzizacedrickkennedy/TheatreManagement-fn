// src/components/common/LoadingSpinner.jsx
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={classNames(
          'animate-spin rounded-full border-t-2 border-b-2 border-primary-600',
          sizeClasses[size],
          className
        )}
      ></div>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string
};

export default LoadingSpinner;