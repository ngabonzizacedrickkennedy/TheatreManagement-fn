// src/utils/formatUtils.js - Enhanced with currency formatting
/**
 * Format date with various options
 * @param {string|Date} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const defaultOptions = {
    dateStyle: 'medium',
    timeStyle: 'short'
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.DateTimeFormat('en-US', formatOptions).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "2h 30m")
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes <= 0) return '';
  
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
 * Format enum values for display
 * @param {string} value - Enum value (e.g., "ACTION_ADVENTURE")
 * @returns {string} Formatted value (e.g., "Action Adventure")
 */
export const formatEnumValue = (value) => {
  if (!value) return '';
  
  return value
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format currency values
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @param {Object} options - Formatting options
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD', options = {}) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }
  
  const defaultOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('en-US', formatOptions).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${Number(amount).toFixed(2)}`;
  }
};

/**
 * Format numbers with thousand separators
 * @param {number} value - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted number string
 */
export const formatNumber = (value, options = {}) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  
  const defaultOptions = {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  };
  
  const formatOptions = { ...defaultOptions, ...options };
  
  try {
    return new Intl.NumberFormat('en-US', formatOptions).format(value);
  } catch (error) {
    console.error('Number formatting error:', error);
    return value.toString();
  }
};

/**
 * Format percentage values
 * @param {number} value - Value to format as percentage (0-1 or 0-100)
 * @param {boolean} isDecimal - Whether input is decimal (0-1) or percentage (0-100)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, isDecimal = true) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }
  
  const percentValue = isDecimal ? value : value / 100;
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }).format(percentValue);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `${(percentValue * 100).toFixed(1)}%`;
  }
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - Size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Format relative time (time ago)
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  
  // If it's in the future, show as "in X time"
  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return 'in a few seconds';
    if (absDiff < 3600) return `in ${Math.floor(absDiff / 60)} minutes`;
    if (absDiff < 86400) return `in ${Math.floor(absDiff / 3600)} hours`;
    if (absDiff < 2592000) return `in ${Math.floor(absDiff / 86400)} days`;
    return formatDate(dateObj, { dateStyle: 'medium', timeStyle: undefined });
  }
  
  // Past times
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  // For older dates, show the actual date
  return formatDate(dateObj, { dateStyle: 'medium', timeStyle: undefined });
};

/**
 * Format phone number
 * @param {string} phoneNumber - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  
  // Return original if can't format
  return phoneNumber;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text || '';
  
  return text.slice(0, maxLength - suffix.length) + suffix;
};

/**
 * Format address for display
 * @param {Object} address - Address object
 * @param {string} address.street - Street address
 * @param {string} address.city - City
 * @param {string} address.state - State
 * @param {string} address.zipCode - Zip code
 * @param {string} address.country - Country
 * @returns {string} Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';
  
  const parts = [];
  
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.zipCode) parts.push(address.zipCode);
  if (address.country && address.country !== 'USA') parts.push(address.country);
  
  return parts.join(', ');
};

/**
 * Format movie rating for display
 * @param {string} rating - Movie rating (e.g., "PG_13")
 * @returns {string} Formatted rating (e.g., "PG-13")
 */
export const formatMovieRating = (rating) => {
  if (!rating) return '';
  
  return rating.replace(/_/g, '-');
};

/**
 * Format seat identifier
 * @param {string} rowName - Row name (e.g., "A")
 * @param {number} seatNumber - Seat number (e.g., 5)
 * @returns {string} Formatted seat (e.g., "A5")
 */
export const formatSeatId = (rowName, seatNumber) => {
  if (!rowName || !seatNumber) return '';
  
  return `${rowName}${seatNumber}`;
};

/**
 * Format screening time range
 * @param {string|Date} startTime - Start time
 * @param {string|Date} endTime - End time
 * @returns {string} Formatted time range
 */
export const formatTimeRange = (startTime, endTime) => {
  if (!startTime) return '';
  
  const start = formatDate(startTime, { timeStyle: 'short', dateStyle: undefined });
  
  if (!endTime) return start;
  
  const end = formatDate(endTime, { timeStyle: 'short', dateStyle: undefined });
  
  return `${start} - ${end}`;
};

/**
 * Format boolean values for display
 * @param {boolean} value - Boolean value
 * @param {Object} options - Display options
 * @returns {string} Formatted boolean
 */
export const formatBoolean = (value, options = {}) => {
  const {
    trueText = 'Yes',
    falseText = 'No',
    nullText = 'N/A'
  } = options;
  
  if (value === null || value === undefined) return nullText;
  
  return value ? trueText : falseText;
};