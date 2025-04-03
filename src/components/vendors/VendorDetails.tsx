import React, { useState } from 'react';
import { 
  Vendor, 
  VendorPackage,
  ServiceType,
  formatVendorCategoryName,
  formatServiceTypeName,
  calculateVendorBookingCost
} from '../../utils/vendorManager';

interface VendorDetailsProps {
  vendor: Vendor;
  onClose?: () => void;
  onBookVendor?: (vendor: Vendor, packageId: string) => void;
  className?: string;
}

const VendorDetails: React.FC<VendorDetailsProps> = ({
  vendor,
  onClose,
  onBookVendor,
  className = '',
}) => {
  const [selectedPackage, setSelectedPackage] = useState<string>(vendor.packages[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(100);
  const [hours, setHours] = useState<number>(4);
  
  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // Calculate package cost
  const calculateCost = (): { basePrice: number; additionalFees: Record<string, number>; total: number } => {
    try {
      return calculateVendorBookingCost(vendor, selectedPackage, quantity, hours);
    } catch (error) {
      return { basePrice: 0, additionalFees: {}, total: 0 };
    }
  };
  
  const costBreakdown = calculateCost();
  
  // Handle booking
  const handleBookVendor = () => {
    if (onBookVendor) {
      onBookVendor(vendor, selectedPackage);
    }
  };
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    
    return (
      <div className="flex">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden ${className}`}>
      {/* Header */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-blue-700">
        {/* Vendor logo or image */}
        <div className="absolute bottom-0 left-0 right-0 h-full flex items-center justify-center">
          {vendor.logoUrl ? (
            <img
              src={vendor.logoUrl}
              alt={`${vendor.name} logo`}
              className="h-24 w-auto object-contain bg-white rounded-lg p-2 shadow-md"
            />
          ) : (
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center shadow-md">
              <span className="text-3xl font-bold text-blue-600">{vendor.name.charAt(0)}</span>
            </div>
          )}
        </div>
        
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            className="absolute top-4 right-4 text-white hover:text-gray-200"
            onClick={onClose}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Verified badge */}
        {vendor.verified && (
          <div className="absolute top-4 left-4 bg-white text-blue-600 rounded-full p-1">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Vendor info */}
      <div className="p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{vendor.name}</h1>
          <p className="text-gray-600">{formatVendorCategoryName(vendor.category)}</p>
          
          <div className="mt-2 flex items-center justify-center">
            {renderStars(vendor.rating.overall)}
            <span className="ml-2 text-gray-600">{vendor.rating.overall.toFixed(1)} ({vendor.rating.reviewCount} reviews)</span>
          </div>
          
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {vendor.serviceTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {formatServiceTypeName(type)}
              </span>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">About {vendor.name}</h2>
              <p className="text-gray-700">{vendor.description}</p>
            </div>
            
            {/* Packages */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Service Packages</h2>
              
              <div className="space-y-4">
                {vendor.packages.map((pkg) => (
                  <div 
                    key={pkg.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPackage === pkg.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => setSelectedPackage(pkg.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900">{pkg.name}</h3>
                      <div className="text-gray-900 font-medium">
                        {formatCurrency(pkg.basePrice)}
                        {pkg.priceType !== 'flat' && (
                          <span className="text-sm text-gray-500 ml-1">
                            {pkg.priceType === 'per_person' ? '/person' : '/hour'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    
                    <div className="text-sm text-gray-700">
                      <h4 className="font-medium mb-1">Included Services:</h4>
                      <ul className="list-disc pl-5 mb-2">
                        {pkg.services.map((service, index) => (
                          <li key={index}>{service}</li>
                        ))}
                      </ul>
                      
                      {pkg.includedItems.length > 0 && (
                        <>
                          <h4 className="font-medium mb-1">Included Items:</h4>
                          <ul className="list-disc pl-5 mb-2">
                            {pkg.includedItems.map((item, index) => (
                              <li key={index}>{item}</li>
                            ))}
                          </ul>
                        </>
                      )}
                      
                      <div className="flex items-center mt-2">
                        <svg className={`h-5 w-5 ${pkg.includesDelivery ? 'text-green-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                          {pkg.includesDelivery ? (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                        <span className="ml-2 text-sm text-gray-600">
                          {pkg.includesDelivery ? 'Includes delivery' : 'Delivery not included'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Reviews */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Reviews</h2>
              
              {vendor.rating.reviews.length > 0 ? (
                <div className="space-y-4">
                  {vendor.rating.reviews.slice(0, 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-4">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-900">{review.userName}</span>
                        <span className="text-sm text-gray-500">{formatDate(review.date)}</span>
                      </div>
                      
                      <div className="flex items-center mb-2">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">{review.eventType}</span>
                      </div>
                      
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                  
                  {vendor.rating.reviews.length > 3 && (
                    <div className="text-center pt-2">
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View all {vendor.rating.reviews.length} reviews
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet.</p>
              )}
            </div>
          </div>
          
          {/* Right column - Contact and Booking */}
          <div className="space-y-6">
            {/* Contact information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h2>
              
              <div className="space-y-3">
                <div className="flex">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-gray-700">{vendor.phone}</span>
                </div>
                
                <div className="flex">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-gray-700">{vendor.email}</span>
                </div>
                
                {vendor.website && (
                  <div className="flex">
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                    <a 
                      href={vendor.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {vendor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  </div>
                )}
                
                <div className="flex">
                  <svg className="h-5 w-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    {vendor.location.address}, {vendor.location.city}, {vendor.location.state} {vendor.location.zipCode}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Booking calculator */}
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Cost Estimate</h2>
              
              <div className="space-y-4">
                {/* Quantity input (for per-person pricing) */}
                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                {/* Hours input (for hourly pricing) */}
                <div>
                  <label htmlFor="hours" className="block text-sm font-medium text-gray-700 mb-1">
                    Event Duration (hours)
                  </label>
                  <input
                    type="number"
                    id="hours"
                    min="1"
                    value={hours}
                    onChange={(e) => setHours(Math.max(1, parseInt(e.target.value) || 1))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                
                {/* Cost breakdown */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">{formatCurrency(costBreakdown.basePrice)}</span>
                  </div>
                  
                  {Object.entries(costBreakdown.additionalFees).map(([name, amount]) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-gray-600">{name}:</span>
                      <span>{formatCurrency(amount)}</span>
                    </div>
                  ))}
                  
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-medium">Total Estimate:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(costBreakdown.total)}</span>
                  </div>
                </div>
                
                {/* Book button */}
                <button
                  type="button"
                  onClick={handleBookVendor}
                  className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Book Now
                </button>
                
                <p className="text-xs text-gray-500 text-center">
                  Booking requires {vendor.packages.find(pkg => pkg.id === selectedPackage)?.availability.leadTimeRequired || 'advance'} days notice
                </p>
              </div>
            </div>
            
            {/* Additional info */}
            <div className="text-sm space-y-3">
              {vendor.cancellationPolicy && (
                <div>
                  <h3 className="font-medium text-gray-900">Cancellation Policy:</h3>
                  <p className="text-gray-700">{vendor.cancellationPolicy}</p>
                </div>
              )}
              
              {vendor.insurance?.hasInsurance && (
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">
                    Insured
                    {vendor.insurance.coverageAmount && ` (${formatCurrency(vendor.insurance.coverageAmount)} coverage)`}
                  </span>
                </div>
              )}
              
              {vendor.location.willTravel && (
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1v-1h3a1 1 0 001-1v-3.17a3 3 0 00-.879-2.12l-2.828-2.83A3 3 0 009.172 4H3zm0 2h2v2H3V6zm0 3h2v2H3V9zm9.707-4.707l2.828 2.83a1 1 0 01.293.707V12H10V6.83a1 1 0 01.293-.707L11 5.415v.002l1.707-1.124z" />
                  </svg>
                  <span className="text-gray-700">
                    Willing to travel
                    {vendor.location.travelFees && ` (${vendor.location.travelFees})`}
                  </span>
                </div>
              )}
              
              <div className="flex items-center">
                <svg className="h-5 w-5 text-gray-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">
                  Payment methods: {vendor.preferredPaymentMethods.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails; 