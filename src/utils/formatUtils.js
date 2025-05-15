// src/utils/formatUtils.js

/**
 * Formats a date string according to the specified format
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    const defaultOptions = {
      dateStyle: 'medium',
      timeStyle: 'short'
    };
    
    const formatOptions = { ...defaultOptions, ...options };
    
    try {
      if (!date) return '';
      
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Check if it's a valid date
      if (isNaN(dateObj.getTime())) {
        return '';
      }
      
      return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  /**
   * Format date for display (date only)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  export const formatDateOnly = (date) => {
    return formatDate(date, { 
      dateStyle: 'medium',
      timeStyle: undefined 
    });
  };
  
  /**
   * Format date and time for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date and time
   */
  export const formatDateTime = (date) => {
    return formatDate(date, { 
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };
  
  /**
   * Format time for display (time only)
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted time
   */
  export const formatTimeOnly = (date) => {
    return formatDate(date, { 
      dateStyle: undefined,
      timeStyle: 'short' 
    });
  };
  
  /**
   * Format currency amount
   * @param {number} amount - Amount to format
   * @param {string} [currency='USD'] - Currency code
   * @returns {string} Formatted currency amount
   */
  export const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  /**
   * Convert minutes to hours and minutes
   * @param {number} minutes - Minutes to convert
   * @returns {string} Formatted duration (e.g., "2h 15m")
   */
  export const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return '';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${remainingMinutes}m`;
    }
  };
  
  /**
   * Format enum values for display (replace underscores with spaces, capitalize)
   * @param {string} enumValue - Enum value to format
   * @returns {string} Formatted enum value
   */
  export const formatEnumValue = (enumValue) => {
    if (!enumValue) return '';
    
    return enumValue
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };