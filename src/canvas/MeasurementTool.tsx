import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Line, Text, Circle } from 'react-konva';

interface MeasurementToolProps {
  canvasSize: { width: number; height: number };
  realWorldDimensions: { width: number; height: number; unit: string };
  scale: number;
  visible: boolean;
  onClose: () => void;
}

const MeasurementTool: React.FC<MeasurementToolProps> = ({
  canvasSize,
  realWorldDimensions,
  scale,
  visible,
  onClose,
}) => {
  const [points, setPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [measurements, setMeasurements] = useState<{ distance: number; points: number[] }[]>([]);
  const lineLayerRef = useRef<any>(null);
  
  // Reset the tool when closed
  useEffect(() => {
    if (!visible) {
      setPoints([]);
      setIsDrawing(false);
    }
  }, [visible]);
  
  // Convert pixel distance to real-world distance
  const pixelToRealWorld = (pixelDistance: number): number => {
    const pixelsPerRealWorldUnit = Math.min(
      canvasSize.width / realWorldDimensions.width,
      canvasSize.height / realWorldDimensions.height
    );
    
    return pixelDistance / pixelsPerRealWorldUnit;
  };
  
  // Calculate the distance between two points
  const calculateDistance = (points: number[]): number => {
    if (points.length < 4) return 0;
    
    const dx = points[2] - points[0];
    const dy = points[3] - points[1];
    
    // Calculate pixel distance
    const pixelDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Convert to real-world distance
    return pixelToRealWorld(pixelDistance);
  };
  
  // Handle mouse down - start drawing line
  const handleMouseDown = (e: any) => {
    if (!isDrawing) {
      // Start a new line
      const pos = e.target.getStage().getPointerPosition();
      setPoints([pos.x, pos.y]);
      setIsDrawing(true);
    } else {
      // Complete the line
      const pos = e.target.getStage().getPointerPosition();
      const newPoints = [...points, pos.x, pos.y];
      
      // Add measurement to the list
      const distance = calculateDistance(newPoints);
      setMeasurements([...measurements, { distance, points: newPoints }]);
      
      // Reset for next measurement
      setPoints([]);
      setIsDrawing(false);
    }
  };
  
  // Handle mouse move - update the line
  const handleMouseMove = (e: any) => {
    if (!isDrawing || points.length < 2) return;
    
    const pos = e.target.getStage().getPointerPosition();
    setPoints([...points.slice(0, 2), pos.x, pos.y]);
  };
  
  // Handle clear button
  const handleClear = () => {
    setMeasurements([]);
    setPoints([]);
    setIsDrawing(false);
  };
  
  // Format distance with proper unit
  const formatDistance = (distance: number): string => {
    const unit = realWorldDimensions.unit;
    return `${distance.toFixed(2)} ${unit}`;
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Measurement Tool</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleClear}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Click to place the start point, then click again to place the end point and measure the distance.
          </p>
          <div className="flex items-center text-sm">
            <div className="flex items-center mr-4">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-1"></div>
              <span>Start Point</span>
            </div>
            <div className="flex items-center mr-4">
              <div className="w-4 h-4 rounded-full bg-red-500 mr-1"></div>
              <span>End Point</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-0.5 bg-blue-500 mr-1" style={{ width: '16px' }}></div>
              <span>Measurement Line</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
          <Stage
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            style={{ cursor: isDrawing ? 'crosshair' : 'pointer' }}
          >
            <Layer ref={lineLayerRef}>
              {/* Current measurement line */}
              {isDrawing && points.length >= 2 && (
                <>
                  <Line
                    points={points}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                  <Circle
                    x={points[0]}
                    y={points[1]}
                    radius={5}
                    fill="#3b82f6"
                  />
                  <Circle
                    x={points[2]}
                    y={points[3]}
                    radius={5}
                    fill="#ef4444"
                  />
                  {points.length >= 4 && (
                    <Text
                      x={(points[0] + points[2]) / 2}
                      y={(points[1] + points[3]) / 2 - 15}
                      text={formatDistance(calculateDistance(points))}
                      fontSize={14}
                      fontFamily="Arial"
                      fill="#1f2937"
                      padding={4}
                      background="#ffffff"
                    />
                  )}
                </>
              )}
              
              {/* Saved measurements */}
              {measurements.map((measurement, i) => (
                <React.Fragment key={i}>
                  <Line
                    points={measurement.points}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dash={[5, 5]}
                  />
                  <Circle
                    x={measurement.points[0]}
                    y={measurement.points[1]}
                    radius={5}
                    fill="#3b82f6"
                  />
                  <Circle
                    x={measurement.points[2]}
                    y={measurement.points[3]}
                    radius={5}
                    fill="#ef4444"
                  />
                  <Text
                    x={(measurement.points[0] + measurement.points[2]) / 2}
                    y={(measurement.points[1] + measurement.points[3]) / 2 - 15}
                    text={formatDistance(measurement.distance)}
                    fontSize={14}
                    fontFamily="Arial"
                    fill="#1f2937"
                    padding={4}
                    background="#ffffff"
                  />
                </React.Fragment>
              ))}
            </Layer>
          </Stage>
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-4">
            {measurements.length > 0 ? (
              <div className="flex-1">
                <h3 className="text-sm font-medium mb-2">Measurements:</h3>
                <div className="grid grid-cols-3 gap-4">
                  {measurements.map((measurement, i) => (
                    <div key={i} className="bg-gray-50 p-2 rounded text-sm">
                      <span className="font-medium">Measurement {i + 1}: </span>
                      {formatDistance(measurement.distance)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-gray-500 italic">No measurements recorded yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeasurementTool; 