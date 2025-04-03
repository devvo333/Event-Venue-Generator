import React, { useState } from 'react';
import CanvasEditor from './CanvasEditor';
import CollaborativeEditor from '../collaboration/CollaborativeEditor';
import { Asset } from '@/types/assets';

const EditorPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);

  const handleAssetUpdate = (updatedAsset: Asset) => {
    setAssets(currentAssets => 
      currentAssets.map(asset => asset.id === updatedAsset.id ? updatedAsset : asset)
    );
  };

  const handleLayerReorder = (reorderedAssets: Asset[]) => {
    setAssets(reorderedAssets);
  };

  return (
    <CollaborativeEditor
      assets={assets}
      setAssets={setAssets}
      handleAssetUpdate={handleAssetUpdate}
      handleLayerReorder={handleLayerReorder}
    >
      <CanvasEditor />
    </CollaborativeEditor>
  );
};

export default EditorPage; 