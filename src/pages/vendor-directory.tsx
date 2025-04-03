import React, { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import SimpleLayout from '../components/layouts/SimpleLayout';
import VendorDirectory from '../components/vendors/VendorDirectory';
import VendorDetails from '../components/vendors/VendorDetails';
import { Vendor } from '../utils/vendorManager';

const VendorDirectoryPage: NextPage = () => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  
  // Handle vendor selection
  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    // Scroll to top when a vendor is selected
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Handle closing vendor details
  const handleCloseVendorDetails = () => {
    setSelectedVendor(null);
  };
  
  // Handle vendor booking
  const handleBookVendor = (vendor: Vendor, packageId: string) => {
    // In a real app, this would navigate to a booking page or open a booking modal
    alert(`Booking ${vendor.name} with package ID: ${packageId}`);
  };
  
  return (
    <>
      <Head>
        <title>Vendor Directory | Event Venue Generator</title>
        <meta name="description" content="Find the perfect vendors for your event with our comprehensive vendor directory" />
      </Head>
      
      <SimpleLayout title="Vendor Directory" description="Discover and connect with top-rated event vendors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Vendor Directory</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Connect with trusted vendors for your event. Browse our curated selection of event
              professionals across various categories, read reviews, and request quotes all in one place.
            </p>
          </div>
          
          {/* Selected vendor details */}
          {selectedVendor && (
            <div className="mb-8">
              <VendorDetails
                vendor={selectedVendor}
                onClose={handleCloseVendorDetails}
                onBookVendor={handleBookVendor}
              />
            </div>
          )}
          
          {/* Vendor directory */}
          <VendorDirectory 
            onVendorSelect={handleVendorSelect}
          />
          
          {/* Additional information */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Why Use Our Vendor Directory?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verified Vendors</h3>
                <p className="text-gray-600">
                  All vendors in our directory undergo a verification process to ensure quality and reliability.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Compare Options</h3>
                <p className="text-gray-600">
                  Easily compare vendors, services, and prices to find the perfect match for your event and budget.
                </p>
              </div>
              
              <div className="bg-white p-5 rounded-lg shadow-sm">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mb-4">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Streamlined Booking</h3>
                <p className="text-gray-600">
                  Book vendors directly through our platform, track your bookings, and manage all your event services in one place.
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-4 border border-blue-200 rounded-md bg-blue-50">
              <h3 className="text-md font-medium text-blue-800 mb-2">Looking to Join as a Vendor?</h3>
              <p className="text-blue-700 text-sm mb-3">
                Are you an event service provider interested in joining our directory? We're always looking for qualified vendors to join our platform.
              </p>
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply to Join
              </button>
            </div>
          </div>
        </div>
      </SimpleLayout>
    </>
  );
};

export default VendorDirectoryPage; 