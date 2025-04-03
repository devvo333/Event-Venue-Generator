import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { aiService, AssetRecommendationParams, AssetRecommendationResponse } from './aiService';

interface AssetRecommendationsProps {
  venueId?: string;
  layoutId?: string;
  onSelectAsset?: (asset: AssetRecommendationResponse) => void;
  onAddToLayout?: (assets: AssetRecommendationResponse[]) => void;
  onClose?: () => void;
}

/**
 * AI-powered Asset Recommendations tool
 * Suggests appropriate furniture, decor, and equipment based on event type and style
 */
const AssetRecommendations: React.FC<AssetRecommendationsProps> = ({
  venueId: propVenueId,
  layoutId: propLayoutId,
  onSelectAsset,
  onAddToLayout,
  onClose
}) => {
  const params = useParams();
  const venueId = propVenueId || params.venueId || '';
  const layoutId = propLayoutId || params.layoutId || '';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendationParams, setRecommendationParams] = useState<AssetRecommendationParams>({
    layoutId,
    venueId,
    eventType: 'Wedding',
    budget: 'medium',
    style: 'modern',
    guestCount: 100,
  });
  const [recommendations, setRecommendations] = useState<AssetRecommendationResponse[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);
  
  // Category options for filtering
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'decor', label: 'Decor' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'av', label: 'Audio/Visual' },
  ];
  
  // Event type options
  const eventTypeOptions = [
    { value: 'Wedding', label: 'Wedding' },
    { value: 'Corporate', label: 'Corporate Event' },
    { value: 'Conference', label: 'Conference' },
    { value: 'Birthday', label: 'Birthday Party' },
    { value: 'Gala', label: 'Gala Dinner' },
    { value: 'Meeting', label: 'Business Meeting' },
    { value: 'Party', label: 'Social Party' },
    { value: 'Other', label: 'Other' },
  ];
  
  // Budget options
  const budgetOptions = [
    { value: 'low', label: 'Budget-Friendly' },
    { value: 'medium', label: 'Standard' },
    { value: 'high', label: 'Premium' },
  ];
  
  // Style options
  const styleOptions = [
    { value: 'modern', label: 'Modern' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'rustic', label: 'Rustic' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'traditional', label: 'Traditional' },
    { value: 'industrial', label: 'Industrial' },
    { value: 'bohemian', label: 'Bohemian' },
    { value: 'vintage', label: 'Vintage' },
  ];
  
  useEffect(() => {
    // When layoutId or venueId changes, update the params
    setRecommendationParams(prev => ({
      ...prev,
      layoutId,
      venueId
    }));
  }, [layoutId, venueId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    setRecommendationParams(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };
  
  const handleGetRecommendations = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);
    setSelectedAssets(new Set());
    
    try {
      const results = await aiService.getAssetRecommendations(recommendationParams);
      setRecommendations(results);
    } catch (err) {
      setError('Failed to get asset recommendations. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };
  
  const handleAddToLayout = () => {
    if (selectedAssets.size === 0 || !onAddToLayout) return;
    
    const selectedAssetsList = recommendations.filter(asset => 
      selectedAssets.has(asset.id)
    );
    
    onAddToLayout(selectedAssetsList);
  };
  
  const handleSelectAssetClick = (asset: AssetRecommendationResponse) => {
    if (onSelectAsset) {
      onSelectAsset(asset);
    }
  };
  
  const handleExpandAsset = (assetId: string) => {
    setExpandedAssetId(expandedAssetId === assetId ? null : assetId);
  };
  
  // Filter recommendations by category
  const filteredRecommendations = filterCategory === 'all'
    ? recommendations
    : recommendations.filter(rec => rec.category === filterCategory);
  
  // Format price to include currency symbol
  const formatPrice = (price?: { estimated: number, currency: string, unit: string }) => {
    if (!price) return 'Price not available';
    
    const currencySymbol = price.currency === 'USD' ? '$' : price.currency;
    const formattedPrice = `${currencySymbol}${price.estimated}`;
    
    if (price.unit === 'per_item') {
      return `${formattedPrice} per item`;
    } else if (price.unit === 'per_day') {
      return `${formattedPrice} per day`;
    } else {
      return formattedPrice;
    }
  };
  
  return (
    <div className="asset-recommendations bg-white rounded-lg p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">AI Asset Recommendations</h2>
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
          Our AI will suggest the most appropriate furniture, decor, and equipment based on your event needs and venue style.
        </p>
        
        <form onSubmit={handleGetRecommendations} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type
            </label>
            <select
              id="eventType"
              name="eventType"
              value={recommendationParams.eventType}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {eventTypeOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
              value={recommendationParams.guestCount}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
              Budget Level
            </label>
            <select
              id="budget"
              name="budget"
              value={recommendationParams.budget}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {budgetOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Style
            </label>
            <select
              id="style"
              name="style"
              value={recommendationParams.style}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {styleOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Analyzing Event Needs...' : 'Get Asset Recommendations'}
            </button>
          </div>
        </form>
      </div>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {recommendations.length > 0 && (
        <div className="recommendations-section">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Recommended Assets</h3>
            <div className="flex space-x-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-md border border-gray-300 py-1 px-3 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              
              {onAddToLayout && selectedAssets.size > 0 && (
                <button
                  onClick={handleAddToLayout}
                  className="py-1 px-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Selected ({selectedAssets.size})
                </button>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRecommendations.map(asset => (
              <div 
                key={asset.id} 
                className={`asset-card border rounded-lg overflow-hidden ${selectedAssets.has(asset.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'}`}
              >
                <div className="flex items-center p-4 bg-gray-50 border-b border-gray-200">
                  {onAddToLayout && (
                    <div className="flex-shrink-0 mr-2">
                      <input
                        type="checkbox"
                        id={`select-${asset.id}`}
                        checked={selectedAssets.has(asset.id)}
                        onChange={() => handleToggleAssetSelection(asset.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                  <h4 className="text-lg font-medium text-gray-800 flex-grow">{asset.name}</h4>
                  <div className="ml-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {asset.confidence}% match
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex mb-4">
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden mr-4">
                      <img 
                        src={asset.previewUrl} 
                        alt={asset.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/default-asset.jpg';
                        }}
                      />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1 capitalize">{asset.category} {asset.subCategory ? `- ${asset.subCategory}` : ''}</div>
                      <div className="text-sm mb-1">
                        <span className="font-medium">Recommended Quantity:</span> {asset.count}
                      </div>
                      <div className="text-sm">
                        <span className="font-medium">Price:</span> {formatPrice(asset.price)}
                      </div>
                      <div className="flex mt-2">
                        {asset.tags?.map(tag => (
                          <span 
                            key={tag} 
                            className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {asset.description && (
                    <p className="text-sm text-gray-600 mb-3">{asset.description}</p>
                  )}
                  
                  {asset.alternatives && asset.alternatives.length > 0 && (
                    <div className="mt-2">
                      <button
                        onClick={() => handleExpandAsset(asset.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
                      >
                        <span>View alternatives</span>
                        <svg 
                          className={`ml-1 h-4 w-4 transform ${expandedAssetId === asset.id ? 'rotate-180' : ''}`} 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {expandedAssetId === asset.id && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {asset.alternatives.map(alt => (
                            <div key={alt.id} className="border rounded p-2 flex flex-col items-center">
                              <div className="w-full h-20 bg-gray-100 rounded overflow-hidden mb-1">
                                <img 
                                  src={alt.previewUrl} 
                                  alt={alt.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/assets/default-asset.jpg';
                                  }}
                                />
                              </div>
                              <span className="text-xs text-center">{alt.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {asset.dimensions && (
                    <div className="text-xs text-gray-500 mt-2">
                      Dimensions: {asset.dimensions.width}″ × {asset.dimensions.height}″ {asset.dimensions.depth ? `× ${asset.dimensions.depth}″` : ''}
                    </div>
                  )}
                  
                  {onSelectAsset && (
                    <div className="mt-3">
                      <button
                        onClick={() => handleSelectAssetClick(asset)}
                        className="w-full py-1 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRecommendations; 