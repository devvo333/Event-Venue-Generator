import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VenueList from '@/venues/VenueList';

const VenuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'my-venues' | 'public'>('my-venues');
  
  const handleCreateVenue = () => {
    navigate('/venues/new');
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Venues</h1>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage venues for your events
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('my-venues')}
            className={`${
              activeTab === 'my-venues'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            My Venues
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`${
              activeTab === 'public'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Public Venues
          </button>
        </nav>
      </div>
      
      {/* Venue List */}
      {activeTab === 'my-venues' && (
        <VenueList 
          mode="user" 
          showCreateButton={true} 
          onCreateClick={handleCreateVenue} 
        />
      )}
      
      {activeTab === 'public' && (
        <VenueList 
          mode="public" 
          showCreateButton={false} 
        />
      )}
    </div>
  );
};

export default VenuesPage; 