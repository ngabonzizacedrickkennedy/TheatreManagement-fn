import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

/**
 * MovieCard component for displaying movie information in a card format
 */
const MovieCard = ({
  id,
  title,
  posterUrl,
  genre,
  rating,
  releaseDate,
  duration,
  className = '',
  isUpcoming = false,
  linkToDetails = true
}) => {
  // Card content
  const cardContent = (
    <>
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg">
        {/* Movie poster */}
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={`${title} poster`}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
          </div>
        )}

        {/* Show tags for specific statuses */}
        {isUpcoming && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-medium px-2 py-1 rounded">
            Coming Soon
          </div>
        )}

        {/* Movie rating */}
        {rating && (
          <div className="absolute bottom-2 left-2 bg-gray-800 bg-opacity-75 text-white text-xs font-medium px-2 py-1 rounded">
            {rating}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Movie title */}
        <h3 className="text-lg font-medium text-gray-900 mb-1 line-clamp-1">{title}</h3>
        
        {/* Movie metadata */}
        <div className="flex flex-col text-sm text-gray-500 space-y-1">
          {/* Genre */}
          {genre && (
            <span className="line-clamp-1">{genre}</span>
          )}
          
          {/* Duration and release info */}
          <div className="flex items-center space-x-2">
            {duration && (
              <span>{formatDuration(duration)}</span>
            )}
            
            {duration && releaseDate && (
              <span>•</span>
            )}
            
            {releaseDate && (
              <span>{formatReleaseDate(releaseDate)}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Helper functions for formatting
  function formatDuration(minutes) {
    if (!minutes) return '';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${mins}m`;
    }
  }

  function formatReleaseDate(date) {
    if (!date) return '';
    
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (error) {
      return date;
    }
  }

  // If card should link to details page
  if (linkToDetails) {
    return (
      <Link 
        to={`/movies/${id}`}
        className={classNames(
          'block rounded-lg shadow bg-white overflow-hidden group transition-transform hover:-translate-y-1 hover:shadow-md',
          className
        )}
      >
        {cardContent}
      </Link>
    );
  }

  // Non-linking version
  return (
    <div 
      className={classNames(
        'block rounded-lg shadow bg-white overflow-hidden',
        className
      )}
    >
      {cardContent}
    </div>
  );
};

MovieCard.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  title: PropTypes.string.isRequired,
  posterUrl: PropTypes.string,
  genre: PropTypes.string,
  rating: PropTypes.string,
  releaseDate: PropTypes.string,
  duration: PropTypes.number,
  className: PropTypes.string,
  isUpcoming: PropTypes.bool,
  linkToDetails: PropTypes.bool
};

export default MovieCard;