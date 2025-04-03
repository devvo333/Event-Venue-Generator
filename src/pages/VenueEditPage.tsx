import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import VenueForm from '@/venues/VenueForm';
import { Venue, getVenue } from '@/api/venues';

const VenueEditPage: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const navigate = useNavigate();
  
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchVenue = async () => {
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
        console.error('Error fetching venue:', err);
        setError(err instanceof Error ? err.message : 'Failed to load venue');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVenue();
  }, [venueId]);
  
  const handleSuccess = (updatedVenue: Venue) => {
    // Navigate to the venue details page
    navigate(`/venues/${updatedVenue.id}`);
  };
  
  const handleCancel = () => {
    // Navigate back to the venue details page
    if (venueId) {
      navigate(`/venues/${venueId}`);
    } else {
      navigate('/venues');
    }
  };
  
  // If data is being loaded
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-2 text-gray-600">Loading venue...</p>
        </div>
      </div>
    );
  }
  
  // If there's an error
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          
          <h3 className="mt-2 text-gray-900 font-medium">Venue not found</h3>
          <p className="mt-1 text-gray-500">The venue you are trying to edit does not exist or has been removed.</p>
          
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center text-sm text-gray-500">
        <Link to="/venues" className="hover:text-gray-700">Venues</Link>
        <svg className="mx-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to={`/venues/${venue.id}`} className="hover:text-gray-700">{venue.name}</Link>
        <svg className="mx-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">Edit</span>
      </div>
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit Venue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the details for "{venue.name}"
        </p>
      </div>
      
      <VenueForm 
        initialVenue={venue}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default VenueEditPage; 