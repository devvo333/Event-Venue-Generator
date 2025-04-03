import { useRef, useEffect } from 'react';
import { Rect, Circle, Line, Arrow, Transformer } from 'react-konva';
import Konva from 'konva';
import { Asset } from '@/types/assets';

interface ShapeObjectProps {
  asset: Asset;
  isSelected: boolean;
  toolMode: 'select' | 'move' | 'scale' | 'rotate' | 'text' | 'shape';
  onChange: (newProps: Partial<Asset>) => void;
  onClick: () => void;
  onDragEnd?: () => void;
}

const ShapeObject: React.FC<ShapeObjectProps> = ({
  asset,
  isSelected,
  toolMode,
  onChange,
  onClick,
  onDragEnd,
}) => {
  const shapeRef = useRef<Konva.Shape>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Setup transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !shapeRef.current) return;

    if (isSelected) {
      // Configure transformer based on tool mode
      transformerRef.current.nodes([shapeRef.current]);
      
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
        keepRatio: asset.shapeType === 'circle', // Keep ratio for circles
        centeredScaling: false,
      });
      
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      // Remove transformer if deselected
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, toolMode, asset.shapeType]);
  
  // Determine draggable state based on tool mode
  const isDraggable = (toolMode === 'move' || toolMode === 'select') && !asset.isLocked;

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
    if (!shapeRef.current) return;

    // Get the node to calculate new values
    const node = shapeRef.current;
    
    // Get current scale
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Get current rotation
    const rotation = node.rotation();
    
    // Get position
    const x = node.x();
    const y = node.y();
    
    // Calculate shape-specific updates
    let updates: Partial<Asset> = {
      x,
      y,
      scaleX,
      scaleY,
      rotation,
    };

    // For circles, update radius instead of width/height
    if (asset.shapeType === 'circle' && asset.radius) {
      updates.radius = asset.radius * scaleX;
      updates.scaleX = 1;
      updates.scaleY = 1;
    }
    // For rectangles, update width/height
    else if (asset.shapeType === 'rectangle') {
      updates.width = (asset.width || 100) * scaleX;
      updates.height = (asset.height || 100) * scaleY;
      updates.scaleX = 1;
      updates.scaleY = 1;
    }
    // For lines and arrows, the scaling is handled by the konva shape
    
    onChange(updates);
  };

  // Common props for all shapes
  const commonProps = {
    id: asset.id,
    x: asset.x || 0,
    y: asset.y || 0,
    rotation: asset.rotation || 0,
    fill: asset.fill || 'transparent',
    stroke: asset.stroke || '#000000',
    strokeWidth: asset.strokeWidth || 2,
    draggable: isDraggable,
    onClick,
    onTap: onClick,
    onDragEnd: handleDragEnd,
    onTransformEnd: handleTransformEnd,
  };

  // Render the appropriate shape based on shape type
  const renderShape = () => {
    switch (asset.shapeType) {
      case 'rectangle':
        return (
          <Rect
            ref={shapeRef as React.RefObject<Konva.Rect>}
            width={asset.width || 100}
            height={asset.height || 100}
            scaleX={asset.scaleX || 1}
            scaleY={asset.scaleY || 1}
            {...commonProps}
          />
        );
      case 'circle':
        return (
          <Circle
            ref={shapeRef as React.RefObject<Konva.Circle>}
            radius={asset.radius || 50}
            scaleX={asset.scaleX || 1}
            scaleY={asset.scaleY || 1}
            {...commonProps}
          />
        );
      case 'line':
        return (
          <Line
            ref={shapeRef as React.RefObject<Konva.Line>}
            points={asset.points || [0, 0, 100, 0]}
            scaleX={asset.scaleX || 1}
            scaleY={asset.scaleY || 1}
            {...commonProps}
          />
        );
      case 'arrow':
        return (
          <Arrow
            ref={shapeRef as React.RefObject<Konva.Arrow>}
            points={asset.points || [0, 0, 100, 0]}
            scaleX={asset.scaleX || 1}
            scaleY={asset.scaleY || 1}
            pointerLength={10}
            pointerWidth={10}
            {...commonProps}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && (
        <Transformer
          ref={transformerRef}
        />
      )}
    </>
  );
};

export default ShapeObject; 