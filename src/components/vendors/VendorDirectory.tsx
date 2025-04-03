import React, { useState, useEffect } from 'react';
import { 
  Vendor, 
  VendorCategory, 
  ServiceType, 
  filterVendors, 
  sortVendors,
  formatVendorCategoryName,
  formatServiceTypeName,
  generateDemoVendors 
} from '../../utils/vendorManager';

interface VendorDirectoryProps {
  initialVendors?: Vendor[];
  onVendorSelect?: (vendor: Vendor) => void;
  className?: string;
}

const VendorDirectory: React.FC<VendorDirectoryProps> = ({
  initialVendors,
  onVendorSelect,
  className = '',
}) => {
  // State for vendors and filtering
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors || []);
  const [filteredVendors, setFilteredVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<VendorCategory[]>([]);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<ServiceType[]>([]);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'name' | 'date_created' | 'popularity'>('rating');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(false);
  const [showVerifiedOnly, setShowVerifiedOnly] = useState<boolean>(false);
  
  // Load initial vendors (or demo data if none provided)
  useEffect(() => {
    const loadVendors = async () => {
      setIsLoading(true);
      
      try {
        // If initial vendors are provided, use them
        if (initialVendors && initialVendors.length > 0) {
          setVendors(initialVendors);
        } else {
          // Otherwise, generate demo vendors
          const demoVendors = generateDemoVendors(30);
          setVendors(demoVendors);
        }
      } catch (error) {
        console.error('Error loading vendors:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadVendors();
  }, [initialVendors]);
  
  // Apply filters when any filter criteria changes
  useEffect(() => {
    const applyFilters = () => {
      let filtered = filterVendors(vendors, {
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        serviceTypes: selectedServiceTypes.length > 0 ? selectedServiceTypes : undefined,
        location: locationFilter || undefined,
        minRating: minRating > 0 ? minRating : undefined,
        maxPrice: maxPrice,
        searchTerm: searchTerm || undefined,
        verified: showVerifiedOnly ? true : undefined,
        featured: showFeaturedOnly ? true : undefined,
      });
      
      // Sort the filtered vendors
      filtered = sortVendors(filtered, sortBy, sortOrder);
      
      setFilteredVendors(filtered);
    };
    
    applyFilters();
  }, [
    vendors,
    selectedCategories,
    selectedServiceTypes,
    locationFilter,
    minRating,
    maxPrice,
    searchTerm,
    sortBy,
    sortOrder,
    showVerifiedOnly,
    showFeaturedOnly
  ]);
  
  // Toggle a category in the filter
  const toggleCategory = (category: VendorCategory) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  // Toggle a service type in the filter
  const toggleServiceType = (serviceType: ServiceType) => {
    setSelectedServiceTypes(prev => 
      prev.includes(serviceType)
        ? prev.filter(st => st !== serviceType)
        : [...prev, serviceType]
    );
  };
  
  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedServiceTypes([]);
    setLocationFilter('');
    setMinRating(0);
    setMaxPrice(undefined);
    setSearchTerm('');
    setShowFeaturedOnly(false);
    setShowVerifiedOnly(false);
    setSortBy('rating');
    setSortOrder('desc');
  };
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Handle vendor selection
  const handleVendorSelect = (vendor: Vendor) => {
    if (onVendorSelect) {
      onVendorSelect(vendor);
    }
  };
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {halfStar && (
          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="half-star-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#D1D5DB" />
              </linearGradient>
            </defs>
            <path fill="url(#half-star-gradient)" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Vendor Directory</h2>
        <p className="mt-1 text-sm text-gray-600">Find the perfect vendors for your event</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4">
        {/* Search and Filters Sidebar */}
        <div className="md:col-span-1 space-y-6">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Vendors
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search by name, description, tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
            <div className="space-y-2">
              {Object.values(VendorCategory).map((category) => (
                <div key={category} className="flex items-center">
                  <input
                    id={`category-${category}`}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-700">
                    {formatVendorCategoryName(category)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Service Types */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Service Types</h3>
            <div className="space-y-2">
              {Object.values(ServiceType).map((serviceType) => (
                <div key={serviceType} className="flex items-center">
                  <input
                    id={`service-${serviceType}`}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedServiceTypes.includes(serviceType)}
                    onChange={() => toggleServiceType(serviceType)}
                  />
                  <label htmlFor={`service-${serviceType}`} className="ml-2 text-sm text-gray-700">
                    {formatServiceTypeName(serviceType)}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              id="location"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="City, state, zip..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          
          {/* Minimum Rating */}
          <div>
            <label htmlFor="min-rating" className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Rating: {minRating}+
            </label>
            <input
              type="range"
              id="min-rating"
              min="0"
              max="5"
              step="0.5"
              className="block w-full"
              value={minRating}
              onChange={(e) => setMinRating(parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Any</span>
              <span>5 stars</span>
            </div>
          </div>
          
          {/* Maximum Price */}
          <div>
            <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Price: {maxPrice ? formatCurrency(maxPrice) : 'Any'}
            </label>
            <input
              type="range"
              id="max-price"
              min="100"
              max="10000"
              step="100"
              className="block w-full"
              value={maxPrice || 10000}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                setMaxPrice(value >= 10000 ? undefined : value);
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>$100</span>
              <span>$10,000+</span>
            </div>
          </div>
          
          {/* Additional Filters */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                id="verified-only"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={showVerifiedOnly}
                onChange={(e) => setShowVerifiedOnly(e.target.checked)}
              />
              <label htmlFor="verified-only" className="ml-2 text-sm text-gray-700">
                Verified Vendors Only
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="featured-only"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={showFeaturedOnly}
                onChange={(e) => setShowFeaturedOnly(e.target.checked)}
              />
              <label htmlFor="featured-only" className="ml-2 text-sm text-gray-700">
                Featured Vendors Only
              </label>
            </div>
          </div>
          
          {/* Sort Options */}
          <div>
            <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <div className="flex space-x-2">
              <select
                id="sort-by"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
              >
                <option value="rating">Rating</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="date_created">Newest</option>
                <option value="popularity">Popularity</option>
              </select>
              
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          {/* Reset Filters Button */}
          <div>
            <button
              type="button"
              onClick={resetFilters}
              className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Reset Filters
            </button>
          </div>
        </div>
        
        {/* Vendor Results */}
        <div className="md:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No vendors found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search criteria.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results summary */}
              <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                <span className="text-sm text-gray-600">
                  Showing {filteredVendors.length} {filteredVendors.length === 1 ? 'vendor' : 'vendors'}
                </span>
              </div>
              
              {/* Vendor cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
                    onClick={() => handleVendorSelect(vendor)}
                  >
                    <div className="relative">
                      {/* Vendor image or logo placeholder */}
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {vendor.logoUrl ? (
                          <img
                            src={vendor.logoUrl}
                            alt={`${vendor.name} logo`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold text-gray-400">{vendor.name.charAt(0)}</span>
                        )}
                      </div>
                      
                      {/* Featured tag */}
                      {vendor.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                          Featured
                        </div>
                      )}
                      
                      {/* Verified badge */}
                      {vendor.verified && (
                        <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs font-semibold p-1 rounded-full">
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{vendor.name}</h3>
                          <p className="text-sm text-gray-600">{formatVendorCategoryName(vendor.category)}</p>
                        </div>
                        {renderStars(vendor.rating.overall)}
                      </div>
                      
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 line-clamp-2">{vendor.description}</p>
                      </div>
                      
                      <div className="mt-4 flex flex-wrap gap-1">
                        {vendor.serviceTypes.map((type) => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {formatServiceTypeName(type)}
                          </span>
                        ))}
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span>{vendor.location.city}, {vendor.location.state}</span>
                        </div>
                        
                        <div className="text-sm font-medium text-gray-900">
                          From {formatCurrency(Math.min(...vendor.packages.map((pkg) => pkg.basePrice)))}
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          type="button"
                          className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVendorSelect(vendor);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDirectory; 