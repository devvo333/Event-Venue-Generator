import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { aiService, OccupancyOptimizationParams, OccupancyOptimizationResponse } from './aiService';

interface OccupancyOptimizerProps {
  venueId?: string;
  layoutId?: string;
  onClose?: () => void;
  onApplyOptimization?: (optimizedData: any) => void;
}

/**
 * AI-powered Occupancy Optimization tool
 * Analyzes venue layouts and optimizes for different goals including capacity, comfort, flow, and visibility
 */
const OccupancyOptimizer: React.FC<OccupancyOptimizerProps> = ({
  venueId: propVenueId,
  layoutId: propLayoutId,
  onClose,
  onApplyOptimization
}) => {
  const params = useParams();
  const venueId = propVenueId || params.venueId || '';
  const layoutId = propLayoutId || params.layoutId || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimizationParams, setOptimizationParams] = useState<OccupancyOptimizationParams>({
    venueId,
    layoutId,
    guestCount: 100,
    optimizationGoal: 'capacity',
    includeStage: false,
    includeBar: true,
    includeDanceFloor: false,
    includeBuffetArea: false,
    eventType: 'Wedding',
  });
  const [venueDimensions, setVenueDimensions] = useState({ width: 0, height: 0, unit: 'meters' });
  const [optimizationResults, setOptimizationResults] = useState<OccupancyOptimizationResponse | null>(null);
  const [implementationStatus, setImplementationStatus] = useState('active'); // Change to 'active' to enable real functionality
  
  useEffect(() => {
    // Fetch venue details when component mounts
    const fetchVenueDetails = async () => {
      try {
        // In a real implementation, this would fetch venue details from an API
        // For now, just set mock data
        setVenueDimensions({ width: 20, height: 30, unit: 'meters' });
      } catch (err) {
        console.error('Error fetching venue details:', err);
        setError('Failed to load venue information.');
      }
    };
    
    fetchVenueDetails();
  }, [venueId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setOptimizationParams(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseInt(value, 10) || 0
          : value
    }));
  };
  
  const handleOptimize = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (implementationStatus === 'planned') {
        // Just show the placeholder for "coming soon" version
        await new Promise(resolve => setTimeout(resolve, 1000));
        setOptimizationResults({
          status: 'partial',
          message: 'The full Occupancy Optimization feature is coming soon in the next update!',
          optimal: {
            capacity: optimizationParams.guestCount,
            tables: Math.ceil(optimizationParams.guestCount / 8),
            chairs: optimizationParams.guestCount,
            aisleWidth: 1.2,
            spacingDensity: 'medium',
            flowPattern: 'clustered',
          },
          improvements: [
            'Preview of upcoming feature capabilities'
          ],
          heatmapUrl: '/assets/ai/heatmap-placeholder.jpg',
          layoutPreviewUrl: '/assets/ai/layout-preview-placeholder.jpg',
          safetyCompliance: {
            exitAccessibility: true,
            crowdingRisks: [],
            recommendations: []
          }
        });
      } else {
        // Call the actual optimization service
        const results = await aiService.calculateOptimalOccupancy(optimizationParams);
        setOptimizationResults(results);
      }
    } catch (err) {
      setError('Failed to generate optimization results. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="occupancy-optimizer bg-white rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI Occupancy Optimization</h2>
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
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          {implementationStatus === 'planned' ? (
            <span className="text-indigo-600 font-medium">Coming Soon: </span>
          ) : (
            <span></span>
          )}
          Our AI can analyze your venue and event requirements to suggest optimal layouts 
          that maximize space usage while ensuring guest comfort and proper traffic flow.
        </p>
        
        {venueDimensions.width > 0 && (
          <div className="venue-info bg-gray-50 p-4 rounded mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Venue Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-500">Dimensions:</span>
                <p className="font-medium">{venueDimensions.width} × {venueDimensions.height} {venueDimensions.unit}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Area:</span>
                <p className="font-medium">{venueDimensions.width * venueDimensions.height} {venueDimensions.unit}²</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleOptimize} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              value={optimizationParams.guestCount}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="optimizationGoal" className="block text-sm font-medium text-gray-700 mb-1">
              Optimization Goal
            </label>
            <select
              id="optimizationGoal"
              name="optimizationGoal"
              value={optimizationParams.optimizationGoal}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="capacity">Maximize Capacity</option>
              <option value="comfort">Prioritize Comfort</option>
              <option value="flow">Optimize Traffic Flow</option>
              <option value="visibility">Best Stage Visibility</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              value={optimizationParams.eventType}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Wedding">Wedding</option>
              <option value="Corporate">Corporate Event</option>
              <option value="Birthday">Birthday Party</option>
              <option value="Conference">Conference</option>
              <option value="Gala">Gala Dinner</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeStage"
                name="includeStage"
                checked={optimizationParams.includeStage}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="includeStage" className="ml-2 text-sm text-gray-700">
                Include Stage/Podium
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeBar"
                name="includeBar"
                checked={optimizationParams.includeBar}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="includeBar" className="ml-2 text-sm text-gray-700">
                Include Bar Area
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeDanceFloor"
                name="includeDanceFloor"
                checked={optimizationParams.includeDanceFloor}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="includeDanceFloor" className="ml-2 text-sm text-gray-700">
                Include Dance Floor
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeBuffetArea"
                name="includeBuffetArea"
                checked={optimizationParams.includeBuffetArea}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="includeBuffetArea" className="ml-2 text-sm text-gray-700">
                Include Buffet/Catering Area
              </label>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing Venue...' : 'Optimize Occupancy'}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {optimizationResults && (
        <div className="optimization-results">
          {optimizationResults.status === 'partial' && optimizationResults.message ? (
            <div className="text-center py-8 bg-indigo-50 rounded-lg">
              <svg className="w-16 h-16 text-indigo-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <h3 className="text-xl font-medium text-gray-700 mb-2">Coming Soon!</h3>
              <p className="text-gray-500 mb-4">{optimizationResults.message}</p>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                The full Occupancy Optimization feature will analyze your venue and event details to suggest the ideal layout that maximizes space usage while ensuring guest comfort and proper traffic flow.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Optimization Results</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Recommended Configuration</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Optimal Capacity:</span>
                      <span className="font-medium">{optimizationResults.optimal.capacity} guests</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Recommended Tables:</span>
                      <span className="font-medium">{optimizationResults.optimal.tables}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Chair Count:</span>
                      <span className="font-medium">{optimizationResults.optimal.chairs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Aisle Width:</span>
                      <span className="font-medium">{optimizationResults.optimal.aisleWidth}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Spacing Density:</span>
                      <span className="font-medium capitalize">{optimizationResults.optimal.spacingDensity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Flow Pattern:</span>
                      <span className="font-medium capitalize">{optimizationResults.optimal.flowPattern}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Improvements</h4>
                  <ul className="space-y-2">
                    {optimizationResults.improvements.map((improvement, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm">{improvement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Occupancy Heatmap</h4>
                  <p className="text-sm text-gray-600 mb-2">Visualization of guest density and traffic flow:</p>
                  <div className="bg-gray-100 rounded overflow-hidden">
                    <img 
                      src={optimizationResults.heatmapUrl} 
                      alt="Occupancy heatmap" 
                      className="w-full"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/default-heatmap.jpg';
                      }}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Safety Compliance</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <div className="flex items-center mb-3">
                      <svg 
                        className={`w-5 h-5 ${optimizationResults.safetyCompliance.exitAccessibility ? 'text-green-500' : 'text-red-500'} mr-2`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        {optimizationResults.safetyCompliance.exitAccessibility ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        )}
                      </svg>
                      <span className="font-medium">Exit Accessibility</span>
                    </div>
                    
                    {optimizationResults.safetyCompliance.crowdingRisks.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-1">Potential Crowding Risks:</h5>
                        <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                          {optimizationResults.safetyCompliance.crowdingRisks.map((risk, index) => (
                            <li key={index}>{risk}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Safety Recommendations:</h5>
                      <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                        {optimizationResults.safetyCompliance.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <button
                  onClick={() => onApplyOptimization && onApplyOptimization(optimizationResults.optimal)}
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply These Optimization Suggestions
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OccupancyOptimizer; 