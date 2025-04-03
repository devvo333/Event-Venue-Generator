import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Venue, getUserVenues, getPublicVenues, deleteVenue } from '@/api/venues';

interface VenueListProps {
  mode?: 'user' | 'public' | 'all';
  onVenueSelect?: (venue: Venue) => void;
  showCreateButton?: boolean;
  onCreateClick?: () => void;
}

const VenueList: React.FC<VenueListProps> = ({
  mode = 'user',
  onVenueSelect,
  showCreateButton = true,
  onCreateClick
}) => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load venues on component mount
  useEffect(() => {
    const fetchVenues = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let venueData: Venue[] = [];
        
        if (mode === 'user') {
          const { venues: userVenues, error } = await getUserVenues();
          if (error) throw error;
          if (userVenues) venueData = userVenues;
        } else if (mode === 'public') {
          const { venues: publicVenues, error } = await getPublicVenues();
          if (error) throw error;
          if (publicVenues) venueData = publicVenues;
        } else if (mode === 'all') {
          // Fetch both user and public venues
          const [userResponse, publicResponse] = await Promise.all([
            getUserVenues(),
            getPublicVenues()
          ]);
          
          if (userResponse.error) throw userResponse.error;
          if (publicResponse.error) throw publicResponse.error;
          
          // Combine and deduplicate venues (in case user's venue is also public)
          const userVenues = userResponse.venues || [];
          const publicVenues = publicResponse.venues || [];
          
          // Use Map to deduplicate by ID
          const venueMap = new Map<string, Venue>();
          
          [...userVenues, ...publicVenues].forEach(venue => {
            venueMap.set(venue.id, venue);
          });
          
          venueData = Array.from(venueMap.values());
        }
        
        setVenues(venueData);
      } catch (err) {
        console.error('Error fetching venues:', err);
        setError(err instanceof Error ? err.message : 'Failed to load venues');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenues();
  }, [mode]);
  
  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { success, error } = await deleteVenue(venueId);
      
      if (error) throw error;
      if (!success) throw new Error('Failed to delete venue');
      
      // Remove the venue from the list
      setVenues(venues.filter(venue => venue.id !== venueId));
    } catch (err) {
      console.error('Error deleting venue:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete venue');
    }
  };
  
  // If venues are being loaded
  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-2 text-gray-600">Loading venues...</p>
      </div>
    );
  }
  
  // If there's an error
  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        <p className="font-medium">Error loading venues</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }
  
  // If there are no venues
  if (venues.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="bg-gray-50 p-8 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          
          <h3 className="mt-2 text-gray-900 font-medium">No venues found</h3>
          
          {mode === 'user' ? (
            <p className="mt-1 text-gray-500">Get started by creating your first venue.</p>
          ) : (
            <p className="mt-1 text-gray-500">There are no public venues available.</p>
          )}
          
          {showCreateButton && (
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                onClick={onCreateClick}
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Venue
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Render the venue grid
  return (
    <div>
      {showCreateButton && (
        <div className="mb-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            onClick={onCreateClick}
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Venue
          </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {venues.map(venue => (
          <div
            key={venue.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Venue Image */}
            <div className="aspect-video bg-gray-100 relative">
              {venue.cover_image ? (
                <img
                  src={venue.cover_image}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
              
              {/* Public badge */}
              {venue.is_public && (
                <div className="absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  Public
                </div>
              )}
            </div>
            
            {/* Venue Details */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 truncate">{venue.name}</h3>
              
              {venue.description && (
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{venue.description}</p>
              )}
              
              {venue.address && (
                <div className="mt-2 flex items-start">
                  <svg className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="ml-1.5 text-xs text-gray-500 line-clamp-1">{venue.address}</span>
                </div>
              )}
              
              {/* Venue Actions */}
              <div className="mt-4 flex justify-between items-center">
                {onVenueSelect ? (
                  <button
                    type="button"
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                    onClick={() => onVenueSelect(venue)}
                  >
                    Select
                  </button>
                ) : (
                  <Link
                    to={`/venues/${venue.id}`}
                    className="text-primary hover:text-primary-dark text-sm font-medium"
                  >
                    View Details
                  </Link>
                )}
                
                {/* Action dropdown for user's venues */}
                {mode === 'user' && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/venues/${venue.id}/edit`}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteVenue(venue.id)}
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VenueList; 