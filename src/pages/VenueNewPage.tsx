import { useNavigate } from 'react-router-dom';
import VenueForm from '@/venues/VenueForm';
import { Venue } from '@/api/venues';

const VenueNewPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleSuccess = (venue: Venue) => {
    // Navigate to the venue details page
    navigate(`/venues/${venue.id}`);
  };
  
  const handleCancel = () => {
    // Navigate back to venues list
    navigate('/venues');
  };
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create New Venue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Enter the details for your new venue
        </p>
      </div>
      
      <VenueForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default VenueNewPage; 