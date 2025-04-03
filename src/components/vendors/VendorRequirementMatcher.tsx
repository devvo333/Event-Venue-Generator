import React, { useState, useEffect } from 'react';
import { 
  Vendor, 
  findVendorsForRequirements,
  formatVendorCategoryName
} from '../../utils/vendorManager';
import { Requirement, RequirementCategory } from '../../utils/requirementsChecker';

interface VendorRequirementMatcherProps {
  requirements: Requirement[];
  vendors: Vendor[];
  onVendorSelect?: (vendor: Vendor) => void;
  className?: string;
}

const VendorRequirementMatcher: React.FC<VendorRequirementMatcherProps> = ({
  requirements,
  vendors,
  onVendorSelect,
  className = '',
}) => {
  const [recommendedVendors, setRecommendedVendors] = useState<Record<string, Vendor[]>>({});
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Find recommended vendors for requirements
  useEffect(() => {
    setIsLoading(true);
    
    if (requirements.length > 0 && vendors.length > 0) {
      // Filter requirements to those with high or critical priority
      const criticalRequirements = requirements.filter(req => 
        req.priority === 'critical' || req.priority === 'high'
      );
      
      // Find matching vendors
      const matches = findVendorsForRequirements(vendors, criticalRequirements);
      setRecommendedVendors(matches);
    } else {
      setRecommendedVendors({});
    }
    
    setIsLoading(false);
  }, [requirements, vendors]);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Toggle expanded requirement
  const toggleRequirement = (requirementKey: string) => {
    setExpandedRequirement(expandedRequirement === requirementKey ? null : requirementKey);
  };
  
  // Handle vendor selection
  const handleVendorSelect = (vendor: Vendor) => {
    if (onVendorSelect) {
      onVendorSelect(vendor);
    }
  };
  
  // Get background color for priority
  const getPriorityBgColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="p-4 bg-blue-600 text-white">
        <h2 className="text-lg font-semibold">Vendor Recommendations</h2>
        <p className="text-sm opacity-90">Based on your event requirements</p>
      </div>
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : Object.keys(recommendedVendors).length === 0 ? (
        <div className="p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No vendor recommendations</h3>
          <p className="mt-1 text-sm text-gray-500">
            {requirements.length === 0 
              ? "Add requirements to get vendor recommendations" 
              : vendors.length === 0 
                ? "No vendors available in our directory" 
                : "No matching vendors found for your requirements"}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {Object.entries(recommendedVendors).map(([requirementKey, matchingVendors]) => {
            // Extract requirement details from the key
            const [requirementTitle, requirementDescription] = requirementKey.split('-');
            
            // Find original requirement to get the category and priority
            const originalRequirement = requirements.find(req => 
              req.title === requirementTitle && req.description === requirementDescription
            );
            
            if (!originalRequirement) return null;
            
            const isExpanded = expandedRequirement === requirementKey;
            
            return (
              <div key={requirementKey} className="p-4">
                <div 
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => toggleRequirement(requirementKey)}
                >
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-md font-medium text-gray-900">{requirementTitle}</h3>
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBgColor(originalRequirement.priority)}`}>
                        {originalRequirement.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatVendorCategoryName(originalRequirement.category as unknown as string)}
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {matchingVendors.length} {matchingVendors.length === 1 ? 'vendor' : 'vendors'}
                    </span>
                    <svg 
                      className={`h-5 w-5 text-gray-500 transform ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {matchingVendors.map((vendor) => (
                      <div 
                        key={vendor.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleVendorSelect(vendor)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-900">{vendor.name}</h4>
                            <p className="text-sm text-gray-600">{formatVendorCategoryName(vendor.category)}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <div className="flex mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <svg 
                                  key={star}
                                  className={`h-4 w-4 ${star <= vendor.rating.overall ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">{vendor.rating.overall.toFixed(1)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Starting at:</span> {formatCurrency(Math.min(...vendor.packages.map(pkg => pkg.basePrice)))}
                          </div>
                          
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVendorSelect(vendor);
                            }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <a 
          href="/vendor-directory"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Browse all vendors in our directory →
        </a>
      </div>
    </div>
  );
};

export default VendorRequirementMatcher; 