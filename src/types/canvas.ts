/**
 * Types for Canvas and Asset components
 */

export interface Asset {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  isMovable?: boolean;
  isLocked?: boolean;
  isVisible?: boolean;
  zIndex?: number;
  assetType?: 'furniture' | 'decoration' | 'structural' | 'equipment' | 'plant' | 'other';
  metadata?: Record<string, any>;
}

export interface CanvasElement extends Asset {
  selected?: boolean;
  draggable?: boolean;
}

export interface CanvasDimensions {
  width: number;
  height: number;
  realWorldWidth?: number;
  realWorldHeight?: number;
  unit?: 'meters' | 'feet';
}

export interface CanvasState {
  elements: CanvasElement[];
  selectedIds: string[];
  dimensions: CanvasDimensions;
  gridSize: number;
  showGrid: boolean;
  backgroundImage?: string;
  backgroundImageScale?: number;
  zoomLevel: number;
  history: {
    past: CanvasHistoryState[];
    future: CanvasHistoryState[];
  };
}

export interface CanvasHistoryState {
  elements: CanvasElement[];
  dimensions: CanvasDimensions;
  backgroundImage?: string;
  backgroundImageScale?: number;
}

export type CanvasToolMode = 
  | 'select'
  | 'move'
  | 'scale'
  | 'rotate'
  | 'draw'
  | 'text'
  | 'shape'
  | 'measure';

export interface CanvasToolState {
  mode: CanvasToolMode;
  shapeType?: 'rectangle' | 'circle' | 'line' | 'arrow';
  drawColor?: string;
  fillColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  isDrawing?: boolean;
  startPoint?: { x: number; y: number };
} 