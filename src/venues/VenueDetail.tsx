import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Venue, getVenue, deleteVenue } from '@/api/venues';

const VenueDetail: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVenueDetails = async () => {
      if (!venueId) {
        setError('Venue ID is missing');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        const { venue: venueData, error } = await getVenue(venueId);
        
        if (error) throw error;
        if (!venueData) throw new Error('Venue not found');
        
        setVenue(venueData);
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load venue details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenueDetails();
  }, [venueId]);
  
  const handleDeleteVenue = async () => {
    if (!venue) return;
    
    if (!confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { success, error } = await deleteVenue(venue.id);
      
      if (error) throw error;
      if (!success) throw new Error('Failed to delete venue');
      
      // Redirect to venues list
      navigate('/venues');
    } catch (err) {
      console.error('Error deleting venue:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete venue');
    }
  };
  
  // If data is being loaded
  if (isLoading) {
    return (
      <div className="py-10 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
        <p className="mt-2 text-gray-600">Loading venue details...</p>
      </div>
    );
  }
  
  // If there's an error
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          <p className="font-medium">Error loading venue</p>
          <p className="mt-1">{error}</p>
          <div className="mt-4">
            <Link
              to="/venues"
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Return to venues
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // If venue was not found
  if (!venue) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          
          <h3 className="mt-2 text-gray-900 font-medium">Venue not found</h3>
          <p className="mt-1 text-gray-500">The venue you are looking for does not exist or has been removed.</p>
          
          <div className="mt-6">
            <Link
              to="/venues"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Return to venues
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation/Breadcrumbs */}
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/venues" className="hover:text-gray-700">Venues</Link>
        <svg className="mx-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900 truncate">{venue.name}</span>
      </div>
      
      {/* Venue Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{venue.name}</h1>
          {venue.is_public && (
            <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Public Venue
            </span>
          )}
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          <Link
            to={`/venues/${venue.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Venue
          </Link>
          
          <Link
            to={`/layouts/new?venueId=${venue.id}`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Layout
          </Link>
          
          <Link
            to={`/ar-viewer?venueId=${venue.id}`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            View in AR
          </Link>
          
          <button
            type="button"
            className="inline-flex items-center p-2 border border-transparent rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            onClick={handleDeleteVenue}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Venue Image */}
      <div className="mb-8 bg-gray-100 rounded-lg overflow-hidden shadow-md">
        {venue.cover_image ? (
          <img
            src={venue.cover_image}
            alt={venue.name}
            className="w-full h-64 lg:h-80 object-cover"
          />
        ) : (
          <div className="w-full h-64 lg:h-80 flex items-center justify-center bg-gray-200">
            <svg className="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Venue Details */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-gray-50">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Venue Details</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Information about the venue and its specifications.</p>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            {/* Description */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {venue.description || <span className="text-gray-400 italic">No description provided</span>}
              </dd>
            </div>
            
            {/* Address */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {venue.address || <span className="text-gray-400 italic">No address provided</span>}
              </dd>
            </div>
            
            {/* Dimensions */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dimensions</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {venue.dimensions ? (
                  <div className="flex items-center space-x-2">
                    <span>{venue.dimensions.width} × {venue.dimensions.length}</span>
                    {venue.dimensions.height && <span>× {venue.dimensions.height}</span>}
                    <span>{venue.dimensions.unit}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">No dimensions provided</span>
                )}
              </dd>
            </div>
            
            {/* Created */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {venue.created_at ? new Date(venue.created_at).toLocaleString() : 'Unknown'}
              </dd>
            </div>
            
            {/* Last Updated */}
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {venue.updated_at ? new Date(venue.updated_at).toLocaleString() : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      
      {/* Layouts Section - Placeholder, will be implemented in another component */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Layouts</h2>
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-500">Layouts section will be implemented in future updates.</p>
          <Link
            to={`/layouts/new?venueId=${venue.id}`}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Layout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VenueDetail; 