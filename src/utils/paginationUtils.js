// src/utils/paginationUtils.js
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Utility functions for pagination management
 */

/**
 * Parse pagination parameters from URL search params
 * @param {URLSearchParams} searchParams - URL search parameters
 * @param {Object} defaults - Default values
 * @returns {Object} Parsed pagination parameters
 */
export const parsePaginationParams = (searchParams, defaults = {}) => {
  const defaultValues = {
    page: 0,
    size: 10,
    sortBy: 'id',
    sortOrder: 'asc',
    ...defaults
  };

  return {
    page: parseInt(searchParams.get('page')) || defaultValues.page,
    size: parseInt(searchParams.get('size')) || defaultValues.size,
    sortBy: searchParams.get('sortBy') || defaultValues.sortBy,
    sortOrder: searchParams.get('sortOrder') || defaultValues.sortOrder,
    search: searchParams.get('search') || '',
    genre: searchParams.get('genre') || '',
  };
};

/**
 * Create URL search params from pagination state
 * @param {Object} params - Pagination parameters
 * @param {Object} defaults - Default values to exclude from URL
 * @returns {URLSearchParams} URL search parameters
 */
export const createPaginationParams = (params, defaults = {}) => {
  const defaultValues = {
    page: 0,
    size: 10,
    sortBy: 'id',
    sortOrder: 'asc',
    ...defaults
  };

  const searchParams = new URLSearchParams();

  // Only add non-default values to URL
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== defaultValues[key] && value !== '') {
      searchParams.set(key, value.toString());
    }
  });

  return searchParams;
};

/**
 * Custom hook for managing pagination state with URL synchronization
 * @param {Object} defaultParams - Default pagination parameters
 * @param {Function} onParamsChange - Callback when parameters change
 * @returns {Object} Pagination state and handlers
 */
export const usePaginationState = (defaultParams = {}, onParamsChange) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Parse current params from URL
  const currentParams = parsePaginationParams(searchParams, defaultParams);
  
  // Update URL when params change
  const updateParams = useCallback((newParams) => {
    const updatedParams = { ...currentParams, ...newParams };
    const urlParams = createPaginationParams(updatedParams, defaultParams);
    setSearchParams(urlParams);
    
    if (onParamsChange) {
      onParamsChange(updatedParams);
    }
  }, [currentParams, defaultParams, setSearchParams, onParamsChange]);

  // Individual parameter setters
  const setPage = useCallback((page) => updateParams({ page }), [updateParams]);
  const setSize = useCallback((size) => updateParams({ size, page: 0 }), [updateParams]);
  const setSort = useCallback((sortBy, sortOrder) => updateParams({ sortBy, sortOrder, page: 0 }), [updateParams]);
  const setSearch = useCallback((search) => updateParams({ search, page: 0 }), [updateParams]);
  const setGenre = useCallback((genre) => updateParams({ genre, page: 0 }), [updateParams]);
  
  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
    if (onParamsChange) {
      onParamsChange(defaultParams);
    }
  }, [setSearchParams, onParamsChange, defaultParams]);

  return {
    params: currentParams,
    setPage,
    setSize,
    setSort,
    setSearch,
    setGenre,
    resetFilters,
    updateParams
  };
};

/**
 * Calculate pagination info for display
 * @param {Object} paginationData - Pagination response data
 * @returns {Object} Calculated pagination info
 */
export const calculatePaginationInfo = (paginationData) => {
  if (!paginationData) {
    return {
      startItem: 0,
      endItem: 0,
      totalItems: 0,
      currentPage: 0,
      totalPages: 0,
      hasNext: false,
      hasPrevious: false
    };
  }

  const {
    currentPage = 0,
    pageSize = 10,
    totalElements = 0,
    totalPages = 0,
    hasNext = false,
    hasPrevious = false
  } = paginationData;

  const startItem = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return {
    startItem,
    endItem,
    totalItems: totalElements,
    currentPage,
    totalPages,
    hasNext,
    hasPrevious
  };
};

/**
 * Get visible page numbers for pagination display
 * @param {number} currentPage - Current page (0-based)
 * @param {number} totalPages - Total number of pages
 * @param {number} maxVisible - Maximum visible page numbers
 * @returns {Array<number>} Array of visible page numbers
 */
export const getVisiblePages = (currentPage, totalPages, maxVisible = 5) => {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const halfVisible = Math.floor(maxVisible / 2);
  let start = Math.max(0, currentPage - halfVisible);
  let end = Math.min(totalPages - 1, start + maxVisible - 1);

  // Adjust start if we're near the end
  if (end - start < maxVisible - 1) {
    start = Math.max(0, end - maxVisible + 1);
  }

  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

/**
 * Debounce function for search inputs
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate pagination parameters
 * @param {Object} params - Pagination parameters
 * @returns {Object} Validated parameters
 */
export const validatePaginationParams = (params) => {
  const validated = { ...params };

  // Ensure page is not negative
  if (validated.page < 0) {
    validated.page = 0;
  }

  // Ensure size is within reasonable bounds
  if (validated.size < 1) {
    validated.size = 10;
  } else if (validated.size > 100) {
    validated.size = 100;
  }

  // Validate sort order
  if (!['asc', 'desc'].includes(validated.sortOrder)) {
    validated.sortOrder = 'asc';
  }

  return validated;
};

/**
 * Create a pagination query key for React Query
 * @param {string} baseKey - Base query key
 * @param {Object} params - Pagination parameters
 * @returns {Array} Query key array
 */
export const createPaginationQueryKey = (baseKey, params) => {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, value]) => value !== '' && value != null)
  );
  
  return [baseKey, cleanParams];
};

export default {
  parsePaginationParams,
  createPaginationParams,
  usePaginationState,
  calculatePaginationInfo,
  getVisiblePages,
  debounce,
  validatePaginationParams,
  createPaginationQueryKey
};