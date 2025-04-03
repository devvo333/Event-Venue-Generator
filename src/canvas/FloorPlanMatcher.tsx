import React, { useState, useRef } from 'react';

interface FloorPlanMatcherProps {
  onDimensionsSet: (dimensions: { width: number; height: number; unit: string }) => void;
  onFloorPlanImported: (imageUrl: string) => void;
  onClose: () => void;
}

const FloorPlanMatcher: React.FC<FloorPlanMatcherProps> = ({
  onDimensionsSet,
  onFloorPlanImported,
  onClose,
}) => {
  // State for floor plan dimensions
  const [width, setWidth] = useState<number | ''>('');
  const [height, setHeight] = useState<number | ''>('');
  const [unit, setUnit] = useState<'meters' | 'feet'>('meters');
  const [scale, setScale] = useState<number>(1);
  
  // State for floor plan image
  const [floorPlanImage, setFloorPlanImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Reference to file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    // Create a URL for the image file
    const imageUrl = URL.createObjectURL(file);
    setFloorPlanImage(imageUrl);
    setIsUploading(false);
  };
  
  // Handle apply button click
  const handleApply = () => {
    if (typeof width !== 'number' || typeof height !== 'number' || !width || !height) {
      setUploadError('Please enter valid dimensions');
      return;
    }
    
    if (!floorPlanImage) {
      setUploadError('Please upload a floor plan image');
      return;
    }
    
    // Convert dimensions based on scale and unit
    const scaledWidth = width * scale;
    const scaledHeight = height * scale;
    
    // Call callbacks with floor plan information
    onDimensionsSet({ 
      width: scaledWidth, 
      height: scaledHeight, 
      unit 
    });
    onFloorPlanImported(floorPlanImage);
    onClose();
  };
  
  // Handle dimension input change
  const handleDimensionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number | ''>>
  ) => {
    const value = e.target.value;
    
    if (value === '') {
      setter('');
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setter(numValue);
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-lg w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Import Floor Plan</h2>
        <button 
          className="text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {uploadError && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4">
          {uploadError}
        </div>
      )}
      
      <div className="mb-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
            </div>
          ) : floorPlanImage ? (
            <div className="relative">
              <img 
                src={floorPlanImage} 
                alt="Floor Plan Preview" 
                className="max-h-48 mx-auto"
              />
              <button
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  setFloorPlanImage(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600">Click to upload a floor plan image</p>
              <p className="text-sm text-gray-500 mt-1">PNG, JPG, or SVG (max 5MB)</p>
            </div>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-md font-medium text-gray-700 mb-2">Floor Plan Dimensions</h3>
        <p className="text-sm text-gray-500 mb-3">
          Enter the real-world dimensions of your floor plan
        </p>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Width</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={width}
              onChange={e => handleDimensionChange(e, setWidth)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Width"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Height</label>
            <input
              type="number"
              min="0.1"
              step="0.1"
              value={height}
              onChange={e => handleDimensionChange(e, setHeight)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Height"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <label className="block text-sm text-gray-600 mb-1">Unit</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className={`py-2 border rounded-md ${
                unit === 'meters'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setUnit('meters')}
            >
              Meters
            </button>
            <button
              type="button"
              className={`py-2 border rounded-md ${
                unit === 'feet'
                  ? 'bg-primary border-primary text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => setUnit('feet')}
            >
              Feet
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">Scale (1:{scale})</label>
          <input
            type="range"
            min="1"
            max="100"
            value={scale}
            onChange={(e) => setScale(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1:1</span>
            <span>1:100</span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          onClick={onClose}
        >
          Cancel
        </button>
        <button
          type="button"
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleApply}
          disabled={!floorPlanImage || width === '' || height === ''}
        >
          Apply Floor Plan
        </button>
      </div>
    </div>
  );
};

export default FloorPlanMatcher; 