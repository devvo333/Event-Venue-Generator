import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { aiService, LayoutSuggestionParams, LayoutSuggestionResponse } from './aiService';
import { Venue } from '../types/canvasTypes';

interface LayoutSuggestionsProps {
  venueId?: string;
  onSelectLayout?: (layoutId: string) => void;
  onClose?: () => void;
}

const eventTypes = [
  'Wedding',
  'Corporate Conference',
  'Birthday Party',
  'Networking Event',
  'Gala Dinner',
  'Workshop',
  'Exhibition',
  'Concert',
  'Social Gathering',
  'Other'
];

const LayoutSuggestions: React.FC<LayoutSuggestionsProps> = ({ 
  venueId: propVenueId,
  onSelectLayout,
  onClose
}) => {
  const params = useParams();
  const navigate = useNavigate();
  const venueId = propVenueId || params.venueId || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<LayoutSuggestionResponse[]>([]);
  
  // Form state
  const [formData, setFormData] = useState<LayoutSuggestionParams>({
    venueId,
    eventType: 'Wedding',
    guestCount: 100,
    includeStage: false,
    includeBar: true,
    includeDanceFloor: true,
    includeDiningTables: true,
    specialRequirements: [],
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseInt(value, 10) 
          : value
    }));
  };
  
  // Submit form to get suggestions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await aiService.getLayoutSuggestions(formData);
      setSuggestions(results);
    } catch (err) {
      setError('Failed to generate layout suggestions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Select a suggested layout
  const handleSelectLayout = async (layoutId: string) => {
    try {
      setIsLoading(true);
      // In a real implementation, this would apply the layout to the canvas
      // For now, just notify parent component
      if (onSelectLayout) {
        onSelectLayout(layoutId);
      } else {
        // Navigate to canvas editor with the selected layout
        navigate(`/canvas/${venueId}?layoutId=${layoutId}&aiGenerated=true`);
      }
    } catch (err) {
      setError('Failed to apply the selected layout. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="ai-layout-suggestions bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI Layout Suggestions</h2>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="mb-8">
        <p className="text-gray-600 mb-4">
          Our AI assistant can suggest optimal layouts based on your event requirements. 
          Fill in the details below to generate personalized layout recommendations.
        </p>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              value={formData.eventType}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {eventTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Guests
            </label>
            <input
              type="number"
              id="guestCount"
              name="guestCount"
              min="10"
              max="1000"
              value={formData.guestCount}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Venue Features</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeStage"
                  name="includeStage"
                  checked={formData.includeStage}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="includeStage" className="ml-2 text-sm text-gray-700">
                  Stage/Podium
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeBar"
                  name="includeBar"
                  checked={formData.includeBar}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="includeBar" className="ml-2 text-sm text-gray-700">
                  Bar Area
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeDanceFloor"
                  name="includeDanceFloor"
                  checked={formData.includeDanceFloor}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="includeDanceFloor" className="ml-2 text-sm text-gray-700">
                  Dance Floor
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeDiningTables"
                  name="includeDiningTables"
                  checked={formData.includeDiningTables}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="includeDiningTables" className="ml-2 text-sm text-gray-700">
                  Dining Tables
                </label>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 flex justify-center">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Generating Suggestions...' : 'Generate Layout Suggestions'}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {suggestions.length > 0 && (
        <div className="suggestions-grid">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Suggested Layouts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map(suggestion => (
              <div 
                key={suggestion.layoutId} 
                className="suggestion-card bg-gray-50 rounded-lg overflow-hidden shadow border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-w-16 aspect-h-9">
                  <img 
                    src={suggestion.preview || '/assets/default-layout-preview.jpg'} 
                    alt={`Preview of ${suggestion.name}`}
                    className="object-cover w-full h-48"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/default-layout-preview.jpg';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                    {suggestion.confidence}% Match
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="text-lg font-semibold text-gray-800 mb-1">{suggestion.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                  
                  <div className="mb-3">
                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Layout Elements</h5>
                    <div className="grid grid-cols-3 gap-1 text-xs">
                      <div>Tables: {suggestion.elements.tables}</div>
                      <div>Chairs: {suggestion.elements.chairs}</div>
                      <div>Stage: {suggestion.elements.stages ? 'Yes' : 'No'}</div>
                      <div>Bar: {suggestion.elements.bars > 0 ? 'Yes' : 'No'}</div>
                      <div>Dance Floor: {suggestion.elements.danceFloors ? 'Yes' : 'No'}</div>
                      <div>Other: {suggestion.elements.otherAssets}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSelectLayout(suggestion.layoutId)}
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={isLoading}
                  >
                    Select This Layout
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LayoutSuggestions; 