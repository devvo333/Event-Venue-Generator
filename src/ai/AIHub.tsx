import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LayoutSuggestions from './LayoutSuggestions';
import StyleRecommendations from './StyleRecommendations';
import OccupancyOptimizer from './OccupancyOptimizer';
import AssetRecommendations from './AssetRecommendations';
import ImageRecognition from './ImageRecognition';
import FloorPlanGenerator from './FloorPlanGenerator';
import LightingSimulation from './LightingSimulation';
import { aiService } from './aiService';

const AIHub: React.FC = () => {
  const navigate = useNavigate();
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'layouts' | 'styles' | 'occupancy' | 'assets' | 'image' | 'floorplan' | 'lighting'>('layouts');
  
  // Mock venues for demo
  const venues = [
    { id: 'venue-1', name: 'Grand Ballroom', image: '/assets/venues/grand-ballroom.jpg' },
    { id: 'venue-2', name: 'Garden Terrace', image: '/assets/venues/garden-terrace.jpg' },
    { id: 'venue-3', name: 'Conference Center', image: '/assets/venues/conference-center.jpg' },
    { id: 'venue-4', name: 'Rooftop Lounge', image: '/assets/venues/rooftop-lounge.jpg' },
  ];
  
  // AI Features information
  const aiFeatures = [
    {
      id: 'layout-suggestions',
      name: 'Auto-Layout Suggestions',
      description: 'Get AI-generated layout recommendations based on your event type and guest count.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
        </svg>
      ),
      tab: 'layouts'
    },
    {
      id: 'style-recommendations',
      name: 'Venue Style Matching',
      description: 'Discover the perfect visual style for your event with AI-powered design recommendations.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      tab: 'styles'
    },
    {
      id: 'occupancy-optimization',
      name: 'Occupancy Optimization',
      description: 'Maximize space usage and optimize guest flow with AI-driven placement suggestions.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      tab: 'occupancy'
    },
    {
      id: 'asset-recommendations',
      name: 'Smart Asset Recommendations',
      description: 'Get intelligent suggestions for furniture, decor, and equipment based on your event needs.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
        </svg>
      ),
      tab: 'assets'
    },
    {
      id: 'image-recognition',
      name: 'Image Recognition',
      description: 'Automatically detect venue dimensions and create floor plans from venue photos.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      tab: 'image'
    },
    {
      id: 'floor-plan-generator',
      name: 'Automated Floor Plans',
      description: 'Generate intelligent floor plans optimized for your specific event requirements.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      tab: 'floorplan'
    },
    {
      id: 'lighting-simulation',
      name: 'Lighting Simulation',
      description: 'Visualize and optimize lighting setups for your event with physics-based simulations.',
      icon: (
        <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      tab: 'lighting'
    }
  ];
  
  const handleSelectVenue = (venueId: string) => {
    setSelectedVenue(venueId);
  };
  
  const handleSelectLayout = (layoutId: string) => {
    // Navigate to the canvas editor with the selected layout
    navigate(`/canvas?layoutId=${layoutId}&venueId=${selectedVenue}&aiGenerated=true`);
  };
  
  const handleSelectStyle = (styleId: string) => {
    // Navigate to the style application page
    navigate(`/style-editor?styleId=${styleId}&venueId=${selectedVenue}`);
  };

  const handleSelectAssets = (selectedAssets: any[]) => {
    // Navigate to the canvas editor with the selected assets
    const assetIds = selectedAssets.map(asset => asset.id).join(',');
    navigate(`/canvas?venueId=${selectedVenue}&assetIds=${assetIds}&aiRecommended=true`);
  };
  
  const handleDimensionsDetected = (dimensions: any) => {
    // Update venue dimensions or navigate to venue edit
    if (selectedVenue) {
      navigate(`/venues/edit/${selectedVenue}?dimensions=${JSON.stringify(dimensions)}`);
    }
  };
  
  const handleFloorPlanGenerated = (floorPlanUrl: string) => {
    // Navigate to floor plan import
    navigate(`/venues/floor-plan?venueId=${selectedVenue}&floorPlanUrl=${encodeURIComponent(floorPlanUrl)}`);
  };
  
  // Render the venue selection step
  const renderVenueSelection = () => {
    return (
      <div className="venue-selection mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Select a Venue to Continue</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {venues.map(venue => (
            <div 
              key={venue.id}
              className={`venue-card cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedVenue === venue.id ? 'border-indigo-500 shadow-lg' : 'border-gray-200 hover:border-indigo-300'
              }`}
              onClick={() => handleSelectVenue(venue.id)}
            >
              <div className="relative h-40">
                <img 
                  src={venue.image || '/assets/default-venue.jpg'}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/default-venue.jpg';
                  }}
                />
                {selectedVenue === venue.id && (
                  <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-3 bg-white">
                <h3 className="font-medium text-gray-900">{venue.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render the AI features section
  const renderAIFeatures = () => {
    return (
      <div className="ai-features mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">AI-Powered Event Planning Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiFeatures.map(feature => (
            <div 
              key={feature.id}
              className={`feature-card p-6 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer ${
                !selectedVenue && !['image', 'floorplan', 'lighting'].includes(feature.tab) 
                  ? 'opacity-50 pointer-events-none' 
                  : ''
              } ${activeTab === feature.tab ? 'bg-indigo-50 border-indigo-300 shadow-md' : 'bg-white'}`}
              onClick={() => setActiveTab(feature.tab as any)}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.name}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // Render the active tool based on selected tab
  const renderActiveTool = () => {
    if (!selectedVenue && !['image', 'floorplan', 'lighting'].includes(activeTab)) {
      return (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">Please select a venue to see AI features</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'layouts':
        return <LayoutSuggestions venueId={selectedVenue!} onSelectLayout={handleSelectLayout} />;
      case 'styles':
        return <StyleRecommendations venueId={selectedVenue!} onSelectStyle={handleSelectStyle} />;
      case 'occupancy':
        return <OccupancyOptimizer venueId={selectedVenue!} />;
      case 'assets':
        return <AssetRecommendations venueId={selectedVenue!} onAddToLayout={handleSelectAssets} />;
      case 'image':
        return (
          <ImageRecognition 
            onDimensionsDetected={handleDimensionsDetected}
            onFloorPlanGenerated={handleFloorPlanGenerated}
          />
        );
      case 'floorplan':
        return <FloorPlanGenerator />;
      case 'lighting':
        return <LightingSimulation />;
      default:
        return null;
    }
  };
  
  return (
    <div className="ai-hub bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">AI-Powered Event Planning</h1>
          <p className="mt-2 text-lg text-gray-600">
            Let our artificial intelligence help you create the perfect event layout, style, and more.
          </p>
        </div>
        
        {!['image', 'floorplan', 'lighting'].includes(activeTab) && renderVenueSelection()}
        {renderAIFeatures()}
        
        <div className="active-tool bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {activeTab === 'layouts' && 'AI Layout Suggestions'}
            {activeTab === 'styles' && 'AI Style Recommendations'}
            {activeTab === 'occupancy' && 'AI Occupancy Optimization'}
            {activeTab === 'assets' && 'AI Asset Recommendations'}
            {activeTab === 'image' && 'AI Image Recognition'}
            {activeTab === 'floorplan' && 'Automated Floor Plan Generator'}
            {activeTab === 'lighting' && 'Lighting Simulation'}
          </h2>
          {renderActiveTool()}
        </div>
      </div>
    </div>
  );
};

export default AIHub; 