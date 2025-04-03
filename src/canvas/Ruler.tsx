import { FC } from 'react';
import { Group, Line, Text, Rect } from 'react-konva';
import Konva from 'konva';

interface RulerProps {
  width: number;
  height: number;
  size: number;
  scale: number;
  offset: { x: number; y: number };
  color?: string;
  backgroundColor?: string;
  unit?: 'px' | 'cm' | 'in';
  unitSize?: number;
  showLabels?: boolean;
}

const Ruler: FC<RulerProps> = ({
  width,
  height,
  size = 20,
  scale = 1,
  offset = { x: 0, y: 0 },
  color = '#333',
  backgroundColor = 'rgba(255, 255, 255, 0.8)',
  unit = 'px',
  unitSize = 1,
  showLabels = true,
}) => {
  // Calculate tick marks based on scale
  const calculateTicks = () => {
    // Determine tick size based on scale
    // We'll adjust tick spacing based on zoom level
    let tickSpacing = 100; // Base spacing at 100px intervals
    
    if (scale > 1.5) {
      tickSpacing = 50;
    } else if (scale > 0.7) {
      tickSpacing = 100;
    } else if (scale > 0.3) {
      tickSpacing = 200;
    } else {
      tickSpacing = 500;
    }
    
    return tickSpacing;
  };

  const tickSpacing = calculateTicks();
  
  // Convert pixels to the chosen unit
  const pixelsToUnit = (pixels: number) => {
    switch (unit) {
      case 'cm':
        return (pixels / 37.8).toFixed(0); // 1cm ≈ 37.8px
      case 'in':
        return (pixels / 96).toFixed(1);   // 1in = 96px
      case 'px':
      default:
        return Math.round(pixels).toString();
    }
  };

  // Calculate visible range for ticks
  const visibleStartX = -offset.x / scale;
  const visibleEndX = (width - offset.x) / scale;
  const visibleStartY = -offset.y / scale;
  const visibleEndY = (height - offset.y) / scale;

  // Start at the first visible tickSpacing multiple
  const startX = Math.floor(visibleStartX / tickSpacing) * tickSpacing;
  const startY = Math.floor(visibleStartY / tickSpacing) * tickSpacing;

  // Render ticks for the horizontal ruler
  const renderHorizontalTicks = () => {
    const ticks = [];
    
    for (let x = startX; x <= visibleEndX; x += tickSpacing) {
      // Major tick
      ticks.push(
        <Line
          key={`h-tick-${x}`}
          points={[x, 0, x, size / 2]}
          stroke={color}
          strokeWidth={1 / scale}
        />
      );
      
      // Add label for major tick
      if (showLabels) {
        ticks.push(
          <Text
            key={`h-label-${x}`}
            x={x + 2 / scale}
            y={2 / scale}
            text={pixelsToUnit(x)}
            fontSize={9 / scale}
            fill={color}
            align="center"
          />
        );
      }
      
      // Minor ticks (if zoomed in enough)
      if (scale > 0.7) {
        for (let i = 1; i < 5; i++) {
          const minorX = x + (tickSpacing * i) / 5;
          if (minorX <= visibleEndX) {
            const tickHeight = i === 2.5 ? size / 3 : size / 4; // Middle tick slightly taller
            ticks.push(
              <Line
                key={`h-minor-${x}-${i}`}
                points={[minorX, 0, minorX, tickHeight]}
                stroke={color}
                strokeWidth={0.5 / scale}
                opacity={0.7}
              />
            );
          }
        }
      }
    }
    
    return ticks;
  };
  
  // Render ticks for the vertical ruler
  const renderVerticalTicks = () => {
    const ticks = [];
    
    for (let y = startY; y <= visibleEndY; y += tickSpacing) {
      // Major tick
      ticks.push(
        <Line
          key={`v-tick-${y}`}
          points={[0, y, size / 2, y]}
          stroke={color}
          strokeWidth={1 / scale}
        />
      );
      
      // Add label for major tick
      if (showLabels) {
        ticks.push(
          <Text
            key={`v-label-${y}`}
            x={2 / scale}
            y={y + 2 / scale}
            text={pixelsToUnit(y)}
            fontSize={9 / scale}
            fill={color}
            align="center"
            rotation={-90}
          />
        );
      }
      
      // Minor ticks (if zoomed in enough)
      if (scale > 0.7) {
        for (let i = 1; i < 5; i++) {
          const minorY = y + (tickSpacing * i) / 5;
          if (minorY <= visibleEndY) {
            const tickWidth = i === 2.5 ? size / 3 : size / 4; // Middle tick slightly longer
            ticks.push(
              <Line
                key={`v-minor-${y}-${i}`}
                points={[0, minorY, tickWidth, minorY]}
                stroke={color}
                strokeWidth={0.5 / scale}
                opacity={0.7}
              />
            );
          }
        }
      }
    }
    
    return ticks;
  };

  // Ruler corner square
  const cornerSquare = (
    <Rect
      x={0}
      y={0}
      width={size}
      height={size}
      fill={backgroundColor}
      stroke={color}
      strokeWidth={1 / scale}
    />
  );

  // Current position indicator
  const renderPositionIndicators = () => {
    return (
      <>
        <Rect
          x={-10000}
          y={-10000}
          width={20000}
          height={20000}
          opacity={0}
          onMouseMove={(e) => {
            const stage = e.currentTarget.getStage();
            if (!stage) return;
            
            const pointerPos = stage.getPointerPosition();
            if (!pointerPos) return;
            
            // Convert to stage coordinates
            const stagePos = {
              x: (pointerPos.x - offset.x) / scale,
              y: (pointerPos.y - offset.y) / scale,
            };
            
            // Update the position indicators
            const hIndicator = stage.findOne('#horizontal-indicator') as Konva.Line;
            const vIndicator = stage.findOne('#vertical-indicator') as Konva.Line;
            
            if (hIndicator && pointerPos.y > size) {
              hIndicator.y(stagePos.y);
              hIndicator.visible(true);
            }
            
            if (vIndicator && pointerPos.x > size) {
              vIndicator.x(stagePos.x);
              vIndicator.visible(true);
            }
            
            stage.batchDraw();
          }}
          onMouseOut={(e) => {
            const stage = e.currentTarget.getStage();
            if (!stage) return;
            
            const hIndicator = stage.findOne('#horizontal-indicator') as Konva.Line;
            const vIndicator = stage.findOne('#vertical-indicator') as Konva.Line;
            
            if (hIndicator) hIndicator.visible(false);
            if (vIndicator) vIndicator.visible(false);
            
            stage.batchDraw();
          }}
        />
        <Line
          id="horizontal-indicator"
          points={[0, 0, width / scale, 0]}
          stroke="rgba(255, 0, 0, 0.5)"
          strokeWidth={1 / scale}
          dash={[4 / scale, 4 / scale]}
          visible={false}
        />
        <Line
          id="vertical-indicator"
          points={[0, 0, 0, height / scale]}
          stroke="rgba(255, 0, 0, 0.5)"
          strokeWidth={1 / scale}
          dash={[4 / scale, 4 / scale]}
          visible={false}
        />
      </>
    );
  };

  return (
    <Group>
      {renderPositionIndicators()}
      
      {/* Horizontal ruler */}
      <Group>
        <Rect
          x={0}
          y={0}
          width={width / scale}
          height={size}
          fill={backgroundColor}
          stroke={color}
          strokeWidth={1 / scale}
        />
        {renderHorizontalTicks()}
      </Group>
      
      {/* Vertical ruler */}
      <Group>
        <Rect
          x={0}
          y={0}
          width={size}
          height={height / scale}
          fill={backgroundColor}
          stroke={color}
          strokeWidth={1 / scale}
        />
        {renderVerticalTicks()}
      </Group>
      
      {/* Corner square where rulers meet */}
      {cornerSquare}
      
      {/* Unit indicator in corner */}
      <Text
        x={size / 2}
        y={size / 2}
        text={unit}
        fontSize={8 / scale}
        fill={color}
        align="center"
        verticalAlign="middle"
      />
    </Group>
  );
};

export default Ruler; 