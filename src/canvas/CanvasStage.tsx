import { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Line, Circle, Arrow } from 'react-konva';
import { Asset } from '@/types/assets';
import AssetObject from '@canvas/AssetObject';
import TextAnnotation from '@canvas/TextAnnotation';
import ShapeObject from '@canvas/ShapeObject';
import Konva from 'konva';

interface CanvasStageProps {
  width: number;
  height: number;
  backgroundImage: HTMLImageElement | null;
  assets: Asset[];
  selectedAssetId: string | null;
  setSelectedAssetId: (id: string | null) => void;
  toolMode: 'select' | 'move' | 'scale' | 'rotate' | 'text' | 'shape';
  onAssetUpdate: (updatedAsset: Asset) => void;
  stageScale: number;
  stagePosition: { x: number; y: number };
  onScaleChange: (newScale: number) => void;
  onPositionChange: (newPosition: { x: number; y: number }) => void;
  showGrid: boolean;
  gridSize: number;
  snapToGrid: boolean;
  enableAlignment?: boolean;
  onTextDoubleClick?: (asset: Asset) => void;
  currentShape?: 'rectangle' | 'circle' | 'line' | 'arrow';
  onShapeComplete?: (shapeType: 'rectangle' | 'circle' | 'line' | 'arrow') => void;
  strokeWidth?: number;
  strokeColor?: string;
  fillColor?: string;
}

// Alignment guide threshold in pixels
const ALIGNMENT_THRESHOLD = 10;

// Guide colors
const GUIDE_COLOR = '#FF0000';
const GUIDE_STROKE_WIDTH = 1;

const CanvasStage: React.FC<CanvasStageProps> = ({
  width,
  height,
  backgroundImage,
  assets,
  selectedAssetId,
  setSelectedAssetId,
  toolMode,
  onAssetUpdate,
  stageScale,
  stagePosition,
  onScaleChange,
  onPositionChange,
  showGrid,
  gridSize,
  snapToGrid,
  enableAlignment = true,
  onTextDoubleClick,
  currentShape = 'rectangle',
  onShapeComplete,
  strokeWidth = 2,
  strokeColor = '#000000',
  fillColor = 'transparent',
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [stageSize, setStageSize] = useState({ width, height });
  
  // State for alignment guides
  const [guides, setGuides] = useState<{ x?: number, y?: number }[]>([]);
  const [alignmentLines, setAlignmentLines] = useState<JSX.Element[]>([]);

  // Add states for shape drawing
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [newShapeProps, setNewShapeProps] = useState<{
    x: number;
    y: number;
    width?: number;
    height?: number;
    radius?: number;
    points?: number[];
  } | null>(null);

  // Update stage dimensions when props change
  useEffect(() => {
    setStageSize({ width, height });
  }, [width, height]);

  // Update transformer when selected asset changes
  useEffect(() => {
    if (!transformerRef.current) return;

    if (selectedAssetId === null) {
      transformerRef.current.nodes([]);
      return;
    }

    const stage = stageRef.current;
    if (!stage) return;

    const selectedNode = stage.findOne(`#${selectedAssetId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
    } else {
      transformerRef.current.nodes([]);
    }
  }, [selectedAssetId, assets]);

  // Handle stage click to clear selection if clicking on empty space
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const clickedOnEmpty = e.target === e.currentTarget;
    if (clickedOnEmpty) {
      setSelectedAssetId(null);
      // Clear alignment guides
      setGuides([]);
      setAlignmentLines([]);
    }
  };

  // Handle wheel event for zooming
  const handleWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();

    const scaleBy = 1.1;
    const stage = stageRef.current;
    if (!stage) return;

    const oldScale = stageScale;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stagePosition.x) / oldScale,
      y: (pointer.y - stagePosition.y) / oldScale,
    };

    // Calculate new scale
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;

    // Limit scaling
    const limitedScale = Math.max(0.1, Math.min(newScale, 5));

    // Calculate new position
    const newPos = {
      x: pointer.x - mousePointTo.x * limitedScale,
      y: pointer.y - mousePointTo.y * limitedScale,
    };

    onScaleChange(limitedScale);
    onPositionChange(newPos);
  };

  // Handle drag move for panning the stage
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!stageRef.current) return;
    onPositionChange({ x: e.target.x(), y: e.target.y() });
    stageRef.current.batchDraw();
  };

  // Create grid lines
  const createGridLines = () => {
    if (!showGrid) return [];

    const lines = [];
    const gridSizeScaled = gridSize;

    // Calculate visible area based on scale and position
    const visibleStartX = -stagePosition.x / stageScale;
    const visibleStartY = -stagePosition.y / stageScale;
    const visibleEndX = (width - stagePosition.x) / stageScale;
    const visibleEndY = (height - stagePosition.y) / stageScale;

    // Add some padding
    const paddedStartX = Math.floor(visibleStartX / gridSizeScaled) * gridSizeScaled - gridSizeScaled;
    const paddedStartY = Math.floor(visibleStartY / gridSizeScaled) * gridSizeScaled - gridSizeScaled;
    const paddedEndX = Math.ceil(visibleEndX / gridSizeScaled) * gridSizeScaled + gridSizeScaled;
    const paddedEndY = Math.ceil(visibleEndY / gridSizeScaled) * gridSizeScaled + gridSizeScaled;

    // Vertical lines
    for (let x = paddedStartX; x <= paddedEndX; x += gridSizeScaled) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, paddedStartY, x, paddedEndY]}
          stroke="#ddd"
          strokeWidth={1 / stageScale}
          opacity={0.5}
        />
      );
    }

    // Horizontal lines
    for (let y = paddedStartY; y <= paddedEndY; y += gridSizeScaled) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[paddedStartX, y, paddedEndX, y]}
          stroke="#ddd"
          strokeWidth={1 / stageScale}
          opacity={0.5}
        />
      );
    }

    return lines;
  };

  // Function to snap position to grid
  const snapPositionToGrid = (pos: { x: number; y: number }) => {
    if (!snapToGrid) return pos;
    return {
      x: Math.round(pos.x / gridSize) * gridSize,
      y: Math.round(pos.y / gridSize) * gridSize,
    };
  };

  // Generate alignment guides based on asset positions
  const generateAlignmentGuides = (
    movingAsset: Asset,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    if (!enableAlignment || !selectedAssetId) {
      setGuides([]);
      setAlignmentLines([]);
      return { x, y };
    }

    // Points to check alignment (center, edges)
    const movingLeft = x;
    const movingRight = x + width * (movingAsset.scaleX || 1);
    const movingTop = y;
    const movingBottom = y + height * (movingAsset.scaleY || 1);
    const movingCenterX = (movingLeft + movingRight) / 2;
    const movingCenterY = (movingTop + movingBottom) / 2;

    let newGuides: { x?: number; y?: number }[] = [];
    let newAlignmentLines: JSX.Element[] = [];
    let newX = x;
    let newY = y;

    // Consider canvas edges too
    const staticPoints = assets
      .filter(asset => asset.id !== selectedAssetId && asset.isVisible !== false)
      .flatMap(asset => {
        const left = asset.x || 0;
        const right = left + (asset.width || 0) * (asset.scaleX || 1);
        const top = asset.y || 0;
        const bottom = top + (asset.height || 0) * (asset.scaleY || 1);
        const centerX = (left + right) / 2;
        const centerY = (top + bottom) / 2;
        
        return [
          { type: 'left', value: left },
          { type: 'right', value: right },
          { type: 'center-x', value: centerX },
          { type: 'top', value: top },
          { type: 'bottom', value: bottom },
          { type: 'center-y', value: centerY },
        ];
      });

    // Check for horizontal alignment
    const horizontalPoints = [
      { point: movingLeft, type: 'left' },
      { point: movingRight, type: 'right' },
      { point: movingCenterX, type: 'center' },
    ];

    for (const { point, type } of horizontalPoints) {
      for (const staticPoint of staticPoints) {
        if (staticPoint.type.includes('top') || staticPoint.type.includes('bottom') || staticPoint.type.includes('center-y')) {
          continue; // Skip y-coordinates for horizontal alignment
        }
        
        // Check if the point is near a static point
        if (Math.abs(point - staticPoint.value) < ALIGNMENT_THRESHOLD / stageScale) {
          // Add a guide at this x position
          newGuides.push({ x: staticPoint.value });
          
          // Calculate adjustment based on which point is being aligned
          if (type === 'left') {
            newX = staticPoint.value;
          } else if (type === 'right') {
            newX = staticPoint.value - width * (movingAsset.scaleX || 1);
          } else if (type === 'center') {
            newX = staticPoint.value - (width * (movingAsset.scaleX || 1)) / 2;
          }
          
          // Add a visual guide line
          const visibleStartY = -stagePosition.y / stageScale;
          const visibleEndY = (height - stagePosition.y) / stageScale;
          newAlignmentLines.push(
            <Line
              key={`x-${staticPoint.value}`}
              points={[staticPoint.value, visibleStartY, staticPoint.value, visibleEndY]}
              stroke={GUIDE_COLOR}
              strokeWidth={GUIDE_STROKE_WIDTH / stageScale}
              dash={[5 / stageScale, 5 / stageScale]}
            />
          );
          
          // Only use one guide per direction
          break;
        }
      }
    }

    // Check for vertical alignment
    const verticalPoints = [
      { point: movingTop, type: 'top' },
      { point: movingBottom, type: 'bottom' },
      { point: movingCenterY, type: 'center' },
    ];

    for (const { point, type } of verticalPoints) {
      for (const staticPoint of staticPoints) {
        if (staticPoint.type.includes('left') || staticPoint.type.includes('right') || staticPoint.type.includes('center-x')) {
          continue; // Skip x-coordinates for vertical alignment
        }
        
        // Check if the point is near a static point
        if (Math.abs(point - staticPoint.value) < ALIGNMENT_THRESHOLD / stageScale) {
          // Add a guide at this y position
          newGuides.push({ y: staticPoint.value });
          
          // Calculate adjustment based on which point is being aligned
          if (type === 'top') {
            newY = staticPoint.value;
          } else if (type === 'bottom') {
            newY = staticPoint.value - height * (movingAsset.scaleY || 1);
          } else if (type === 'center') {
            newY = staticPoint.value - (height * (movingAsset.scaleY || 1)) / 2;
          }
          
          // Add a visual guide line
          const visibleStartX = -stagePosition.x / stageScale;
          const visibleEndX = (width - stagePosition.x) / stageScale;
          newAlignmentLines.push(
            <Line
              key={`y-${staticPoint.value}`}
              points={[visibleStartX, staticPoint.value, visibleEndX, staticPoint.value]}
              stroke={GUIDE_COLOR}
              strokeWidth={GUIDE_STROKE_WIDTH / stageScale}
              dash={[5 / stageScale, 5 / stageScale]}
            />
          );
          
          // Only use one guide per direction
          break;
        }
      }
    }

    // Update guides and alignment lines
    setGuides(newGuides);
    setAlignmentLines(newAlignmentLines);

    return { x: newX, y: newY };
  };

  // Handle asset transform
  const handleAssetTransform = (asset: Asset, newProps: Partial<Asset>) => {
    let updatedAsset = { ...asset, ...newProps };

    // If position changed, handle alignment and grid snapping
    if (newProps.x !== undefined || newProps.y !== undefined) {
      const initialWidth = asset.width || 100;
      const initialHeight = asset.height || 100;

      // First try alignment guides
      if (enableAlignment && (toolMode === 'move' || toolMode === 'select')) {
        const alignedPosition = generateAlignmentGuides(
          asset,
          updatedAsset.x || 0,
          updatedAsset.y || 0,
          initialWidth,
          initialHeight
        );
        updatedAsset.x = alignedPosition.x;
        updatedAsset.y = alignedPosition.y;
      } else {
        // Clear guides if not in move mode or alignment is disabled
        setGuides([]);
        setAlignmentLines([]);
      }

      // Then apply grid snapping (alignment takes precedence)
      if (snapToGrid) {
        const snappedPosition = snapPositionToGrid({
          x: updatedAsset.x || 0,
          y: updatedAsset.y || 0,
        });
        updatedAsset.x = snappedPosition.x;
        updatedAsset.y = snappedPosition.y;
      }
    }

    onAssetUpdate(updatedAsset);
  };

  // Handle when asset drag ends - clean up guides
  const handleAssetDragEnd = () => {
    setGuides([]);
    setAlignmentLines([]);
  };

  // Handle mouse down for shape drawing
  const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Only draw if in shape mode and clicking on empty space
    if (toolMode !== 'shape' || e.target !== e.currentTarget) {
      return;
    }

    // Get position relative to stage
    const stage = stageRef.current;
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Convert to stage coordinates
    const stagePos = {
      x: (pointerPos.x - stagePosition.x) / stageScale,
      y: (pointerPos.y - stagePosition.y) / stageScale,
    };

    // Apply grid snapping if enabled
    const snappedPos = snapToGrid 
      ? snapPositionToGrid(stagePos)
      : stagePos;

    setIsDrawing(true);
    setStartPoint(snappedPos);
    
    // Initialize new shape based on the current shape type
    setNewShapeProps({
      x: snappedPos.x,
      y: snappedPos.y,
      // Initialize with default values that will be updated during drawing
      width: 0,
      height: 0,
      radius: 0,
      points: [0, 0, 0, 0],
    });

    // Prevent stage dragging while drawing
    stage.draggable(false);
  };

  // Handle mouse move for live shape preview
  const handleMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !startPoint) return;

    const stage = stageRef.current;
    if (!stage) return;

    const pointerPos = stage.getPointerPosition();
    if (!pointerPos) return;

    // Convert to stage coordinates
    const currentPos = {
      x: (pointerPos.x - stagePosition.x) / stageScale,
      y: (pointerPos.y - stagePosition.y) / stageScale,
    };

    // Apply grid snapping if enabled
    const snappedPos = snapToGrid 
      ? snapPositionToGrid(currentPos)
      : currentPos;

    // Calculate width and height
    let width = snappedPos.x - startPoint.x;
    let height = snappedPos.y - startPoint.y;
    
    // Update shape properties based on shape type
    switch (currentShape) {
      case 'rectangle':
        // For rectangle, handle negative dimensions
        let x = startPoint.x;
        let y = startPoint.y;
        
        if (width < 0) {
          x = snappedPos.x;
          width = Math.abs(width);
        }
        
        if (height < 0) {
          y = snappedPos.y;
          height = Math.abs(height);
        }
        
        setNewShapeProps({
          x,
          y,
          width,
          height,
        });
        break;
        
      case 'circle':
        // For circle, use distance as radius
        const dx = snappedPos.x - startPoint.x;
        const dy = snappedPos.y - startPoint.y;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        setNewShapeProps({
          x: startPoint.x,
          y: startPoint.y,
          radius,
        });
        break;
        
      case 'line':
      case 'arrow':
        // For line/arrow, update points
        setNewShapeProps({
          x: startPoint.x,
          y: startPoint.y,
          points: [0, 0, snappedPos.x - startPoint.x, snappedPos.y - startPoint.y],
        });
        break;
    }
  };

  // Handle mouse up to finalize the shape
  const handleMouseUp = () => {
    if (!isDrawing || !newShapeProps || !startPoint) {
      return;
    }

    // Only create shapes with meaningful dimensions
    const hasSize = 
      (newShapeProps.width && newShapeProps.width > 5) || 
      (newShapeProps.height && newShapeProps.height > 5) ||
      (newShapeProps.radius && newShapeProps.radius > 5) ||
      (newShapeProps.points && 
        Math.abs(newShapeProps.points[2]) > 5 && 
        Math.abs(newShapeProps.points[3]) > 5);

    if (hasSize && onShapeComplete) {
      // Create a shape object to pass back to the parent
      const shapeData = {
        x: newShapeProps.x,
        y: newShapeProps.y,
        width: newShapeProps.width,
        height: newShapeProps.height,
        radius: newShapeProps.radius,
        points: newShapeProps.points
      };
      
      // Pass both the shape type and dimensions to the parent
      onShapeComplete(currentShape);
      
      // Pass the shape dimensions to the parent through onAssetUpdate
      // This requires updates to the CanvasEditor component
      if (onAssetUpdate) {
        // Create a temporary asset to update
        const tempAsset: Asset = {
          id: `temp-shape-${Date.now()}`,
          name: 'Temp Shape',
          imageUrl: '',
          category: 'shape',
          isShape: true,
          shapeType: currentShape,
          ...shapeData
        };
        
        // This will be used by CanvasEditor to update the newest shape
        onAssetUpdate(tempAsset);
      }
    }

    // Reset drawing state
    setIsDrawing(false);
    setStartPoint(null);
    setNewShapeProps(null);

    // Re-enable stage dragging
    const stage = stageRef.current;
    if (stage && toolMode === 'select') {
      stage.draggable(true);
    }
  };

  // Render the shape preview while drawing
  const renderShapePreview = () => {
    if (!isDrawing || !newShapeProps) return null;

    const commonProps = {
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth / stageScale, // Adjust stroke width for zoom level
    };

    switch (currentShape) {
      case 'rectangle':
        return (
          <Rect
            x={newShapeProps.x}
            y={newShapeProps.y}
            width={newShapeProps.width || 0}
            height={newShapeProps.height || 0}
            {...commonProps}
          />
        );
        
      case 'circle':
        return (
          <Circle
            x={newShapeProps.x}
            y={newShapeProps.y}
            radius={newShapeProps.radius || 0}
            {...commonProps}
          />
        );
        
      case 'line':
        return (
          <Line
            x={newShapeProps.x}
            y={newShapeProps.y}
            points={newShapeProps.points || [0, 0, 0, 0]}
            {...commonProps}
          />
        );
        
      case 'arrow':
        return (
          <Arrow
            x={newShapeProps.x}
            y={newShapeProps.y}
            points={newShapeProps.points || [0, 0, 0, 0]}
            pointerLength={10 / stageScale}
            pointerWidth={10 / stageScale}
            {...commonProps}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      onClick={handleStageClick}
      onWheel={handleWheel}
      scaleX={stageScale}
      scaleY={stageScale}
      x={stagePosition.x}
      y={stagePosition.y}
      draggable={toolMode === 'select' && !isDrawing}
      onDragMove={handleDragMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ 
        cursor: toolMode === 'shape' ? 'crosshair' : 'default'
      }}
    >
      {/* Background Layer */}
      <Layer>
        {backgroundImage && (
          <Rect
            x={0}
            y={0}
            width={backgroundImage.width}
            height={backgroundImage.height}
            fillPatternImage={backgroundImage}
            fillPatternRepeat="no-repeat"
          />
        )}
        {/* Grid Layer */}
        {createGridLines()}
      </Layer>

      {/* Asset Layer */}
      <Layer>
        {assets.map((asset) => 
          asset.isVisible !== false && (
            asset.isTextAnnotation ? (
              <TextAnnotation
                key={asset.id}
                asset={asset}
                isSelected={asset.id === selectedAssetId}
                toolMode={toolMode}
                onChange={(newProps) => handleAssetTransform(asset, newProps)}
                onClick={() => setSelectedAssetId(asset.id)}
                onDragEnd={handleAssetDragEnd}
                onDblClick={() => onTextDoubleClick && onTextDoubleClick(asset)}
              />
            ) : asset.isShape ? (
              <ShapeObject
                key={asset.id}
                asset={asset}
                isSelected={asset.id === selectedAssetId}
                toolMode={toolMode}
                onChange={(newProps) => handleAssetTransform(asset, newProps)}
                onClick={() => setSelectedAssetId(asset.id)}
                onDragEnd={handleAssetDragEnd}
              />
            ) : (
              <AssetObject
                key={asset.id}
                asset={asset}
                isSelected={asset.id === selectedAssetId}
                toolMode={toolMode}
                onChange={(newProps) => handleAssetTransform(asset, newProps)}
                onClick={() => setSelectedAssetId(asset.id)}
                onDragEnd={handleAssetDragEnd}
              />
            )
          )
        )}
        
        {/* Shape preview while drawing */}
        {renderShapePreview()}
      </Layer>

      {/* Alignment Guides Layer */}
      <Layer>
        {alignmentLines}
      </Layer>
    </Stage>
  );
};

export default CanvasStage; 