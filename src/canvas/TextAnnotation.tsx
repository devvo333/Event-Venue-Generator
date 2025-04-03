import { useRef, useEffect, useState } from 'react';
import { Text, Transformer } from 'react-konva';
import Konva from 'konva';
import { Asset } from '@/types/assets';

interface TextAnnotationProps {
  asset: Asset;
  isSelected: boolean;
  toolMode: 'select' | 'move' | 'scale' | 'rotate' | 'text' | 'shape';
  onChange: (newProps: Partial<Asset>) => void;
  onClick: () => void;
  onDragEnd?: () => void;
  onDblClick?: () => void;
}

const TextAnnotation: React.FC<TextAnnotationProps> = ({
  asset,
  isSelected,
  toolMode,
  onChange,
  onClick,
  onDragEnd,
  onDblClick,
}) => {
  const textRef = useRef<Konva.Text>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Setup transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !textRef.current) return;

    if (isSelected) {
      // Configure transformer based on tool mode
      transformerRef.current.nodes([textRef.current]);
      
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
    if (!textRef.current) return;

    // Get the node to calculate new values
    const node = textRef.current;
    
    // Get current scale
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Get current rotation
    const rotation = node.rotation();
    
    // Get position
    const x = node.x();
    const y = node.y();
    
    // Update text fontSize by the scale factor
    const fontSize = (asset.fontSize || 24) * scaleX;
    
    // Update asset with new values
    onChange({
      x,
      y,
      rotation,
      fontSize,
      // Reset scale after applying fontSize
      scaleX: 1,
      scaleY: 1,
    });
  };

  return (
    <>
      <Text
        ref={textRef}
        id={asset.id}
        text={asset.text || 'Text Annotation'}
        x={asset.x || 0}
        y={asset.y || 0}
        fontSize={asset.fontSize || 24}
        fontFamily={asset.fontFamily || 'Arial'}
        fill={asset.fill || '#000000'}
        scaleX={asset.scaleX || 1}
        scaleY={asset.scaleY || 1}
        rotation={asset.rotation || 0}
        draggable={isDraggable}
        onClick={onClick}
        onTap={onClick}
        onDblClick={onDblClick}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        padding={5}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
        />
      )}
    </>
  );
};

export default TextAnnotation; 