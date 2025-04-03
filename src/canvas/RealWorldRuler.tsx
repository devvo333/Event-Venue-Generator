import React from 'react';

interface RealWorldRulerProps {
  orientation: 'horizontal' | 'vertical';
  canvasSize: number; // width for horizontal ruler, height for vertical ruler
  realWorldSize: number; // width or height in real-world units
  unit: 'meters' | 'feet';
  scale: number; // scale factor for ruler ticks
  color?: string;
  thickness?: number;
  showLabels?: boolean;
}

const RealWorldRuler: React.FC<RealWorldRulerProps> = ({
  orientation,
  canvasSize,
  realWorldSize,
  unit,
  scale,
  color = '#333333',
  thickness = 20,
  showLabels = true,
}) => {
  // Calculate tick intervals based on real-world size and scale
  // We want to show reasonable intervals (1m, 5m, 10m, etc.) based on the total size
  const calculateTickInterval = () => {
    // Base interval in the specified unit
    let baseInterval: number;
    
    // Adjust the base interval based on the real-world size and scale
    if (realWorldSize <= 10) {
      baseInterval = 1; // 1m or 1ft interval for small spaces
    } else if (realWorldSize <= 50) {
      baseInterval = 5; // 5m or 5ft interval for medium spaces
    } else if (realWorldSize <= 100) {
      baseInterval = 10; // 10m or 10ft interval for large spaces
    } else {
      baseInterval = 20; // 20m or 20ft interval for very large spaces
    }
    
    // Adjust for scale - use smaller intervals for larger scales
    return baseInterval / Math.max(1, Math.sqrt(scale));
  };
  
  // Get pixel position for a given real-world position
  const getRealWorldPositionInPixels = (position: number) => {
    return (position / realWorldSize) * canvasSize;
  };
  
  const interval = calculateTickInterval();
  
  // Generate tick marks
  const generateTicks = () => {
    const ticks = [];
    const pixelsPerUnit = canvasSize / realWorldSize;
    const numTicks = Math.floor(realWorldSize / interval) + 1;
    
    for (let i = 0; i < numTicks; i++) {
      const position = i * interval;
      const pixelPosition = position * pixelsPerUnit;
      
      if (pixelPosition <= canvasSize) {
        // Determine tick height - major ticks are taller
        const isMajorTick = i % 5 === 0;
        const tickSize = isMajorTick ? thickness * 0.8 : thickness * 0.5;
        
        ticks.push({
          position: pixelPosition,
          size: tickSize,
          label: isMajorTick && showLabels ? `${position}${unit === 'meters' ? 'm' : 'ft'}` : '',
          isMajorTick,
        });
      }
    }
    
    return ticks;
  };
  
  const ticks = generateTicks();
  
  return (
    <div
      className="ruler"
      style={{
        position: 'absolute',
        backgroundColor: '#f5f5f5',
        borderRight: orientation === 'horizontal' ? 'none' : `1px solid ${color}`,
        borderBottom: orientation === 'vertical' ? 'none' : `1px solid ${color}`,
        ...(orientation === 'horizontal'
          ? {
              top: 0,
              left: 0,
              width: `${canvasSize}px`,
              height: `${thickness}px`,
            }
          : {
              top: 0,
              left: 0,
              width: `${thickness}px`,
              height: `${canvasSize}px`,
            }),
      }}
    >
      {ticks.map((tick, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            backgroundColor: color,
            ...(orientation === 'horizontal'
              ? {
                  left: `${tick.position}px`,
                  top: thickness - tick.size,
                  width: '1px',
                  height: `${tick.size}px`,
                }
              : {
                  top: `${tick.position}px`,
                  left: thickness - tick.size,
                  height: '1px',
                  width: `${tick.size}px`,
                }),
          }}
        />
      ))}
      
      {ticks
        .filter(tick => tick.label)
        .map((tick, index) => (
          <div
            key={`label-${index}`}
            style={{
              position: 'absolute',
              fontSize: '9px',
              color,
              userSelect: 'none',
              ...(orientation === 'horizontal'
                ? {
                    left: `${tick.position}px`,
                    top: '2px',
                    transform: 'translateX(-50%)',
                  }
                : {
                    top: `${tick.position}px`,
                    left: '2px',
                    transform: 'translateY(-50%)',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                  }),
            }}
          >
            {tick.label}
          </div>
        ))}
        
      {/* Display scale ratio in the corner */}
      {showLabels && (
        <div
          style={{
            position: 'absolute',
            fontSize: '9px',
            fontWeight: 'bold',
            color,
            userSelect: 'none',
            ...(orientation === 'horizontal'
              ? {
                  right: '4px',
                  top: '4px',
                }
              : {
                  bottom: '30px',
                  left: '4px',
                  transform: 'rotate(-90deg)',
                  transformOrigin: 'left bottom',
                }),
          }}
        >
          1:{scale}
        </div>
      )}
    </div>
  );
};

export default RealWorldRuler; 