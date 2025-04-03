import React, { useState, useEffect } from 'react';
import { 
  VenueDimensions, 
  CapacityMode, 
  AdditionalSpaceRequirements,
  calculateMaxCapacity,
  calculateAllCapacities,
  recommendCapacityForEvent,
  calculateSocialDistancingCapacity
} from '../../utils/capacityCalculator';
import { Asset } from '../../types/canvas';

interface VenueCapacityCalculatorProps {
  venueDimensions: VenueDimensions;
  fixedAssets?: Asset[];
  className?: string;
}

type EventType = 'wedding' | 'conference' | 'concert' | 'exhibition' | 'banquet' | 'meeting';

const VenueCapacityCalculator: React.FC<VenueCapacityCalculatorProps> = ({
  venueDimensions,
  fixedAssets = [],
  className = '',
}) => {
  const [selectedMode, setSelectedMode] = useState<CapacityMode>(CapacityMode.RECEPTION);
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [additionalRequirements, setAdditionalRequirements] = useState<AdditionalSpaceRequirements>({
    buffetTables: 1,
    bars: 1,
    stage: 'none',
    danceFloor: 'none',
  });
  const [capacityData, setCapacityData] = useState<any>(null);
  const [allCapacities, setAllCapacities] = useState<Record<CapacityMode, { maxCapacity: number; capacityWithSafetyMargin: number }> | null>(null);
  const [eventRecommendation, setEventRecommendation] = useState<{
    recommendedCapacity: number;
    suggestedLayout: CapacityMode;
    additionalRecommendations: string[];
  } | null>(null);
  const [showSocialDistancing, setShowSocialDistancing] = useState(false);
  const [distancingRequirement, setDistancingRequirement] = useState(2);
  const [socialDistancingData, setSocialDistancingData] = useState<{
    standardCapacity: number;
    distancedCapacity: number;
    reductionPercentage: number;
  } | null>(null);

  // Recalculate capacity when inputs change
  useEffect(() => {
    // Calculate capacity for selected mode
    const data = calculateMaxCapacity(
      venueDimensions,
      selectedMode,
      fixedAssets,
      additionalRequirements
    );
    setCapacityData(data);

    // Calculate capacities for all modes
    const allData = calculateAllCapacities(
      venueDimensions,
      fixedAssets,
      additionalRequirements
    );
    setAllCapacities(allData);

    // Calculate recommendation for selected event type
    const recommendation = recommendCapacityForEvent(
      eventType,
      venueDimensions,
      fixedAssets
    );
    setEventRecommendation(recommendation);

    // Calculate social distancing capacity if enabled
    if (showSocialDistancing) {
      const distancingData = calculateSocialDistancingCapacity(
        venueDimensions,
        selectedMode,
        distancingRequirement,
        fixedAssets,
        additionalRequirements
      );
      setSocialDistancingData(distancingData);
    } else {
      setSocialDistancingData(null);
    }
  }, [
    venueDimensions, 
    selectedMode, 
    fixedAssets, 
    additionalRequirements, 
    eventType, 
    showSocialDistancing,
    distancingRequirement
  ]);

  // Format area value with unit
  const formatArea = (area: number): string => {
    return `${area.toFixed(1)} m²`;
  };

  // Format layout name for display
  const formatLayoutName = (mode: string): string => {
    return mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase().replace('_', ' ');
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="bg-blue-600 px-4 py-3">
        <h2 className="text-lg font-medium text-white">Venue Capacity Calculator</h2>
      </div>
      
      <div className="p-4">
        {/* Venue dimensions info */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Venue Dimensions</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="block text-gray-500">Size</span>
              <span className="font-medium">
                {venueDimensions.width} × {venueDimensions.height} {venueDimensions.unit}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <span className="block text-gray-500">Total Area</span>
              <span className="font-medium">
                {formatArea(capacityData?.usableArea + capacityData?.spaceForFixedElements + capacityData?.spaceForCirculation || 0)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Layout selection */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Layout Type</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {Object.values(CapacityMode).map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`px-3 py-2 text-sm rounded-md ${
                  selectedMode === mode
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                {formatLayoutName(mode)}
              </button>
            ))}
          </div>
        </div>
        
        {/* Additional requirements */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Additional Requirements</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Buffet Tables</label>
              <select 
                value={additionalRequirements.buffetTables || 0}
                onChange={(e) => setAdditionalRequirements({
                  ...additionalRequirements,
                  buffetTables: parseInt(e.target.value)
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Bars</label>
              <select 
                value={additionalRequirements.bars || 0}
                onChange={(e) => setAdditionalRequirements({
                  ...additionalRequirements,
                  bars: parseInt(e.target.value)
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                {[0, 1, 2, 3].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Stage</label>
              <select 
                value={additionalRequirements.stage || 'none'}
                onChange={(e) => setAdditionalRequirements({
                  ...additionalRequirements,
                  stage: e.target.value as 'none' | 'small' | 'medium' | 'large'
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-gray-500 mb-1">Dance Floor</label>
              <select 
                value={additionalRequirements.danceFloor || 'none'}
                onChange={(e) => setAdditionalRequirements({
                  ...additionalRequirements,
                  danceFloor: e.target.value as 'none' | 'small' | 'medium' | 'large'
                })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="none">None</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Event type recommendation */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Event Type Recommendation</h3>
          <div className="mb-2">
            <select 
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="wedding">Wedding</option>
              <option value="conference">Conference</option>
              <option value="concert">Concert</option>
              <option value="exhibition">Exhibition</option>
              <option value="banquet">Banquet</option>
              <option value="meeting">Meeting</option>
            </select>
          </div>
          
          {eventRecommendation && (
            <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-medium text-sm">Recommended for {eventType}</span>
              </div>
              <div className="text-sm mb-1">
                <span className="text-gray-600">Suggested layout: </span>
                <span className="font-medium">{formatLayoutName(eventRecommendation.suggestedLayout)}</span>
              </div>
              <div className="text-sm mb-2">
                <span className="text-gray-600">Recommended capacity: </span>
                <span className="font-medium">{eventRecommendation.recommendedCapacity} people</span>
              </div>
              {eventRecommendation.additionalRecommendations.length > 0 && (
                <div className="text-xs text-gray-600">
                  <h4 className="font-medium mb-1">Additional recommendations:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    {eventRecommendation.additionalRecommendations.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Social distancing toggle */}
        <div className="mb-6">
          <div className="flex items-center">
            <input
              id="social-distancing"
              type="checkbox"
              checked={showSocialDistancing}
              onChange={() => setShowSocialDistancing(!showSocialDistancing)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="social-distancing" className="ml-2 block text-sm text-gray-600">
              Show social distancing capacity
            </label>
          </div>
          
          {showSocialDistancing && (
            <div className="mt-3">
              <label className="block text-xs text-gray-500 mb-1">
                Distancing requirement (meters)
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.5"
                value={distancingRequirement}
                onChange={(e) => setDistancingRequirement(parseFloat(e.target.value))}
                className="block w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1m</span>
                <span>1.5m</span>
                <span>2m</span>
                <span>2.5m</span>
                <span>3m</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Capacity results */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Capacity Results</h3>
          
          {capacityData && (
            <div>
              {/* Main capacity */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-lg font-medium text-gray-900">
                    {formatLayoutName(selectedMode)}
                  </span>
                  <span className="text-3xl font-bold text-blue-600">
                    {capacityData.capacityWithSafetyMargin}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Maximum capacity:</span>
                  <span>{capacityData.maxCapacity} people</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>With safety margin:</span>
                  <span>{capacityData.capacityWithSafetyMargin} people</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Required space per person:</span>
                  <span>{capacityData.requiredSpacePerPerson.toFixed(1)} m²</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Usable area:</span>
                  <span>{formatArea(capacityData.usableArea)}</span>
                </div>
                
                {/* Social distancing comparison */}
                {socialDistancingData && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>With {distancingRequirement}m distancing:</span>
                      <span className="font-medium">{socialDistancingData.distancedCapacity} people</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Reduction:</span>
                      <span className="text-red-600">{socialDistancingData.reductionPercentage.toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Other layout capacities */}
              {allCapacities && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 mb-2">Other Layout Capacities</h4>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {Object.entries(allCapacities)
                      .filter(([mode]) => mode !== selectedMode)
                      .map(([mode, data]) => (
                        <button
                          key={mode}
                          onClick={() => setSelectedMode(mode as CapacityMode)}
                          className="bg-gray-50 hover:bg-gray-100 rounded-md p-2 text-center"
                        >
                          <div className="text-xs text-gray-600">{formatLayoutName(mode)}</div>
                          <div className="font-medium">{data.capacityWithSafetyMargin}</div>
                        </button>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Space utilization breakdown */}
        {capacityData && (
          <div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Space Utilization</h3>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Utilization breakdown</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-blue-600">
                    {formatArea(capacityData.usableArea + capacityData.spaceForFixedElements + capacityData.spaceForCirculation)}
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-5 text-xs flex rounded bg-gray-100">
                {/* Usable area */}
                <div 
                  style={{ 
                    width: `${(capacityData.usableArea / (capacityData.usableArea + capacityData.spaceForFixedElements + capacityData.spaceForCirculation)) * 100}%` 
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                >
                  Guest Area
                </div>
                {/* Fixed elements */}
                <div 
                  style={{ 
                    width: `${(capacityData.spaceForFixedElements / (capacityData.usableArea + capacityData.spaceForFixedElements + capacityData.spaceForCirculation)) * 100}%` 
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                >
                  Features
                </div>
                {/* Circulation */}
                <div 
                  style={{ 
                    width: `${(capacityData.spaceForCirculation / (capacityData.usableArea + capacityData.spaceForFixedElements + capacityData.spaceForCirculation)) * 100}%` 
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-yellow-500"
                >
                  Circulation
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-2 text-center text-xs">
                <div>
                  <div className="w-3 h-3 bg-blue-500 rounded-full inline-block mr-1"></div>
                  <span className="text-gray-600">Guest Area: {formatArea(capacityData.usableArea)}</span>
                </div>
                <div>
                  <div className="w-3 h-3 bg-green-500 rounded-full inline-block mr-1"></div>
                  <span className="text-gray-600">Features: {formatArea(capacityData.spaceForFixedElements)}</span>
                </div>
                <div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full inline-block mr-1"></div>
                  <span className="text-gray-600">Circulation: {formatArea(capacityData.spaceForCirculation)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 px-4 py-3 text-right">
        <button
          type="button"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Save Layout
        </button>
      </div>
    </div>
  );
};

export default VenueCapacityCalculator; 