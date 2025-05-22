// src/hooks/useUrlPagination.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parsePaginationParams, createPaginationParams } from '@utils/paginationUtils';

/**
 * Custom hook for managing pagination state synchronized with URL
 * Prevents infinite loops and provides stable state management
 */
export const useUrlPagination = (defaultParams = {}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialMount = useRef(true);
  const isUpdatingFromComponent = useRef(false);
  
  // Default values
  const defaults = {
    page: 0,
    size: 10,
    sortBy: 'title',
    sortOrder: 'asc',
    search: '',
    genre: '',
    ...defaultParams
  };
  
  // Initialize state from URL
  const [params, setParams] = useState(() => {
    return parsePaginationParams(searchParams, defaults);
  });
  
  // Separate state for search input to handle debouncing
  const [searchInput, setSearchInput] = useState(params.search);
  
  // Update params and URL
  const updateParams = useCallback((newParams) => {
    const updatedParams = { ...params, ...newParams };
    
    // Prevent loops by marking that this update comes from component
    isUpdatingFromComponent.current = true;
    
    setParams(updatedParams);
    
    // Update URL
    const urlParams = createPaginationParams(updatedParams, defaults);
    setSearchParams(urlParams, { replace: true });
    
    // Reset flag after URL update
    setTimeout(() => {
      isUpdatingFromComponent.current = false;
    }, 50);
  }, [params, setSearchParams, defaults]);
  
  // Sync URL changes to state (only when URL changes externally)
  useEffect(() => {
    // Skip on initial mount and when update comes from component
    if (isInitialMount.current || isUpdatingFromComponent.current) {
      isInitialMount.current = false;
      return;
    }
    
    const urlParams = parsePaginationParams(searchParams, defaults);
    
    // Only update if params actually changed
    const hasChanged = Object.keys(urlParams).some(key => urlParams[key] !== params[key]);
    
    if (hasChanged) {
      setParams(urlParams);
      setSearchInput(urlParams.search);
    }
  }, [searchParams, params, defaults]);
  
  // Individual update functions
  const setPage = useCallback((page) => {
    updateParams({ page });
  }, [updateParams]);
  
  const setPageSize = useCallback((size) => {
    updateParams({ size, page: 0 });
  }, [updateParams]);
  
  const setSort = useCallback((sortBy, sortOrder) => {
    updateParams({ sortBy, sortOrder, page: 0 });
  }, [updateParams]);
  
  const setSearch = useCallback((search) => {
    updateParams({ search, page: 0 });
  }, [updateParams]);
  
  const setGenre = useCallback((genre) => {
    updateParams({ genre, page: 0 });
  }, [updateParams]);
  
  const resetFilters = useCallback(() => {
    isUpdatingFromComponent.current = true;
    setParams(defaults);
    setSearchInput(defaults.search);
    setSearchParams(new URLSearchParams(), { replace: true });
    setTimeout(() => {
      isUpdatingFromComponent.current = false;
    }, 50);
  }, [defaults, setSearchParams]);
  
  return {
    params,
    searchInput,
    setSearchInput,
    setPage,
    setPageSize,
    setSort,
    setSearch,
    setGenre,
    resetFilters,
    updateParams
  };
};