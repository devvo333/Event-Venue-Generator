import React, { useState, useRef } from 'react';
import { aiService, ImageRecognitionParams, ImageRecognitionResponse } from './aiService';

interface ImageRecognitionProps {
  onDimensionsDetected?: (dimensions: { width: number; length: number; height?: number; unit: 'meters' | 'feet' }) => void;
  onFloorPlanGenerated?: (url: string) => void;
}

const ImageRecognition: React.FC<ImageRecognitionProps> = ({ 
  onDimensionsDetected,
  onFloorPlanGenerated
}) => {
  // State for image upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // State for recognition settings
  const [unit, setUnit] = useState<'meters' | 'feet'>('meters');
  const [recognitionMode, setRecognitionMode] = useState<'dimensions' | 'furniture' | 'full'>('dimensions');
  const [hasCalibrationObject, setHasCalibrationObject] = useState(false);
  const [calibrationObject, setCalibrationObject] = useState<{
    type: 'door' | 'table' | 'chair' | 'custom';
    knownSize: number;
  }>({
    type: 'door',
    knownSize: 2.0,
  });
  
  // State for processing
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImageRecognitionResponse | null>(null);
  
  // Reference to file input
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Reset previous results
    setResult(null);
    setError(null);
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    setSelectedImage(file);
    
    // Create a preview URL
    const imageUrl = URL.createObjectURL(file);
    setImagePreview(imageUrl);
  };
  
  // Handle calibration object change
  const handleCalibrationTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as 'door' | 'table' | 'chair' | 'custom';
    
    // Set default known sizes based on object type
    let knownSize = calibrationObject.knownSize;
    if (type === 'door' && unit === 'meters') knownSize = 2.0;
    if (type === 'door' && unit === 'feet') knownSize = 6.56;
    if (type === 'table' && unit === 'meters') knownSize = 0.75;
    if (type === 'table' && unit === 'feet') knownSize = 2.46;
    if (type === 'chair' && unit === 'meters') knownSize = 0.5;
    if (type === 'chair' && unit === 'feet') knownSize = 1.64;
    
    setCalibrationObject({
      type,
      knownSize
    });
  };
  
  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value as 'meters' | 'feet';
    setUnit(newUnit);
    
    // Convert calibration object size when unit changes
    if (newUnit !== unit) {
      const { knownSize, type } = calibrationObject;
      let newKnownSize: number;
      
      if (newUnit === 'feet') {
        // Convert meters to feet
        newKnownSize = knownSize * 3.28084;
      } else {
        // Convert feet to meters
        newKnownSize = knownSize / 3.28084;
      }
      
      setCalibrationObject({
        type,
        knownSize: parseFloat(newKnownSize.toFixed(2))
      });
    }
  };
  
  // Handle image processing
  const handleProcessImage = async () => {
    if (!selectedImage) {
      setError('Please select an image to process');
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Create params object
      const params: ImageRecognitionParams = {
        imageFile: selectedImage,
        imageUrl: imagePreview || undefined,
        recognitionMode,
        unit
      };
      
      // Add calibration object if enabled
      if (hasCalibrationObject) {
        params.calibrationObject = calibrationObject;
      }
      
      // Call AI service to process image
      const response = await aiService.processImageForDimensions(params);
      
      // Set result
      setResult(response);
      
      // Call callbacks if provided
      if (response.dimensions && onDimensionsDetected) {
        onDimensionsDetected(response.dimensions);
      }
      
      if (response.floorPlanUrl && onFloorPlanGenerated) {
        onFloorPlanGenerated(response.floorPlanUrl);
      }
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle reset
  const handleReset = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Render functions for different sections
  const renderImageUploadSection = () => (
    <div className="p-6 bg-white rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Venue Image</h3>
      
      <div 
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {imagePreview ? (
          <div className="relative max-h-96 overflow-hidden">
            <img 
              src={imagePreview} 
              alt="Selected venue" 
              className="max-w-full max-h-80 mx-auto rounded-lg"
            />
            <button
              className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-gray-100"
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500 mt-1">PNG, JPG or HEIC (max 10MB)</p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
  
  const renderRecognitionSettings = () => (
    <div className="p-6 bg-white rounded-lg border border-gray-200 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Recognition Settings</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="recognitionMode" className="block text-sm font-medium text-gray-700 mb-1">
            Recognition Mode
          </label>
          <select
            id="recognitionMode"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={recognitionMode}
            onChange={(e) => setRecognitionMode(e.target.value as any)}
          >
            <option value="dimensions">Dimensions Only</option>
            <option value="furniture">Dimensions & Furniture</option>
            <option value="full">Full Analysis</option>
          </select>
          <p className="mt-1 text-xs text-gray-500">
            "Dimensions Only" is fastest. "Full Analysis" detects furniture and generates a floor plan.
          </p>
        </div>
        
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
            Unit of Measurement
          </label>
          <select
            id="unit"
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            value={unit}
            onChange={handleUnitChange}
          >
            <option value="meters">Meters</option>
            <option value="feet">Feet</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6">
        <div className="flex items-center mb-3">
          <input
            id="hasCalibration"
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            checked={hasCalibrationObject}
            onChange={(e) => setHasCalibrationObject(e.target.checked)}
          />
          <label htmlFor="hasCalibration" className="ml-2 block text-sm font-medium text-gray-700">
            Use calibration object for improved accuracy
          </label>
        </div>
        
        {hasCalibrationObject && (
          <div className="pl-6 border-l-2 border-indigo-100 ml-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <label htmlFor="calibrationType" className="block text-sm font-medium text-gray-700 mb-1">
                  Calibration Object Type
                </label>
                <select
                  id="calibrationType"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={calibrationObject.type}
                  onChange={handleCalibrationTypeChange}
                >
                  <option value="door">Standard Door</option>
                  <option value="table">Table</option>
                  <option value="chair">Chair</option>
                  <option value="custom">Custom Object</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="knownSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Known Size ({unit})
                </label>
                <input
                  id="knownSize"
                  type="number"
                  step="0.01"
                  min="0.1"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={calibrationObject.knownSize}
                  onChange={(e) => setCalibrationObject({
                    ...calibrationObject,
                    knownSize: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
            </div>
            
            <p className="mt-2 text-xs text-gray-500">
              If your image contains an object with known dimensions (like a standard door), 
              our AI can use it as a reference to improve measurement accuracy.
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-6">
        <button
          type="button"
          className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            !selectedImage || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          onClick={handleProcessImage}
          disabled={!selectedImage || isProcessing}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Image...
            </>
          ) : (
            'Analyze Image'
          )}
        </button>
      </div>
    </div>
  );
  
  const renderResults = () => {
    if (!result) return null;
    
    return (
      <div className="p-6 bg-white rounded-lg border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recognition Results</h3>
        
        <div className="bg-indigo-50 border border-indigo-100 rounded-md p-4 mb-6">
          <div className="flex items-start">
            <div className={`shrink-0 ${
              result.status === 'success' 
                ? 'text-green-500' 
                : result.status === 'partial' 
                  ? 'text-yellow-500' 
                  : 'text-red-500'
            }`}>
              {result.status === 'success' ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : result.status === 'partial' ? (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${
                result.status === 'success' 
                  ? 'text-green-800' 
                  : result.status === 'partial' 
                    ? 'text-yellow-800' 
                    : 'text-red-800'
              }`}>
                {result.status === 'success' 
                  ? 'Recognition Complete!' 
                  : result.status === 'partial' 
                    ? 'Partial Recognition' 
                    : 'Recognition Failed'}
              </h3>
              <div className="mt-1 text-sm text-gray-700">
                {result.message}
              </div>
            </div>
          </div>
        </div>
        
        {result.dimensions && (
          <div className="bg-white border border-gray-200 rounded-md p-4 mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Detected Dimensions</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Width</p>
                <p className="text-xl font-semibold">{result.dimensions.width} {result.dimensions.unit}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Length</p>
                <p className="text-xl font-semibold">{result.dimensions.length} {result.dimensions.unit}</p>
              </div>
              {result.dimensions.height && (
                <div>
                  <p className="text-sm text-gray-500">Height</p>
                  <p className="text-xl font-semibold">{result.dimensions.height} {result.dimensions.unit}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Confidence</p>
                <p className="text-xl font-semibold">{result.dimensions.confidence}%</p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Total Area: <span className="font-semibold">{(result.dimensions.width * result.dimensions.length).toFixed(2)} {result.dimensions.unit}²</span>
              </p>
            </div>
          </div>
        )}
        
        {result.annotatedImageUrl && (
          <div className="mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Annotated Image</h4>
            <div className="border border-gray-200 rounded-md overflow-hidden">
              <img 
                src={result.annotatedImageUrl} 
                alt="Annotated venue" 
                className="max-w-full h-auto"
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              AI-generated annotations showing detected dimensions and reference points.
            </p>
          </div>
        )}
        
        {result.recognizedObjects && result.recognizedObjects.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-4 mb-6">
            <h4 className="text-md font-medium text-gray-800 mb-3">Recognized Objects</h4>
            <div className="space-y-2">
              {result.recognizedObjects.map((obj, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                    <span className="text-gray-800 capitalize">{obj.type}</span>
                  </div>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                    {obj.count} detected
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            type="button"
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleReset}
          >
            Upload New Image
          </button>
          
          {result.floorPlanUrl && (
            <button
              type="button"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => onFloorPlanGenerated?.(result.floorPlanUrl)}
            >
              Use Generated Floor Plan
            </button>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="image-recognition">
      {/* Tips section */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-100 mb-6">
        <h3 className="flex items-center text-blue-800 text-md font-medium mb-2">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Tips for Best Results
        </h3>
        <ul className="space-y-1 text-sm text-blue-700 ml-7 list-disc">
          <li>Use well-lit, clear images showing the entire venue space</li>
          <li>Include standard objects (doors, tables) that can serve as size references</li>
          <li>Take photos from a high vantage point to capture the whole floor</li>
          <li>Avoid extreme angles - straight-on shots work best</li>
          <li>Include rulers or measuring tapes in the image if available</li>
        </ul>
      </div>
      
      {/* Content */}
      {renderImageUploadSection()}
      {selectedImage && !result && renderRecognitionSettings()}
      {result && renderResults()}
    </div>
  );
};

export default ImageRecognition; 