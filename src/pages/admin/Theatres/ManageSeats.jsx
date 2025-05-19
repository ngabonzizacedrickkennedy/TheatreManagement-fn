// src/pages/admin/Theatres/ManageSeats.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '@contexts/ToastContext';
import Button from '@components/common/Button';
import Input from '@components/common/Input';
import LoadingSpinner from '@components/common/LoadingSpinner';
import NotFound from '@components/common/NotFound';
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const SeatTypes = {
  STANDARD: { label: 'Standard', color: 'bg-blue-100 text-blue-800', priceMultiplier: 1.0 },
  PREMIUM: { label: 'Premium', color: 'bg-green-100 text-green-800', priceMultiplier: 1.5 },
  VIP: { label: 'VIP', color: 'bg-purple-100 text-purple-800', priceMultiplier: 2.0 },
  WHEELCHAIR: { label: 'Wheelchair', color: 'bg-yellow-100 text-yellow-800', priceMultiplier: 1.0 },
  UNAVAILABLE: { label: 'Unavailable', color: 'bg-gray-100 text-gray-800', priceMultiplier: 0 }
};

const ManageSeatsPage = () => {
  const { id, screenNumber } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [theatre, setTheatre] = useState(null);
  const [error, setError] = useState(null);
  const [selectedScreen, setSelectedScreen] = useState(screenNumber ? parseInt(screenNumber) : 1);
  const [selectedSeatType, setSelectedSeatType] = useState('STANDARD');
  const [seatMap, setSeatMap] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [initializeValues, setInitializeValues] = useState({
    rows: 8,
    seatsPerRow: 10
  });
  
  // Mock API function to get theatre details
  useEffect(() => {
    const fetchTheatre = async () => {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock data
        const theatreData = {
          id,
          name: 'Downtown Cinema',
          totalScreens: 8
        };
        
        setTheatre(theatreData);
        
        // Fetch seats for selected screen
        await fetchSeats(theatreData.id, selectedScreen);
        
      } catch (err) {
        setError(err.message || 'Failed to load theatre details');
        setIsLoading(false);
      }
    };
    
    fetchTheatre();
  }, [id]);
  
  // Fetch seats for selected screen
  const fetchSeats = async (theatreId, screen) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Mock seat data - Generate a grid of seats for the screen
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      const seatsPerRow = 10;
      
      // Create an array of seat rows
      const seatRows = rows.map(rowName => {
        // Create array of seats for this row
        const seats = Array.from({ length: seatsPerRow }, (_, index) => {
          const seatNumber = index + 1;
          const seatId = `${rowName}${seatNumber}`;
          
          // Add some variation to seat types for demonstration
          let seatType = 'STANDARD';
          if (rowName === 'A' || rowName === 'B') {
            seatType = 'PREMIUM';
          } else if (rowName === 'H' && (seatNumber === 1 || seatNumber === seatsPerRow)) {
            seatType = 'WHEELCHAIR';
          } else if (rowName === 'E' && seatNumber >= 3 && seatNumber <= 8) {
            seatType = 'VIP';
          }
          
          return {
            id: `${theatreId}-${screen}-${seatId}`,
            seatId,
            row: rowName,
            number: seatNumber,
            type: seatType,
            priceMultiplier: SeatTypes[seatType].priceMultiplier
          };
        });
        
        return {
          rowName,
          seats
        };
      });
      
      setSeatMap(seatRows);
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to load seats');
      setIsLoading(false);
    }
  };
  
  // Handle screen change
  const handleScreenChange = (screenNumber) => {
    setSelectedScreen(screenNumber);
    setSelectedSeats([]);
    setBulkEditMode(false);
    
    // Reset seat map and fetch seats for selected screen
    setIsLoading(true);
    fetchSeats(id, screenNumber);
  };
  
  // Handle seat click
  const handleSeatClick = (seatId) => {
    if (bulkEditMode) {
      // Toggle seat selection
      setSelectedSeats(prevSelected => 
        prevSelected.includes(seatId)
          ? prevSelected.filter(id => id !== seatId)
          : [...prevSelected, seatId]
      );
    } else {
      // Apply seat type directly
      updateSeatType([seatId], selectedSeatType);
    }
  };
  
  // Update seat type for selected seats
  const updateSeatType = async (seatIds, seatType) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Update seat map with new seat type
      setSeatMap(prevMap => {
        return prevMap.map(row => {
          const updatedSeats = row.seats.map(seat => {
            if (seatIds.includes(seat.id)) {
              return {
                ...seat,
                type: seatType,
                priceMultiplier: SeatTypes[seatType].priceMultiplier
              };
            }
            return seat;
          });
          
          return {
            ...row,
            seats: updatedSeats
          };
        });
      });
      
      showSuccess('Seats updated successfully');
      
      // Clear selected seats if in bulk edit mode
      if (bulkEditMode && seatIds.length > 1) {
        setSelectedSeats([]);
      }
    } catch (err) {
      showError(err.message || 'Failed to update seats');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Apply bulk seat type update
  const applyBulkUpdate = () => {
    if (selectedSeats.length === 0) {
      showError('No seats selected');
      return;
    }
    
    updateSeatType(selectedSeats, selectedSeatType);
  };
  
  // Initialize screen seats
  const initializeScreenSeats = async () => {
    const { rows, seatsPerRow } = initializeValues;
    
    if (rows < 1 || rows > 26 || seatsPerRow < 1 || seatsPerRow > 30) {
      showError('Invalid configuration. Rows must be between 1-26 and seats per row between 1-30.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      showSuccess(`Successfully initialized ${rows} rows with ${seatsPerRow} seats per row`);
      
      // Reload seats
      fetchSeats(id, selectedScreen);
    } catch (err) {
      showError(err.message || 'Failed to initialize seats');
      setIsSubmitting(false);
    }
  };
  
  // Delete screen seats
  const deleteScreenSeats = async () => {
    if (!window.confirm(`Are you sure you want to delete all seats for Screen ${selectedScreen}?`)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear seat map
      setSeatMap([]);
      
      showSuccess('All seats deleted successfully');
      setIsSubmitting(false);
    } catch (err) {
      showError(err.message || 'Failed to delete seats');
      setIsSubmitting(false);
    }
  };
  
  // Handle input change for initialize values
  const handleInitializeChange = (e) => {
    const { name, value } = e.target;
    setInitializeValues(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (error || !theatre) {
    return <NotFound message="Theatre not found" />;
  }
  
  return (
    <div>
      <div className="mb-6 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          className="mr-4"
          onClick={() => navigate('/admin/theatres')}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back to Theatres
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Manage Seats</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">{theatre.name}</h2>
            <p className="text-sm text-gray-500">Managing seats for Screen {selectedScreen}</p>
          </div>
          
          {/* Screen selector */}
          <div className="mt-4 sm:mt-0">
            <label htmlFor="screenSelector" className="block text-sm font-medium text-gray-700 mb-1">
              Select Screen
            </label>
            <select
              id="screenSelector"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={selectedScreen}
              onChange={(e) => handleScreenChange(parseInt(e.target.value))}
            >
              {Array.from({ length: theatre.totalScreens }, (_, i) => i + 1).map(screen => (
                <option key={screen} value={screen}>
                  Screen {screen}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Tools section */}
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 border-t border-b border-gray-200 py-4 mb-6">
          {/* Seat type selector */}
          <div>
            <label htmlFor="seatType" className="block text-sm font-medium text-gray-700 mb-1">
              Seat Type
            </label>
            <select
              id="seatType"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              value={selectedSeatType}
              onChange={(e) => setSelectedSeatType(e.target.value)}
            >
              {Object.entries(SeatTypes).map(([type, { label }]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Bulk edit toggle */}
          <div>
            <Button
              variant={bulkEditMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setBulkEditMode(!bulkEditMode);
                setSelectedSeats([]);
              }}
            >
              {bulkEditMode ? 'Exit Selection Mode' : 'Bulk Edit'}
            </Button>
          </div>
          
          {/* Apply bulk changes button */}
          {bulkEditMode && (
            <div>
              <Button
                variant="primary"
                size="sm"
                icon={<CheckIcon className="h-4 w-4 mr-1" />}
                onClick={applyBulkUpdate}
                disabled={selectedSeats.length === 0 || isSubmitting}
                loading={isSubmitting}
              >
                Apply to {selectedSeats.length} Seats
              </Button>
            </div>
          )}
          
          {/* Spacer for flex layout */}
          <div className="flex-grow"></div>
          
          {/* Initialize seats section */}
          <div className="flex items-end space-x-2">
            <div>
              <label htmlFor="rows" className="block text-sm font-medium text-gray-700 mb-1">
                Rows
              </label>
              <input
                type="number"
                id="rows"
                name="rows"
                className="block w-20 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={initializeValues.rows}
                onChange={handleInitializeChange}
                min="1"
                max="26"
              />
            </div>
            <div>
              <label htmlFor="seatsPerRow" className="block text-sm font-medium text-gray-700 mb-1">
                Seats/Row
              </label>
              <input
                type="number"
                id="seatsPerRow"
                name="seatsPerRow"
                className="block w-20 rounded-md border-gray-300 shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                value={initializeValues.seatsPerRow}
                onChange={handleInitializeChange}
                min="1"
                max="30"
              />
            </div>
            <div>
              <Button
                variant="outline"
                size="sm"
                icon={<PlusIcon className="h-4 w-4 mr-1" />}
                onClick={initializeScreenSeats}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                Initialize
              </Button>
            </div>
            <div>
              <Button
                variant="danger"
                size="sm"
                icon={<TrashIcon className="h-4 w-4 mr-1" />}
                onClick={deleteScreenSeats}
                disabled={isSubmitting || seatMap.length === 0}
                loading={isSubmitting}
              >
                Delete All
              </Button>
            </div>
          </div>
        </div>
        
        {/* Seat map legend */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Seat Types</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(SeatTypes).map(([type, { label, color }]) => (
              <div key={type} className="flex items-center">
                <div className={`w-6 h-6 flex items-center justify-center rounded ${color} mr-1`}>
                  <span className="text-xs">{type.charAt(0)}</span>
                </div>
                <span className="text-sm text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Seat map */}
        {seatMap.length > 0 ? (
          <div className="overflow-x-auto mb-6">
            <div className="pb-6 text-center">
              <div className="inline-block w-full max-w-4xl mx-auto">
                {/* Screen display */}
                <div className="w-3/4 h-8 bg-gray-300 mx-auto mb-8 flex items-center justify-center rounded-t-lg text-sm font-medium text-gray-700">
                  SCREEN
                </div>
                
                {/* Seats grid */}
                <div className="flex flex-col space-y-3">
                  {seatMap.map(row => (
                    <div key={row.rowName} className="flex items-center">
                      {/* Row name */}
                      <div className="w-6 flex-shrink-0 text-center text-sm font-medium text-gray-700">
                        {row.rowName}
                      </div>
                      
                      {/* Seats */}
                      <div className="flex-grow flex justify-center">
                        <div className="flex space-x-2">
                          {row.seats.map(seat => {
                            const isSelected = selectedSeats.includes(seat.id);
                            const { color } = SeatTypes[seat.type];
                            
                            return (
                              <button
                                key={seat.id}
                                className={`w-8 h-8 flex items-center justify-center rounded ${color} ${
                                  isSelected ? 'ring-2 ring-primary-500' : ''
                                } ${seat.type === 'UNAVAILABLE' ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                                onClick={() => handleSeatClick(seat.id)}
                                disabled={isSubmitting}
                              >
                                <span className="text-xs">{seat.number}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      
                      {/* Row name (right side) */}
                      <div className="w-6 flex-shrink-0 text-center text-sm font-medium text-gray-700">
                        {row.rowName}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No seats have been configured for this screen yet. Use the Initialize button above to create seats.
            </p>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/theatres/${id}`)}
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageSeatsPage;