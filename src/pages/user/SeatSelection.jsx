import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScreenings } from '@hooks/useScreenings';
import { useBookings } from '@hooks/useBookings';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@contexts/ToastContext';
import { formatCurrency } from '@utils/formatUtils';
import LoadingSpinner from '@components/common/LoadingSpinner';
import Button from '@components/common/Button';
import NotFound from '@components/common/NotFound';

const SeatSelectionPage = () => {
  const { id: screeningId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { showWarning, showError } = useToast();
  const [selectedSeats, setSelectedSeats] = useState([]);
  
  // Get screening details
  const { useGetScreening } = useScreenings();
  const { 
    data: screening,
    isLoading: isLoadingScreening,
    error: screeningError
  } = useGetScreening(screeningId);
  
  // Get booked seats
  const { useGetBookedSeats, useGetSeatingLayout, useCalculatePrice } = useBookings();
  const { 
    data: bookedSeats = [],
    isLoading: isLoadingBooked
  } = useGetBookedSeats(screeningId);
  
  // Get seating layout
  const {
    data: seatingLayout = { rows: [], basePrice: 0 },
    isLoading: isLoadingLayout
  } = useGetSeatingLayout(screeningId);
  
  // Calculate price based on selected seats
  const {
    data: priceData = { totalPrice: 0 },
    isLoading: isLoadingPrice
  } = useCalculatePrice(screeningId, selectedSeats, {
    enabled: selectedSeats.length > 0
  });
  
  // Check if user is authenticated
  if (!isAuthenticated) {
    navigate('/login', { state: { from: `/screening/${screeningId}/seats` } });
    return null;
  }
  
  // Loading state
  const isLoading = isLoadingScreening || isLoadingBooked || isLoadingLayout;
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Error state
  if (screeningError || !screening) {
    return <NotFound message="Screening not found" />;
  }
  
  // Handle seat selection
  const handleSeatToggle = (seatId) => {
    if (isSeatBooked(seatId)) return;
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };
  
  // Check if a seat is booked
  const isSeatBooked = (seatId) => {
    return bookedSeats.includes(seatId);
  };
  
  // Check if a seat is selected
  const isSeatSelected = (seatId) => {
    return selectedSeats.includes(seatId);
  };
  
  // Get seat price
  const getSeatPrice = (rowName) => {
    const row = seatingLayout.rows.find(r => r.name === rowName);
    return row ? row.priceMultiplier * seatingLayout.basePrice : seatingLayout.basePrice;
  };
  
  // Handle continue to checkout
  const handleContinueToCheckout = () => {
    if (selectedSeats.length === 0) {
      showWarning('Please select at least one seat');
      return;
    }
    
    // Save selected seats to session storage for checkout
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    navigate(`/checkout/${screeningId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your Seats</h1>
          <div className="text-gray-600">
            <p className="font-medium">{screening.movieTitle}</p>
            <p>{screening.theatreName} • Screen {screening.screenNumber}</p>
            <p>{new Date(screening.startTime).toLocaleString()}</p>
          </div>
        </header>
        
        {/* Seat selection */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            {/* Screen representation */}
            <div className="mb-8">
              <div className="h-8 bg-gray-300 rounded-t-lg flex items-center justify-center text-sm text-gray-600">
                SCREEN
              </div>
              <div className="h-1 w-full bg-gray-400"></div>
            </div>
            
            {/* Seating layout */}
            <div className="mb-8 overflow-x-auto">
              <div className="inline-block min-w-full">
                {seatingLayout.rows.map((row) => (
                  <div key={row.name} className="flex justify-center mb-2">
                    {/* Row label */}
                    <div className="w-8 flex items-center justify-center font-medium">
                      {row.name}
                    </div>
                    
                    {/* Seats */}
                    <div className="flex gap-1">
                      {Array.from({ length: row.seatsCount }, (_, i) => i + 1).map((seatNum) => {
                        const seatId = `${row.name}${seatNum}`;
                        const isBooked = isSeatBooked(seatId);
                        const isSelected = isSeatSelected(seatId);
                        
                        return (
                          <button
                            key={seatId}
                            className={`
                              w-8 h-8 rounded-t-lg text-xs font-medium
                              ${isBooked ? 'bg-gray-400 cursor-not-allowed' : 
                                isSelected ? 'bg-primary-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}
                            `}
                            onClick={() => handleSeatToggle(seatId)}
                            disabled={isBooked}
                            aria-label={`Seat ${seatId} ${isBooked ? '(booked)' : isSelected ? '(selected)' : '(available)'}`}
                            title={`${formatCurrency(getSeatPrice(row.name))} - ${row.seatType || 'Standard'}`}
                          >
                            {seatNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Seat legend */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-200 mr-2"></div>
                <span className="text-sm">Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-primary-500 mr-2"></div>
                <span className="text-sm">Selected</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-400 mr-2"></div>
                <span className="text-sm">Booked</span>
              </div>
            </div>
            
            {/* Price guide */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap border-t pt-4">
              <h3 className="w-full text-center font-medium mb-2">Price Guide</h3>
              {seatingLayout.rows
                .filter((row, index, self) => 
                  self.findIndex(r => r.seatType === row.seatType) === index
                )
                .map(row => (
                  <div key={row.seatType} className="flex items-center">
                    <span className="text-sm">
                      {row.seatType || 'Standard'}: {formatCurrency(row.priceMultiplier * seatingLayout.basePrice)}
                    </span>
                  </div>
                ))
              }
            </div>
          </div>
          
          {/* Booking summary */}
          <div className="bg-gray-50 p-6 border-t">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <div>
                <h3 className="font-medium">Booking Summary</h3>
                <p className="text-sm text-gray-600">
                  Selected: <span className="font-medium">{selectedSeats.length}</span> seats
                  {selectedSeats.length > 0 && (
                    <span> ({selectedSeats.sort().join(', ')})</span>
                  )}
                </p>
              </div>
              <div className="mt-2 md:mt-0 text-right">
                <p className="text-sm text-gray-600">Total:</p>
                <p className="text-xl font-bold">
                  {formatCurrency(priceData.totalPrice)}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="primary"
                size="lg"
                onClick={handleContinueToCheckout}
                disabled={selectedSeats.length === 0}
              >
                Continue to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatSelectionPage;