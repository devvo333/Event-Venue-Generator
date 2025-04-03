export interface Venue {
  id: string;
  name: string;
  width: number;
  length: number;
  height?: number;
  shape: 'rectangle' | 'square' | 'circle' | 'custom';
  features: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  description?: string;
  address?: string;
  capacity?: number;
  floorPlanUrl?: string;
}

export interface Asset {
  id: string;
  type: string;
  name: string;
  category: string;
  url: string;
  width: number;
  height: number;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  visible?: boolean;
  locked?: boolean;
  zIndex?: number;
  properties?: Record<string, any>;
}

export interface Layout {
  id: string;
  name: string;
  venueId: string;
  elements: Asset[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  previewUrl?: string;
  version?: number;
  aiGenerated?: boolean;
  measurements?: Measurement[];
}

export interface Measurement {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  label?: string;
  distance: number;
  unit: 'meters' | 'feet' | 'inches';
  color?: string;
}

export interface CanvasState {
  venue: Venue | null;
  assets: Asset[];
  selectedAsset: Asset | null;
  layout: Layout | null;
  measurements: Measurement[];
  gridVisible: boolean;
  snapToGrid: boolean;
  zoom: number;
  history: CanvasHistoryItem[];
  historyIndex: number;
}

export interface CanvasHistoryItem {
  assets: Asset[];
  measurements: Measurement[];
  timestamp: number;
}

export interface CanvasSettings {
  gridSize: number;
  gridColor: string;
  backgroundColor: string;
  showRulers: boolean;
  showMeasurements: boolean;
  defaultUnit: 'meters' | 'feet' | 'inches';
  snapThreshold: number;
}

// AI-related types for layout suggestions
export interface AILayoutSuggestion {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  confidence: number;
  venueId: string;
  eventType: string;
  guestCount: number;
  layout: Layout;
  createdAt: string;
}

export interface AIStyleRecommendation {
  id: string;
  name: string;
  description: string;
  previewUrl: string;
  colorPalette: string[];
  moodImages: string[];
  venueId: string;
  eventType: string;
  confidence: number;
} 