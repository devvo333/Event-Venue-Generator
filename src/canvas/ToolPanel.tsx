import { Asset } from '@/types/assets'
import ColorPicker from './ColorPicker'
import { useState } from 'react'
import Modal from '../components/ui/modal'
import LayoutSuggestions from '../ai/LayoutSuggestions'
import StyleRecommendations from '../ai/StyleRecommendations'

interface GridSettings {
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;
  snapToGrid: boolean;
  setSnapToGrid: (snap: boolean) => void;
}

interface AlignmentSettings {
  enableAlignment: boolean;
  setEnableAlignment: (enable: boolean) => void;
}

interface RulerSettings {
  showRulers: boolean;
  setShowRulers: (show: boolean) => void;
  rulerUnit: 'px' | 'cm' | 'in';
  setRulerUnit: (unit: 'px' | 'cm' | 'in') => void;
}

interface ShapeSettings {
  currentShape: 'rectangle' | 'circle' | 'line' | 'arrow';
  setCurrentShape: (shape: 'rectangle' | 'circle' | 'line' | 'arrow') => void;
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
  strokeColor: string;
  setStrokeColor: (color: string) => void;
  fillColor: string;
  setFillColor: (color: string) => void;
}

interface ToolPanelProps {
  toolMode: 'select' | 'move' | 'scale' | 'rotate' | 'text' | 'shape'
  setToolMode: (mode: 'select' | 'move' | 'scale' | 'rotate' | 'text' | 'shape') => void
  selectedAsset: Asset | undefined
  updateAsset: (asset: Asset) => void
  deleteAsset: () => void
  gridSettings?: GridSettings
  alignmentSettings?: AlignmentSettings
  rulerSettings?: RulerSettings
  shapeSettings?: ShapeSettings
  venueId?: string
}

const ToolPanel: React.FC<ToolPanelProps> = ({
  toolMode,
  setToolMode,
  selectedAsset,
  updateAsset,
  deleteAsset,
  gridSettings,
  alignmentSettings,
  rulerSettings,
  shapeSettings,
  venueId,
}) => {
  const toolButtons = [
    {
      id: 'select',
      label: 'Select',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l4-4 4 4m0 6l-4 4-4-4"
          />
        </svg>
      ),
    },
    {
      id: 'move',
      label: 'Move',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 11l5-5m0 0l5 5m-5-5v12"
          />
        </svg>
      ),
    },
    {
      id: 'scale',
      label: 'Scale',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5"
          />
        </svg>
      ),
    },
    {
      id: 'rotate',
      label: 'Rotate',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      ),
    },
    {
      id: 'text',
      label: 'Text',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
          />
        </svg>
      ),
    },
    {
      id: 'shape',
      label: 'Shape',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"
          />
        </svg>
      ),
    },
  ]

  const handleScaleChange = (value: number) => {
    if (!selectedAsset) return
    
    updateAsset({
      ...selectedAsset,
      scaleX: value,
      scaleY: value,
    })
  }

  const handleRotateChange = (value: number) => {
    if (!selectedAsset) return
    
    updateAsset({
      ...selectedAsset,
      rotation: value,
    })
  }

  // Render the grid settings panel when no asset is selected
  const renderGridSettings = () => {
    if (!gridSettings) return null;
    
    const { showGrid, setShowGrid, gridSize, setGridSize, snapToGrid, setSnapToGrid } = gridSettings;
    
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Grid Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Show Grid</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                showGrid ? 'bg-primary' : 'bg-gray-200'
              }`}
              onClick={() => setShowGrid(!showGrid)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showGrid ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Snap to Grid</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                snapToGrid ? 'bg-primary' : 'bg-gray-200'
              }`}
              onClick={() => setSnapToGrid(!snapToGrid)}
              disabled={!showGrid}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  snapToGrid ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Grid Size</label>
            <div className="flex items-center">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={gridSize}
                onChange={(e) => setGridSize(parseInt(e.target.value))}
                className="flex-1 mr-2"
                disabled={!showGrid}
              />
              <span className="text-sm text-gray-500 w-8">{gridSize}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render alignment settings
  const renderAlignmentSettings = () => {
    if (!alignmentSettings) return null;
    
    const { enableAlignment, setEnableAlignment } = alignmentSettings;
    
    return (
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Alignment Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Alignment Guides</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                enableAlignment ? 'bg-primary' : 'bg-gray-200'
              }`}
              onClick={() => setEnableAlignment(!enableAlignment)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  enableAlignment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render ruler settings
  const renderRulerSettings = () => {
    if (!rulerSettings) return null;
    
    const { showRulers, setShowRulers, rulerUnit, setRulerUnit } = rulerSettings;
    
    return (
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Ruler Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Show Rulers</span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                showRulers ? 'bg-primary' : 'bg-gray-200'
              }`}
              onClick={() => setShowRulers(!showRulers)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  showRulers ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-2">Ruler Units</label>
            <div className="grid grid-cols-3 gap-2">
              {(['px', 'cm', 'in'] as const).map((unit) => (
                <button
                  key={unit}
                  className={`py-1 px-2 text-sm rounded ${
                    rulerUnit === unit
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setRulerUnit(unit)}
                  disabled={!showRulers}
                >
                  {unit.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render shape settings
  const renderShapeSettings = () => {
    if (!shapeSettings) return null;
    
    const { 
      currentShape, 
      setCurrentShape, 
      strokeWidth, 
      setStrokeWidth, 
      strokeColor, 
      setStrokeColor, 
      fillColor, 
      setFillColor 
    } = shapeSettings;
    
    return (
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Shape Settings</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-2">Shape Type</label>
            <div className="grid grid-cols-4 gap-2">
              <button
                className={`p-2 rounded flex items-center justify-center ${
                  currentShape === 'rectangle' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setCurrentShape('rectangle')}
                title="Rectangle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" rx="1" strokeWidth="2" />
                </svg>
              </button>
              <button
                className={`p-2 rounded flex items-center justify-center ${
                  currentShape === 'circle' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setCurrentShape('circle')}
                title="Circle"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" strokeWidth="2" />
                </svg>
              </button>
              <button
                className={`p-2 rounded flex items-center justify-center ${
                  currentShape === 'line' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setCurrentShape('line')}
                title="Line"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <line x1="5" y1="19" x2="19" y2="5" strokeWidth="2" />
                </svg>
              </button>
              <button
                className={`p-2 rounded flex items-center justify-center ${
                  currentShape === 'arrow' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setCurrentShape('arrow')}
                title="Arrow"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
            
          <div>
            <label className="block text-sm text-gray-600 mb-1">Stroke Width</label>
            <div className="flex items-center">
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                className="flex-1 mr-2"
              />
              <span className="text-sm text-gray-500 w-6">{strokeWidth}</span>
            </div>
          </div>
            
          <ColorPicker
            color={strokeColor}
            onChange={setStrokeColor}
            label="Stroke Color"
          />
            
          <ColorPicker
            color={fillColor}
            onChange={setFillColor}
            label="Fill Color"
            includeTransparent={true}
          />
        </div>
      </div>
    );
  };

  // Add a new function to render keyboard shortcuts
  const renderKeyboardShortcuts = () => {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">Keyboard Shortcuts</h3>
          <button
            type="button"
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => setShowShortcuts(!showShortcuts)}
          >
            {showShortcuts ? 'Hide' : 'Show'}
          </button>
        </div>
        
        {showShortcuts && (
          <div className="bg-gray-50 rounded-md p-3 text-sm">
            <h4 className="font-medium text-gray-700 mb-2">Tool Selection</h4>
            <ul className="space-y-1 mb-3">
              <li className="flex justify-between">
                <span className="text-gray-600">Select Tool</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">V</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Move Tool</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">M</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Scale Tool</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">E</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Rotate Tool</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">R</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Text Tool</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">T</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Shape Tool</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">S</kbd>
              </li>
            </ul>
            
            <h4 className="font-medium text-gray-700 mb-2">Shape Types</h4>
            <ul className="space-y-1">
              <li className="flex justify-between">
                <span className="text-gray-600">Rectangle</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">R</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Circle</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">C</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Line</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">L</kbd>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Arrow</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs">A</kbd>
              </li>
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Add state for showing/hiding shortcuts
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [showStyleRecommendations, setShowStyleRecommendations] = useState(false);

  const handleApplyAILayout = (layoutId: string) => {
    console.log('Applying AI layout:', layoutId);
    setShowAISuggestions(false);
  };
  
  const handleApplyStyle = (styleId: string, palette: string[]) => {
    console.log('Applying style:', styleId, palette);
    setShowStyleRecommendations(false);
    // Here you would apply the selected style to the current layout
    // This might involve changing colors, adding decorative elements, etc.
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Tools</h2>
        
        <div className="grid grid-cols-4 gap-2 mb-6">
          {toolButtons.map((tool) => (
            <button
              key={tool.id}
              className={`flex flex-col items-center justify-center p-2 rounded ${
                toolMode === tool.id
                  ? 'bg-primary bg-opacity-10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setToolMode(tool.id as any)}
            >
              {tool.icon}
              <span className="text-xs mt-1">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedAsset ? (
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Asset</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-semibold">{selectedAsset.name}</p>
              <p className="text-xs text-gray-500 capitalize">{selectedAsset.category}</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Scale</h3>
            <div className="flex items-center">
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedAsset.scaleX || 1}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                className="flex-1 mr-2"
              />
              <span className="text-sm text-gray-500 w-12">
                {(selectedAsset.scaleX || 1).toFixed(1)}x
              </span>
            </div>
          </div>
          
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Rotation</h3>
            <div className="flex items-center">
              <input
                type="range"
                min="0"
                max="360"
                step="1"
                value={selectedAsset.rotation || 0}
                onChange={(e) => handleRotateChange(parseInt(e.target.value))}
                className="flex-1 mr-2"
              />
              <span className="text-sm text-gray-500 w-12">
                {Math.round(selectedAsset.rotation || 0)}°
              </span>
            </div>
          </div>
          
          <div>
            <button
              type="button"
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={deleteAsset}
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete Asset
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {renderGridSettings()}
          {renderAlignmentSettings()}
          {renderRulerSettings()}
          {renderShapeSettings()}
          {renderKeyboardShortcuts()}
        </div>
      )}

      <div className="tool-section">
        <h3 className="tool-section-title">AI Tools</h3>
        <div className="tool-grid">
          <button
            className="tool-button ai-suggestions-button"
            onClick={() => setShowAISuggestions(true)}
            title="Generate AI Layout Suggestions"
          >
            <span className="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </span>
            <span className="tool-name">AI Layout Suggestions</span>
          </button>
          
          <button
            className="tool-button style-recommendations-button"
            onClick={() => setShowStyleRecommendations(true)}
            title="Get AI Style Recommendations"
          >
            <span className="tool-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
              </svg>
            </span>
            <span className="tool-name">AI Style Recommendations</span>
          </button>
        </div>
      </div>
      
      {showAISuggestions && (
        <Modal
          isOpen={showAISuggestions}
          onClose={() => setShowAISuggestions(false)}
          title="AI Layout Suggestions"
          size="large"
        >
          <LayoutSuggestions 
            venueId={venueId} 
            onSelectLayout={handleApplyAILayout} 
            onClose={() => setShowAISuggestions(false)}
          />
        </Modal>
      )}
      
      {showStyleRecommendations && (
        <Modal
          isOpen={showStyleRecommendations}
          onClose={() => setShowStyleRecommendations(false)}
          title="AI Style Recommendations"
          size="large"
        >
          <StyleRecommendations 
            venueId={venueId} 
            onSelectStyle={handleApplyStyle}
            onClose={() => setShowStyleRecommendations(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ToolPanel; 