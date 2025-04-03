# Canvas Editor Implementation Plan

This document outlines the implementation plan for the Canvas Editor component, the core functionality of the Event Venue Generator application.

## Architecture Overview

The Canvas Editor is built using React and Konva.js (via React-Konva), providing a robust 2D graphics system for manipulating assets on a venue background. The implementation follows a component-based architecture with clear separation of concerns.

## Component Structure

### Main Components

1. **CanvasEditor** (`src/canvas/CanvasEditor.tsx`)
   - Top-level container component
   - Manages overall state and coordinates between panels
   - Handles layout saving/loading

2. **CanvasStage** (`src/canvas/CanvasStage.tsx`)
   - Contains the Konva Stage, layers, and transformers
   - Manages canvas dimensions and scaling
   - Handles mouse and touch interactions

3. **AssetPanel** (`src/canvas/AssetPanel.tsx`)
   - Displays available assets
   - Allows filtering and searching
   - Handles asset selection for placement

4. **ToolPanel** (`src/canvas/ToolPanel.tsx`)
   - Provides tools for manipulating assets
   - Displays properties of selected assets
   - Allows changing tool modes (select, move, scale, rotate)

### Supporting Components

1. **BackgroundLayer** (`src/canvas/BackgroundLayer.tsx`)
   - Manages the venue background image
   - Handles background positioning and scaling

2. **AssetLayer** (`src/canvas/AssetLayer.tsx`)
   - Contains the assets placed on the canvas
   - Manages z-index ordering

3. **Transformers** (`src/canvas/Transformers.tsx`)
   - Provides transformation handles for selected assets
   - Manages resize, rotate operations

4. **LayerPanel** (`src/canvas/LayerPanel.tsx`)
   - Displays the layer hierarchy
   - Allows reordering, hiding, and locking layers

## State Management

The Canvas Editor uses a mix of local component state and a centralized state management approach:

1. **Local Component State**
   - UI-specific state (panel visibility, active tabs)
   - Temporary states (drag operations, hover effects)

2. **Canvas State** (via React Context or state management library)
   - Background image and properties
   - Placed assets and their properties
   - Selection state
   - Tool mode
   - Transformation states

3. **Global State** (via Zustand or Context API)
   - User information
   - Saved layouts
   - Available assets

## Implementation Steps

### Phase 1: Basic Structure

1. **Set up the CanvasEditor component**
   - Create container layout
   - Implement panel toggling
   - Add loading/saving placeholders

2. **Implement basic CanvasStage**
   - Set up Konva Stage
   - Add background and asset layers
   - Implement basic viewport handling

3. **Complete initial AssetPanel**
   - Display asset grid
   - Implement category filtering
   - Add asset selection

4. **Implement initial ToolPanel**
   - Create tool mode buttons
   - Add property controls
   - Implement delete functionality

### Phase 2: Core Functionality

1. **Implement Asset Placement**
   - Drag from asset panel to canvas
   - Initial positioning logic
   - Asset rendering on canvas

2. **Add Asset Transformation**
   - Selection handling
   - Implement Transformer component
   - Rotation, scaling, and movement

3. **Implement Background Handling**
   - Background image loading
   - Positioning and scaling
   - Image fit options

4. **Add Grid and Snapping**
   - Implement grid overlay
   - Add snap-to-grid functionality
   - Implement object snapping

### Phase 3: Advanced Features

1. **Layer Management**
   - Implement layer panel
   - Add z-index management
   - Layer visibility and locking

2. **Implement Undo/Redo**
   - Command pattern for operations
   - History management
   - Keyboard shortcuts

3. **Add Layout Saving/Loading**
   - JSON serialization
   - Database integration
   - Layout metadata handling

4. **Implement Export**
   - PNG export
   - PDF generation
   - Measurement preservation

## Technical Implementation Details

### Canvas Initialization

```typescript
// CanvasStage.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from './canvasStore';

interface CanvasStageProps {
  width: number;
  height: number;
  onSelect: (id: string | null) => void;
}

const CanvasStage: React.FC<CanvasStageProps> = ({ width, height, onSelect }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const { assets, backgroundImage, selectedId, toolMode } = useCanvasStore();

  // Initialize stage dimensions
  const [stageSize, setStageSize] = useState({ width, height });

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Adjust stage size based on container
      if (stageRef.current) {
        const container = stageRef.current.container();
        setStageSize({
          width: container.offsetWidth,
          height: container.offsetHeight
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle stage click
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if clicked on stage but not on any shape
    if (e.target === e.currentTarget) {
      onSelect(null);
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={stageSize.width}
      height={stageSize.height}
      onClick={handleStageClick}
    >
      {/* Background Layer */}
      <Layer>
        {backgroundImage && (
          <Image
            image={backgroundImage}
            width={stageSize.width}
            height={stageSize.height}
          />
        )}
      </Layer>

      {/* Assets Layer */}
      <Layer>
        {/* Asset components will be rendered here */}
      </Layer>

      {/* Selection Layer */}
      <Layer>
        {/* Transformers will be rendered here */}
      </Layer>
    </Stage>
  );
};

export default CanvasStage;
```

### Asset Placement

```typescript
// AssetItem.tsx
import React from 'react';
import { Image, Transformer } from 'react-konva';
import useImage from 'use-image';
import { Asset } from '@/types/assets';

interface AssetItemProps {
  asset: Asset;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onChange: (newAttrs: Partial<Asset>) => void;
}

const AssetItem: React.FC<AssetItemProps> = ({ 
  asset, 
  isSelected, 
  onSelect, 
  onChange 
}) => {
  const [image] = useImage(asset.imageUrl);
  const shapeRef = React.useRef<Konva.Image>(null);
  const trRef = React.useRef<Konva.Transformer>(null);

  React.useEffect(() => {
    if (isSelected && shapeRef.current) {
      // Attach transformer
      trRef.current?.nodes([shapeRef.current]);
      trRef.current?.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Handle drag end
  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    onChange({
      ...asset,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  // Handle transform end
  const handleTransformEnd = () => {
    if (!shapeRef.current) return;

    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();

    onChange({
      ...asset,
      x: node.x(),
      y: node.y(),
      scaleX,
      scaleY,
      rotation,
    });
  };

  return (
    <>
      <Image
        ref={shapeRef}
        image={image}
        x={asset.x || 0}
        y={asset.y || 0}
        width={asset.width || 100}
        height={asset.height || 100}
        scaleX={asset.scaleX || 1}
        scaleY={asset.scaleY || 1}
        rotation={asset.rotation || 0}
        offsetX={(asset.width || 100) / 2}
        offsetY={(asset.height || 100) / 2}
        draggable
        onClick={() => onSelect(asset.id)}
        onTap={() => onSelect(asset.id)}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit resize
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
};

export default AssetItem;
```

### Canvas State Management

```typescript
// canvasStore.ts
import create from 'zustand';
import { Asset } from '@/types/assets';

interface CanvasState {
  // Canvas properties
  backgroundImage: HTMLImageElement | null;
  assets: Asset[];
  selectedId: string | null;
  toolMode: 'select' | 'move' | 'scale' | 'rotate';
  
  // Actions
  setBackgroundImage: (image: HTMLImageElement) => void;
  addAsset: (asset: Asset) => void;
  updateAsset: (id: string, changes: Partial<Asset>) => void;
  removeAsset: (id: string) => void;
  selectAsset: (id: string | null) => void;
  setToolMode: (mode: 'select' | 'move' | 'scale' | 'rotate') => void;
  clearCanvas: () => void;
  loadLayout: (layout: { backgroundImage: string; assets: Asset[] }) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  backgroundImage: null,
  assets: [],
  selectedId: null,
  toolMode: 'select',
  
  setBackgroundImage: (image) => set({ backgroundImage: image }),
  
  addAsset: (asset) => set((state) => ({
    assets: [...state.assets, asset],
    selectedId: asset.id
  })),
  
  updateAsset: (id, changes) => set((state) => ({
    assets: state.assets.map((asset) => 
      asset.id === id ? { ...asset, ...changes } : asset
    )
  })),
  
  removeAsset: (id) => set((state) => ({
    assets: state.assets.filter((asset) => asset.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId
  })),
  
  selectAsset: (id) => set({ selectedId: id }),
  
  setToolMode: (mode) => set({ toolMode: mode }),
  
  clearCanvas: () => set({ assets: [], selectedId: null }),
  
  loadLayout: (layout) => {
    // Load background image
    const img = new Image();
    img.src = layout.backgroundImage;
    img.onload = () => set({ backgroundImage: img });
    
    // Load assets
    set({ assets: layout.assets, selectedId: null });
  }
}));
```

### Layout Saving

```typescript
// layoutService.ts
import { supabase } from '@config/supabase';
import { Asset } from '@/types/assets';

export interface Layout {
  id?: string;
  name: string;
  description?: string;
  venue_id?: string;
  background_image: string;
  json_data: {
    assets: Asset[];
    version: string;
  };
  thumbnail?: string;
  is_public: boolean;
}

export const saveLayout = async (layout: Layout): Promise<{ success: boolean; id?: string; error?: any }> => {
  try {
    const user = supabase.auth.user();
    if (!user) throw new Error('User not authenticated');
    
    // Prepare layout data
    const layoutData = {
      ...layout,
      creator_id: user.id,
    };
    
    // If layout has an ID, update it, otherwise create a new one
    if (layout.id) {
      const { data, error } = await supabase
        .from('layouts')
        .update(layoutData)
        .eq('id', layout.id)
        .single();
        
      if (error) throw error;
      return { success: true, id: data.id };
    } else {
      const { data, error } = await supabase
        .from('layouts')
        .insert([layoutData])
        .single();
        
      if (error) throw error;
      return { success: true, id: data.id };
    }
  } catch (error) {
    console.error('Error saving layout:', error);
    return { success: false, error };
  }
};

export const loadLayout = async (id: string): Promise<{ success: boolean; layout?: Layout; error?: any }> => {
  try {
    const { data, error } = await supabase
      .from('layouts')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return { success: true, layout: data as Layout };
  } catch (error) {
    console.error('Error loading layout:', error);
    return { success: false, error };
  }
};
```

## Canvas Features Implementation Checklist

### Essential Features

- [ ] **Background Image Handling**
  - [ ] Image loading and scaling
  - [ ] Background positioning
  - [ ] Background locking

- [ ] **Asset Placement**
  - [ ] Drag and drop from asset panel
  - [ ] Initial positioning
  - [ ] Basic rendering

- [ ] **Asset Transformation**
  - [ ] Selection system
  - [ ] Moving assets
  - [ ] Scaling assets
  - [ ] Rotating assets
  - [ ] Multi-select

- [ ] **Canvas Navigation**
  - [ ] Panning
  - [ ] Zooming
  - [ ] Reset view

- [ ] **Basic Tools**
  - [ ] Selection tool
  - [ ] Move tool
  - [ ] Scale tool
  - [ ] Rotate tool
  - [ ] Delete function

### Advanced Features

- [ ] **Grid System**
  - [ ] Grid overlay
  - [ ] Snap to grid
  - [ ] Grid size adjustment

- [ ] **Layer Management**
  - [ ] Layer ordering
  - [ ] Layer visibility
  - [ ] Layer locking

- [ ] **History Management**
  - [ ] Undo/redo system
  - [ ] Command pattern implementation
  - [ ] History tree

- [ ] **Alignment Tools**
  - [ ] Alignment guides
  - [ ] Smart alignment
  - [ ] Distribution tools

- [ ] **Serialization**
  - [ ] Layout to JSON
  - [ ] Canvas state persistence
  - [ ] Layout versioning

- [ ] **Export**
  - [ ] PNG export
  - [ ] PDF export with measurements
  - [ ] SVG export

## Performance Considerations

1. **Rendering Optimization**
   - Use Konva's caching mechanism for static objects
   - Implement lazy loading for assets
   - Optimize redraws to minimize unnecessary renders

2. **Large Canvas Handling**
   - Implement virtual scrolling for large layouts
   - Consider using "low-resolution" mode for complex operations
   - Optimize hit detection for better performance

3. **Memory Management**
   - Clean up image objects when no longer needed
   - Manage event listeners properly
   - Implement proper unmounting cleanup

## Accessibility

1. **Keyboard Navigation**
   - Arrow keys for precise movement
   - Keyboard shortcuts for common operations
   - Focus management

2. **Screen Reader Support**
   - ARIA attributes where applicable
   - Alternative text for assets
   - Accessible instructions

3. **Visual Accessibility**
   - High contrast mode
   - Adjustable UI scaling
   - Color blind friendly indicators

## Resources and References

- [Konva.js Documentation](https://konvajs.org/docs/)
- [React-Konva GitHub](https://github.com/konvajs/react-konva)
- [Konva Performance Tips](https://konvajs.org/docs/performance/All_Performance_Tips.html)

---

This implementation plan provides a structured approach to building the Canvas Editor component. It will evolve as the application develops and requirements change. 