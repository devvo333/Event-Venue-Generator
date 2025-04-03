import React, { useState } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import SimpleLayout from '../components/layouts/SimpleLayout';
import VenueCapacityCalculator from '../components/venues/VenueCapacityCalculator';
import { VenueDimensions } from '../utils/capacityCalculator';

const VenueCapacityPage: NextPage = () => {
  const [venueDimensions, setVenueDimensions] = useState<VenueDimensions>({
    width: 20,
    height: 15,
    unit: 'meters'
  });
  
  const [showCustomDimensions, setShowCustomDimensions] = useState(false);
  
  // Predefined venue sizes
  const venueSizes = [
    { name: 'Small Hall', width: 10, height: 8, unit: 'meters' as const },
    { name: 'Medium Ballroom', width: 20, height: 15, unit: 'meters' as const },
    { name: 'Large Conference Center', width: 30, height: 25, unit: 'meters' as const },
    { name: 'Grand Exhibition Hall', width: 50, height: 40, unit: 'meters' as const },
  ];
  
  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVenueDimensions(prev => ({
      ...prev,
      [name]: name === 'unit' ? value : parseFloat(value),
    }));
  };
  
  const handleVenueSizeSelect = (width: number, height: number, unit: 'meters' | 'feet') => {
    setVenueDimensions({ width, height, unit });
    setShowCustomDimensions(false);
  };
  
  return (
    <>
      <Head>
        <title>Venue Capacity Calculator | Event Venue Generator</title>
        <meta name="description" content="Calculate capacity for different event layouts and requirements" />
      </Head>
      
      <SimpleLayout title="Venue Capacity Calculator" description="Determine the optimal capacity for your venue based on layout and requirements">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Venue Capacity Calculator</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Determine the optimal capacity for your venue based on different seating layouts, 
              event types, and additional requirements such as stages, bars, and dance floors.
            </p>
          </div>
          
          {/* Venue selection section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Venue Size</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {venueSizes.map((size, index) => (
                <button
                  key={index}
                  onClick={() => handleVenueSizeSelect(size.width, size.height, size.unit)}
                  className={`border rounded-lg p-4 text-center transition hover:bg-blue-50 ${
                    !showCustomDimensions && 
                    venueDimensions.width === size.width && 
                    venueDimensions.height === size.height
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="block font-medium text-gray-900">{size.name}</span>
                  <span className="text-sm text-gray-500">
                    {size.width}m × {size.height}m ({(size.width * size.height).toLocaleString()} m²)
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="custom-dimensions"
                  type="checkbox"
                  checked={showCustomDimensions}
                  onChange={() => setShowCustomDimensions(!showCustomDimensions)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="custom-dimensions" className="ml-2 block text-sm text-gray-700">
                  Use custom venue dimensions
                </label>
              </div>
            </div>
            
            {showCustomDimensions && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="width" className="block text-sm font-medium text-gray-700">
                    Width
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="width"
                      id="width"
                      min="1"
                      value={venueDimensions.width}
                      onChange={handleDimensionChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Width"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">meters</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="height" className="block text-sm font-medium text-gray-700">
                    Length
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="number"
                      name="height"
                      id="height"
                      min="1"
                      value={venueDimensions.height}
                      onChange={handleDimensionChange}
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="Length"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">meters</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="totalArea" className="block text-sm font-medium text-gray-700">
                    Total Area
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="text"
                      name="totalArea"
                      id="totalArea"
                      value={`${(venueDimensions.width * venueDimensions.height).toLocaleString()} m²`}
                      disabled
                      className="bg-gray-50 block w-full pl-3 pr-12 sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Capacity calculator component */}
          <VenueCapacityCalculator venueDimensions={venueDimensions} className="mb-8" />
          
          {/* Informational section */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">About Venue Capacity Calculations</h2>
            
            <div className="prose max-w-none">
              <p>
                Properly calculating venue capacity is essential for event planning, safety compliance, and optimal guest experience.
                This calculator considers industry standards for space requirements across different layouts:
              </p>
              
              <ul>
                <li><strong>Standing (Reception):</strong> 0.5-0.8 m² per person</li>
                <li><strong>Theater Style:</strong> 0.8-1.0 m² per person</li>
                <li><strong>Classroom Style:</strong> 1.5-1.8 m² per person</li>
                <li><strong>Banquet Style:</strong> 1.5-2.0 m² per person</li>
                <li><strong>Cabaret Style:</strong> 2.0-2.5 m² per person</li>
              </ul>
              
              <p>
                The calculator also accounts for:
              </p>
              
              <ul>
                <li>Circulation space (aisles, walkways)</li>
                <li>Fixed venue elements and obstructions</li>
                <li>Additional features like stages, bars, and dance floors</li>
                <li>Safety margins for comfortable occupancy</li>
                <li>Social distancing requirements when needed</li>
              </ul>
              
              <p>
                For official event permitting and safety compliance, always consult with local authorities and fire safety officials regarding maximum occupancy regulations.
              </p>
            </div>
          </div>
        </div>
      </SimpleLayout>
    </>
  );
};

export default VenueCapacityPage; 