import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useCollaboration } from './CollaborationContext';
import CollaborationPanel from './CollaborationPanel';
import CollaborationNotification from './CollaborationNotification';
import RemoteCursors from './RemoteCursors';
import { Asset } from '@/types/assets';

interface CollaborativeEditorProps {
  children: React.ReactNode;
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
  handleAssetUpdate: (updatedAsset: Asset) => void;
  handleLayerReorder: (reorderedAssets: Asset[]) => void;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  children,
  assets,
  setAssets,
  handleAssetUpdate,
  handleLayerReorder
}) => {
  const { layoutId } = useParams<{ layoutId: string }>();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  
  const { 
    isCollaborating,
    broadcastAssetUpdate,
    broadcastAssetCreation,
    broadcastAssetDeletion,
    broadcastLayerReorder,
    updateCursor,
    onAssetUpdated,
    onAssetCreated,
    onAssetDeleted,
    onLayersReordered
  } = useCollaboration();

  // Override asset update handlers to include collaboration
  const handleCollaborativeAssetUpdate = (updatedAsset: Asset) => {
    // First update local state
    handleAssetUpdate(updatedAsset);
    
    // Then broadcast the change if collaborating
    if (isCollaborating) {
      broadcastAssetUpdate(updatedAsset);
    }
  };

  const handleCollaborativeLayerReorder = (reorderedAssets: Asset[]) => {
    // First update local state
    handleLayerReorder(reorderedAssets);
    
    // Then broadcast the change if collaborating
    if (isCollaborating) {
      broadcastLayerReorder(reorderedAssets);
    }
  };

  const handleCollaborativeAssetCreation = (newAsset: Asset) => {
    // First update local state
    setAssets(prev => [...prev, newAsset]);
    
    // Then broadcast the change if collaborating
    if (isCollaborating) {
      broadcastAssetCreation(newAsset);
    }
  };

  const handleCollaborativeAssetDeletion = (assetId: string) => {
    // First update local state
    setAssets(prev => prev.filter(asset => asset.id !== assetId));
    
    // Then broadcast the change if collaborating
    if (isCollaborating) {
      broadcastAssetDeletion(assetId);
    }
  };

  // Add effect to listen for remote asset updates
  useEffect(() => {
    if (!isCollaborating) return;
    
    // Register callbacks for asset changes from collaborators
    const assetUpdateUnsubscribe = onAssetUpdated((updatedAsset) => {
      setAssets(prev => prev.map(asset => 
        asset.id === updatedAsset.id ? updatedAsset : asset
      ));
    });
    
    const assetCreationUnsubscribe = onAssetCreated((newAsset) => {
      setAssets(prev => [...prev, newAsset]);
    });
    
    const assetDeletionUnsubscribe = onAssetDeleted((assetId) => {
      setAssets(prev => prev.filter(asset => asset.id !== assetId));
    });
    
    const layerReorderUnsubscribe = onLayersReordered((reorderedAssets) => {
      setAssets(reorderedAssets);
    });
    
    // Type guard function to check if value is a function
    const isFunction = (value: unknown): value is () => void => {
      return typeof value === 'function';
    };
    
    // Cleanup on unmount or when no longer collaborating
    return () => {
      if (isFunction(assetUpdateUnsubscribe)) assetUpdateUnsubscribe();
      if (isFunction(assetCreationUnsubscribe)) assetCreationUnsubscribe();
      if (isFunction(assetDeletionUnsubscribe)) assetDeletionUnsubscribe();
      if (isFunction(layerReorderUnsubscribe)) layerReorderUnsubscribe();
    };
  }, [isCollaborating, onAssetUpdated, onAssetCreated, onAssetDeleted, onLayersReordered, setAssets]);

  // Track cursor position for collaboration
  useEffect(() => {
    if (!isCollaborating || !editorContainerRef.current) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!editorContainerRef.current) return;
      
      const rect = editorContainerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      updateCursor({ x, y });
    };
    
    const container = editorContainerRef.current;
    container.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isCollaborating, updateCursor]);

  return (
    <div className="flex flex-col h-full" ref={editorContainerRef}>
      {/* Main editor area */}
      {children}
      
      {/* Collaboration UI elements */}
      {layoutId && isCollaborating && <RemoteCursors containerRef={editorContainerRef} />}
      <CollaborationNotification />
      
      {/* Expose collaboration handlers */}
      <CollaborationHandlers 
        onAssetUpdate={handleCollaborativeAssetUpdate}
        onLayerReorder={handleCollaborativeLayerReorder}
        onAssetCreate={handleCollaborativeAssetCreation}
        onAssetDelete={handleCollaborativeAssetDeletion}
      />
    </div>
  );
};

// This is a "hidden" component that just exposes the handlers to the parent via React Context
// so they can be accessed by the CanvasEditor component
export const CollaborationContext = React.createContext<{
  onAssetUpdate: (asset: Asset) => void;
  onLayerReorder: (assets: Asset[]) => void;
  onAssetCreate: (asset: Asset) => void;
  onAssetDelete: (assetId: string) => void;
} | null>(null);

interface CollaborationHandlersProps {
  onAssetUpdate: (asset: Asset) => void;
  onLayerReorder: (assets: Asset[]) => void;
  onAssetCreate: (asset: Asset) => void;
  onAssetDelete: (assetId: string) => void;
}

const CollaborationHandlers: React.FC<CollaborationHandlersProps> = (props) => {
  return (
    <CollaborationContext.Provider value={props}>
      {/* No visible UI */}
    </CollaborationContext.Provider>
  );
};

export function useCollaborativeHandlers() {
  const context = React.useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaborativeHandlers must be used within a CollaborativeEditor');
  }
  return context;
}

export default CollaborativeEditor; 