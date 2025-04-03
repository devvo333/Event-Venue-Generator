import { useState, useEffect, useRef } from 'react';
import { Asset } from '@/types/assets';

interface TextEditorProps {
  asset: Asset;
  onSave: (updatedAsset: Partial<Asset>) => void;
  onCancel: () => void;
  position: { x: number, y: number };
}

const TextEditor: React.FC<TextEditorProps> = ({
  asset,
  onSave,
  onCancel,
  position
}) => {
  const [text, setText] = useState(asset.text || '');
  const [fontSize, setFontSize] = useState(asset.fontSize || 24);
  const [fontFamily, setFontFamily] = useState(asset.fontFamily || 'Arial');
  const [color, setColor] = useState(asset.fill || '#000000');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the text input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);
  
  // Available font families
  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana',
    'Tahoma'
  ];

  const handleSave = () => {
    onSave({
      text,
      fontSize,
      fontFamily,
      fill: color
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div 
      className="absolute bg-white shadow-lg rounded-lg p-4 z-50"
      style={{ 
        left: position.x,
        top: position.y,
        minWidth: '300px'
      }}
    >
      <div className="flex flex-col space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Text
          </label>
          <textarea
            ref={inputRef}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />
          <p className="mt-1 text-xs text-gray-500">
            Press Ctrl+Enter to save, Esc to cancel
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Font Size
            </label>
            <input
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              min={8}
              max={72}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 border-0 p-0"
              />
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {fontFamilies.map((font) => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextEditor; 