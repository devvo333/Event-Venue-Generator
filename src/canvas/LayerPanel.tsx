import { Asset } from '@/types/assets';
import { useState } from 'react';

interface LayerPanelProps {
  assets: Asset[];
  selectedAssetId: string | null;
  onAssetSelect: (id: string) => void;
  onLayerReorder: (reorderedAssets: Asset[]) => void;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onToggleLock: (id: string, locked: boolean) => void;
}

const LayerPanel: React.FC<LayerPanelProps> = ({
  assets,
  selectedAssetId,
  onAssetSelect,
  onLayerReorder,
  onToggleVisibility,
  onToggleLock,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    
    // Add a visual cue for dragging
    if (e.currentTarget.classList) {
      e.currentTarget.classList.add('opacity-50');
    }
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLLIElement>) => {
    setDraggedId(null);
    
    // Reset visual cue
    if (e.currentTarget.classList) {
      e.currentTarget.classList.remove('opacity-50');
    }
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Handle drop for reordering layers
  const handleDrop = (e: React.DragEvent<HTMLLIElement>, targetId: string) => {
    e.preventDefault();
    
    if (!draggedId || draggedId === targetId) return;
    
    // Find indices of the dragged and target assets
    const draggedIndex = assets.findIndex(asset => asset.id === draggedId);
    const targetIndex = assets.findIndex(asset => asset.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    // Create a copy of assets array
    const reorderedAssets = [...assets];
    
    // Remove the dragged asset
    const [draggedAsset] = reorderedAssets.splice(draggedIndex, 1);
    
    // Insert the dragged asset at the target position
    reorderedAssets.splice(targetIndex, 0, draggedAsset);
    
    // Update the assets array with new order
    onLayerReorder(reorderedAssets);
  };

  // Toggle visibility of an asset
  const handleToggleVisibility = (id: string, currentVisibility: boolean) => {
    onToggleVisibility(id, !currentVisibility);
  };

  // Toggle lock state of an asset
  const handleToggleLock = (id: string, currentLocked: boolean) => {
    onToggleLock(id, !currentLocked);
  };

  // Reverse the assets array to show topmost layers first
  const displayAssets = [...assets].reverse();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold mb-2">Layers</h2>
        <p className="text-sm text-gray-500">Drag to reorder layers</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {displayAssets.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No assets on canvas</p>
            <p className="text-sm">Add assets from the left panel</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {displayAssets.map(asset => {
              const isVisible = asset.isVisible !== false; // Default to visible
              const isLocked = asset.isLocked === true; // Default to unlocked
              
              return (
                <li 
                  key={asset.id}
                  className={`p-3 hover:bg-gray-50 transition-colors ${
                    selectedAssetId === asset.id ? 'bg-blue-50' : ''
                  } ${isVisible ? '' : 'opacity-50'}`}
                  onClick={() => onAssetSelect(asset.id)}
                  draggable={!isLocked}
                  onDragStart={(e) => handleDragStart(e, asset.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, asset.id)}
                >
                  <div className="flex items-center space-x-2">
                    {/* Visibility toggle */}
                    <button
                      className="p-1 rounded hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleVisibility(asset.id, isVisible);
                      }}
                      title={isVisible ? 'Hide' : 'Show'}
                    >
                      {isVisible ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Lock toggle */}
                    <button
                      className="p-1 rounded hover:bg-gray-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLock(asset.id, isLocked);
                      }}
                      title={isLocked ? 'Unlock' : 'Lock'}
                    >
                      {isLocked ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    
                    {/* Layer name */}
                    <div className="flex-1 truncate">
                      <span className="font-medium">{asset.name}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {asset.category}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default LayerPanel; 