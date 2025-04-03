import { useRef, useEffect, useState } from 'react';
import { Image, Transformer } from 'react-konva';
import Konva from 'konva';
import { Asset } from '@/types/assets';

interface AssetObjectProps {
  asset: Asset;
  isSelected: boolean;
  toolMode: 'select' | 'move' | 'scale' | 'rotate' | 'text' | 'shape';
  onChange: (newProps: Partial<Asset>) => void;
  onClick: () => void;
  onDragEnd?: () => void;
}

const AssetObject: React.FC<AssetObjectProps> = ({
  asset,
  isSelected,
  toolMode,
  onChange,
  onClick,
  onDragEnd,
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  // Load image when component mounts or imageUrl changes
  useEffect(() => {
    const img = new window.Image();
    img.src = asset.imageUrl;
    img.onload = () => {
      setImage(img);
    };
  }, [asset.imageUrl]);

  // Setup transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !imageRef.current) return;

    if (isSelected) {
      // Configure transformer based on tool mode
      transformerRef.current.nodes([imageRef.current]);
      
      // Set what's enabled based on tool mode
      const rotateEnabled = toolMode === 'rotate' || toolMode === 'select';
      const resizeEnabled = toolMode === 'scale' || toolMode === 'select';
      
      transformerRef.current.setAttrs({
        rotateEnabled,
        enabledAnchors: resizeEnabled 
          ? ['top-left', 'top-right', 'bottom-left', 'bottom-right'] 
          : [],
        borderDash: [5, 5],
        borderStroke: '#1a73e8',
        anchorStroke: '#1a73e8',
        anchorFill: '#fff',
        anchorSize: 10,
        keepRatio: true,
        centeredScaling: false,
      });
      
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      // Remove transformer if deselected
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, toolMode]);

  // Calculate initial display dimensions
  const initialWidth = asset.width || 100;
  const initialHeight = asset.height || 100;
  
  // Determine draggable state based on tool mode
  const isDraggable = toolMode === 'move' || toolMode === 'select';

  // Handle drag end
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      x: e.target.x(),
      y: e.target.y(),
    });
    
    // Call the external onDragEnd if provided
    if (onDragEnd) {
      onDragEnd();
    }
  };

  // Handle transform end for scaling or rotation
  const handleTransformEnd = () => {
    if (!imageRef.current) return;

    // Get the node to calculate new values
    const node = imageRef.current;
    
    // Get current scale
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Get current rotation
    const rotation = node.rotation();
    
    // Get position
    const x = node.x();
    const y = node.y();
    
    // Update asset with new values
    onChange({
      x,
      y,
      scaleX,
      scaleY,
      rotation,
      // Calculate actual dimensions based on scale
      width: Math.abs(initialWidth * scaleX),
      height: Math.abs(initialHeight * scaleY),
    });
  };

  return (
    <>
      {image && (
        <Image
          ref={imageRef}
          id={asset.id}
          image={image}
          x={asset.x}
          y={asset.y}
          width={initialWidth}
          height={initialHeight}
          scaleX={asset.scaleX || 1}
          scaleY={asset.scaleY || 1}
          rotation={asset.rotation || 0}
          draggable={isDraggable}
          onClick={onClick}
          onTap={onClick}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />
      )}
      {isSelected && (
        <Transformer
          ref={transformerRef}
        />
      )}
    </>
  );
};

export default AssetObject; 