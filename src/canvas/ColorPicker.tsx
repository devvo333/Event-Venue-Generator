import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
  includeTransparent?: boolean;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  color,
  onChange,
  label,
  includeTransparent = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Preset colors
  const presetColors = [
    '#000000', // Black
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FF8000', // Orange
    '#8000FF', // Purple
    'transparent', // Transparent
  ].filter(c => includeTransparent || c !== 'transparent');

  // Handle closing the picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle color input change
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  // Handle preset color selection
  const handlePresetClick = (presetColor: string) => {
    onChange(presetColor);
    setIsOpen(false);
  };

  // Eyedropper tool
  const handleEyedropper = async () => {
    try {
      // Check if the EyeDropper API is available
      if ('EyeDropper' in window) {
        // @ts-ignore - EyeDropper is not yet in the TypeScript DOM types
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result.sRGBHex) {
          onChange(result.sRGBHex);
        }
      } else {
        console.warn('EyeDropper API not supported in this browser');
      }
    } catch (error) {
      console.error('Error using eyedropper:', error);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {label && <label className="block text-sm text-gray-600 mb-1">{label}</label>}
      
      <div className="flex items-center space-x-2">
        {/* Color preview button that opens the dropdown */}
        <button
          type="button"
          className="w-10 h-10 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            backgroundColor: color === 'transparent' ? 'transparent' : color,
            backgroundImage: color === 'transparent' 
              ? 'repeating-conic-gradient(#CCCCCC 0% 25%, #FFFFFF 0% 50%) 50% / 10px 10px'
              : 'none'
          }}
        >
          {color === 'transparent' && (
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
        
        {/* Current color value input */}
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={color === 'transparent' ? 'transparent' : color}
          onChange={handleColorChange}
        />
      </div>

      {/* Dropdown for color selection */}
      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute left-0 mt-1 w-64 p-3 bg-white rounded-md shadow-lg z-10 border border-gray-200"
        >
          {/* Color input */}
          <div className="mb-3">
            <input
              type="color"
              value={color === 'transparent' ? '#ffffff' : color}
              onChange={handleColorChange}
              className="w-full h-10 border-0 p-0 cursor-pointer"
            />
          </div>
          
          {/* Preset colors */}
          <div className="mb-3">
            <h4 className="text-xs text-gray-500 mb-1">Presets</h4>
            <div className="grid grid-cols-6 gap-1">
              {presetColors.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-8 h-8 rounded-sm border border-gray-300 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: presetColor === 'transparent' ? 'transparent' : presetColor,
                    backgroundImage: presetColor === 'transparent' 
                      ? 'repeating-conic-gradient(#CCCCCC 0% 25%, #FFFFFF 0% 50%) 50% / 8px 8px'
                      : 'none'
                  }}
                  onClick={() => handlePresetClick(presetColor)}
                  title={presetColor === 'transparent' ? 'Transparent' : presetColor}
                >
                  {presetColor === 'transparent' && (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {/* Eyedropper button */}
          <button
            type="button"
            className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 text-sm rounded-md bg-gray-50 hover:bg-gray-100"
            onClick={handleEyedropper}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            Pick color from screen
          </button>
        </div>
      )}
    </div>
  );
};

export default ColorPicker; 