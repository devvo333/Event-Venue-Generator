import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@config/supabase'
import { useAuth } from '@hooks/useAuth'
import { useCollaboration } from '../collaboration/CollaborationContext'

// Components
import AssetPanel from '@canvas/AssetPanel'
import ToolPanel from '@canvas/ToolPanel'
import LayerPanel from '@canvas/LayerPanel'
import CanvasStage from '@canvas/CanvasStage'
import BackgroundUploader from '@uploads/BackgroundUploader'
import Ruler from '@canvas/Ruler'
import TextEditor from '@canvas/TextEditor'
import FloorPlanTemplateSelector, { FloorPlanTemplate } from '../templates/FloorPlanTemplates'
import FloorPlanMatcher from './FloorPlanMatcher'
import RealWorldRuler from './RealWorldRuler'
import MeasurementTool from './MeasurementTool'
import CollaborationPanel from '../collaboration/CollaborationPanel'
import RemoteCursors from '../collaboration/RemoteCursors'
import CollaborationNotification from '../collaboration/CollaborationNotification'

// Types
import { Asset } from '@/types/assets'

interface CanvasEditorProps {}

const CanvasEditor: React.FC<CanvasEditorProps> = () => {
  const { layoutId } = useParams<{ layoutId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isConnected } = useCollaboration()
  
  // Canvas state
  const [stageWidth, setStageWidth] = useState(window.innerWidth - 320)
  const [stageHeight, setStageHeight] = useState(window.innerHeight - 100)
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null)
  const [stageScale, setStageScale] = useState(1)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [snapToGrid, setSnapToGrid] = useState(false)
  const [enableAlignment, setEnableAlignment] = useState(true)
  const [scale, setScale] = useState(1)
  
  // Layout and assets state
  const [layoutName, setLayoutName] = useState('Untitled Layout')
  const [assets, setAssets] = useState<Asset[]>([])
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  
  // Editor state
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activePanel, setActivePanel] = useState<'assets' | 'layers'>('assets')
  const [showRightPanel, setShowRightPanel] = useState(true)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const [toolMode, setToolMode] = useState<'select' | 'move' | 'scale' | 'rotate' | 'text' | 'shape'>('select')
  
  // History for undo/redo
  const [history, setHistory] = useState<Asset[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  
  // Add new state variables for rulers
  const [showRulers, setShowRulers] = useState(true)
  const [rulerUnit, setRulerUnit] = useState<'px' | 'cm' | 'in'>('px')
  const [rulerSize] = useState(20) // The width/height of the rulers
  
  // Add state for text editing
  const [editingTextAsset, setEditingTextAsset] = useState<Asset | null>(null);
  const [textEditorPosition, setTextEditorPosition] = useState({ x: 0, y: 0 });
  
  // Add state for current shape
  const [currentShape, setCurrentShape] = useState<'rectangle' | 'circle' | 'line' | 'arrow'>('rectangle');
  
  // Add state for shape settings
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  
  // Add state for template modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  
  // Add new state for template loading and feedback
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateFeedback, setTemplateFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Add state for floor plan matcher modal
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [realWorldDimensions, setRealWorldDimensions] = useState<{ width: number; height: number; unit: string } | null>(null);
  
  // Add state for showing real-world rulers
  const [showRealWorldRulers, setShowRealWorldRulers] = useState(false);
  
  // Add state for grid snap
  const [gridSnap, setGridSnap] = useState(false);
  
  // Add state for measurement tool
  const [showMeasurementTool, setShowMeasurementTool] = useState(false);
  
  // Add interface for drag event
  interface DragEvent {
    target: {
      id: () => string;
      x: () => number;
      y: () => number;
      position: (pos: { x: number, y: number }) => void;
      getLayer: () => { batchDraw: () => void };
    };
  }

  // Add state for stage reference and object positions
  const stageRef = useRef<any>(null);
  const [objectPositions, setObjectPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  // Add a ref for cursor tracking container
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Get collaborative editing functions
  const { 
    isCollaborating,
    broadcastAssetUpdate,
    broadcastAssetCreation,
    broadcastAssetDeletion,
    broadcastLayerReorder,
    updateCursor,
    onAssetUpdated,
    onAssetCreated,
    onAssetDeleted,
    onLayersReordered
  } = useCollaboration();
  
  // On component mount
  useEffect(() => {
    // Update stage dimensions on window resize
    const handleResize = () => {
      const leftPanelWidth = showLeftPanel ? 320 : 0
      const rightPanelWidth = showRightPanel ? 320 : 0
      setStageWidth(window.innerWidth - leftPanelWidth - rightPanelWidth)
      setStageHeight(window.innerHeight - 100)
    }
    
    window.addEventListener('resize', handleResize)
    handleResize()
    
    // Load existing layout if layoutId is provided
    if (layoutId) {
      loadLayout(layoutId)
    }
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [layoutId, showLeftPanel, showRightPanel])
  
  // Track history when assets change
  useEffect(() => {
    if (assets.length === 0 && history.length === 0) return
    
    // Don't add to history if we're navigating through history
    if (historyIndex >= 0 && JSON.stringify(assets) === JSON.stringify(history[historyIndex])) {
      return
    }
    
    // Create new history entry
    const newHistory = historyIndex >= 0 
      ? history.slice(0, historyIndex + 1) 
      : [...history]
    
    newHistory.push([...assets])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [assets])

  const loadLayout = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('layouts')
        .select('*')
        .eq('id', id)
        .single()
        
      if (error) throw error
      
      if (data) {
        setLayoutName(data.name)
        
        // Load background image
        if (data.background_url) {
          const img = new window.Image()
          img.src = data.background_url
          img.onload = () => {
            setBackgroundImage(img)
          }
        }
        
        // Load assets
        if (data.assets) {
          setAssets(data.assets)
        }
      }
    } catch (error) {
      console.error('Error loading layout:', error)
    }
  }

  const handleBackgroundUploaded = (imageUrl: string) => {
    // Load the image
    const image = new Image();
    image.src = imageUrl;
    
    image.onload = () => {
      setIsUploading(false);
      setBackgroundImage(image);
      
      // Reset view
      setStageScale(1);
      setStagePosition({ x: 0, y: 0 });
    };
    
    image.onerror = () => {
      console.error('Failed to load background image');
      setIsUploading(false);
    };
  };

  const handleAssetSelected = (asset: Asset) => {
    // Add the asset to the canvas
    const newAsset = {
      ...asset,
      id: `asset-${Date.now()}`,
      x: stageWidth / 2,
      y: stageHeight / 2,
      rotation: 0,
      width: asset.width || 100,
      height: asset.height || 100,
      scaleX: 1,
      scaleY: 1,
      isVisible: true,
      isLocked: false,
    }
    
    const updatedAssets = [...assets, newAsset]
    setAssets(updatedAssets)
    setSelectedAssetId(newAsset.id)
    
    // Broadcast creation to other users if collaborating
    if (isCollaborating) {
      broadcastAssetCreation(newAsset)
    }
  }

  const handleAddTextAnnotation = () => {
    // Create a new text annotation asset
    const newTextAnnotation: Asset = {
      id: `text-${Date.now()}`,
      name: 'Text Annotation',
      imageUrl: '', // Text annotations don't need images
      category: 'annotation',
      x: stageWidth / 2,
      y: stageHeight / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isVisible: true,
      isLocked: false,
      isTextAnnotation: true,
      text: 'Double-click to edit',
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000'
    }
    
    setAssets([...assets, newTextAnnotation])
    setSelectedAssetId(newTextAnnotation.id)
  }

  const handleAssetUpdate = (updatedAsset: Asset) => {
    // Handle special case for newly created shapes
    if (updatedAsset.id.startsWith('temp-shape-')) {
      // This is a shape update from the drawing process
      // Find the most recently created shape (which should be the last one in the assets array)
      const lastAssetIndex = assets.length - 1;
      
      if (lastAssetIndex >= 0 && assets[lastAssetIndex].isShape) {
        // Update the shape with the dimensions from drawing
        const updatedAssets = [...assets];
        
        // Update the position and dimensions based on the drawing
        updatedAssets[lastAssetIndex] = {
          ...updatedAssets[lastAssetIndex],
          x: updatedAsset.x,
          y: updatedAsset.y,
          width: updatedAsset.width,
          height: updatedAsset.height,
          radius: updatedAsset.radius,
          points: updatedAsset.points
        };
        
        setAssets(updatedAssets);
        return;
      }
    }
    
    // Regular asset updates
    const updatedAssets = assets.map((asset) => 
      (asset.id === updatedAsset.id ? updatedAsset : asset)
    );
    
    setAssets(updatedAssets);
    
    // Broadcast update to other users if collaborating
    if (isCollaborating) {
      broadcastAssetUpdate(updatedAsset);
    }
  }

  const handleLayerReorder = (reorderedAssets: Asset[]) => {
    setAssets(reorderedAssets)
    
    // Broadcast layer reorder to other users if collaborating
    if (isCollaborating) {
      broadcastLayerReorder(reorderedAssets);
    }
  }

  const handleToggleVisibility = (id: string, visible: boolean) => {
    setAssets(
      assets.map((asset) => 
        asset.id === id ? { ...asset, isVisible: visible } : asset
      )
    )
  }

  const handleToggleLock = (id: string, locked: boolean) => {
    setAssets(
      assets.map((asset) => 
        asset.id === id ? { ...asset, isLocked: locked } : asset
      )
    )
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setAssets([...history[newIndex]])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setAssets([...history[newIndex]])
    }
  }

  const handleSaveLayout = async () => {
    if (!user) return
    
    try {
      setIsSaving(true)
      
      // Create a temporary canvas for thumbnail generation
      // This is more reliable than toDataURL on the Stage
      const canvas = document.createElement('canvas')
      canvas.width = 300
      canvas.height = 200
      const ctx = canvas.getContext('2d')
      
      if (ctx && backgroundImage) {
        // Draw background (scaled to fit)
        const scale = Math.min(
          canvas.width / backgroundImage.width,
          canvas.height / backgroundImage.height
        )
        
        const scaledWidth = backgroundImage.width * scale
        const scaledHeight = backgroundImage.height * scale
        const x = (canvas.width - scaledWidth) / 2
        const y = (canvas.height - scaledHeight) / 2
        
        ctx.drawImage(backgroundImage, x, y, scaledWidth, scaledHeight)
        
        // We would draw assets here too if needed for the thumbnail
      }
      
      const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7)
      
      // Prepare layout data
      const layoutData = {
        name: layoutName,
        creator_id: user.id,
        background_url: backgroundImage?.src,
        json_data: { 
          assets: assets,
          stageScale,
          stagePosition
        },
        thumbnail: thumbnailUrl,
        updated_at: new Date().toISOString(),
      }
      
      if (layoutId) {
        // Update existing layout
        const { error } = await supabase
          .from('layouts')
          .update(layoutData)
          .eq('id', layoutId)
          
        if (error) throw error
      } else {
        // Create new layout
        const { data, error } = await supabase
          .from('layouts')
          .insert([layoutData])
          .select()
          
        if (error) throw error
        
        if (data && data[0]) {
          navigate(`/editor/${data[0].id}`)
        }
      }
    } catch (error) {
      console.error('Error saving layout:', error)
    } finally {
      setIsSaving(false)
    }
  }

  // Add a method to handle double-click on a text annotation
  const handleTextDoubleClick = (asset: Asset) => {
    if (asset.isTextAnnotation) {
      setEditingTextAsset(asset);
      
      // Calculate position for the text editor
      // Positioned near the text but accounting for stage position and scale
      const editorX = (asset.x || 0) * stageScale + stagePosition.x + 20;
      const editorY = (asset.y || 0) * stageScale + stagePosition.y + 20;
      
      setTextEditorPosition({ x: editorX, y: editorY });
    }
  };

  // Add a method to save text annotation edits
  const handleSaveTextEdit = (updatedProps: Partial<Asset>) => {
    if (editingTextAsset) {
      const updatedAsset = { ...editingTextAsset, ...updatedProps };
      handleAssetUpdate(updatedAsset);
      setEditingTextAsset(null);
    }
  };

  // Add a method to handle clicks on the text tool button
  const handleTextToolClick = () => {
    if (toolMode === 'text') {
      // If already in text mode, deactivate it
      setToolMode('select');
    } else {
      // Activate text mode and create a new text annotation
      setToolMode('text');
      handleAddTextAnnotation();
    }
  };

  // Add a function to add different types of shapes
  const handleAddShape = (shapeType: 'rectangle' | 'circle' | 'line' | 'arrow') => {
    // When creating shapes from the canvas drawing, we just handle the shape type
    // The actual shape dimensions are determined by the drag action in CanvasStage
    
    // Create base shape properties
    let newShape: Asset = {
      id: `shape-${Date.now()}`,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)} Shape`,
      imageUrl: '',
      category: 'shape',
      x: stageWidth / 2, // Default position that will be overridden by actual drawing
      y: stageHeight / 2,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      isVisible: true,
      isLocked: false,
      isShape: true,
      shapeType: shapeType,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: strokeWidth
    };

    // Add shape-specific default properties
    // These will be replaced with actual dimensions from drawing
    switch (shapeType) {
      case 'rectangle':
        newShape.width = 100;
        newShape.height = 80;
        break;
      case 'circle':
        newShape.radius = 50;
        break;
      case 'line':
      case 'arrow':
        newShape.points = [0, 0, 100, 0];
        break;
    }
    
    setAssets([...assets, newShape]);
    setSelectedAssetId(newShape.id);
    
    // We don't return to select mode after creating a shape
    // This allows users to create multiple shapes in sequence
  };

  // Add a method to handle clicks on the shape tool button
  const handleShapeToolClick = () => {
    if (toolMode === 'shape') {
      // If already in shape mode, deactivate it
      setToolMode('select');
    } else {
      // Activate shape mode - now shapes will be created by drawing on canvas
      setToolMode('shape');
    }
  };

  // Add a method to handle shape type selection
  const handleShapeTypeChange = (shapeType: 'rectangle' | 'circle' | 'line' | 'arrow') => {
    setCurrentShape(shapeType);
    // Don't automatically create a shape, just update the current shape type
  };

  // Add useEffect hook for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events if user is typing in an input field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      switch (e.key.toLowerCase()) {
        // Tool shortcuts
        case 's':
          setToolMode('shape');
          break;
        case 't':
          setToolMode('text');
          break;
        case 'v':
          setToolMode('select');
          break;
        case 'm':
          setToolMode('move');
          break;
        case 'r':
          // If shape tool is active, set rectangle shape
          // Otherwise R is for rotate tool
          if (toolMode === 'shape') {
            setCurrentShape('rectangle');
          } else {
            setToolMode('rotate');
          }
          break;
        
        // Shape type shortcuts (only work when shape tool is active)
        case 'c':
          if (toolMode === 'shape') {
            setCurrentShape('circle');
          }
          break;
        case 'l':
          if (toolMode === 'shape') {
            setCurrentShape('line');
          }
          break;
        case 'a':
          if (toolMode === 'shape') {
            setCurrentShape('arrow');
          }
          break;
        
        // Scale shortcut
        case 'e':
          setToolMode('scale');
          break;
        
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toolMode, setToolMode, setCurrentShape]);

  // Add function to handle template selection
  const handleTemplateSelect = (template: FloorPlanTemplate) => {
    // Set loading state
    setTemplateLoading(true);
    
    // Simulate a small delay to show loading state (remove in production)
    setTimeout(() => {
      try {
        // First clear existing assets if a template is selected
        const shouldClear = assets.length > 0 && 
          window.confirm('Applying this template will clear the current canvas. Do you want to continue?');
        
        if (assets.length > 0 && !shouldClear) {
          setTemplateLoading(false);
          return;
        }
        
        // Clear the canvas
        if (shouldClear) {
          setAssets([]);
        }
        
        // Generate unique IDs for each template asset
        const templateAssets = template.assets.map(asset => ({
          ...asset,
          id: `template-${asset.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        }));
        
        // Add all assets from the template
        setAssets(prev => [...prev, ...templateAssets]);
        
        // Set canvas size based on template
        setStageWidth(1200);
        setStageHeight(800);
        
        // Update history
        const newHistory = historyIndex >= 0
          ? history.slice(0, historyIndex + 1)
          : [...history];
        newHistory.push([...templateAssets]);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        
        // Show a success message
        setTemplateFeedback({
          message: `Template "${template.name}" applied successfully`,
          type: 'success'
        });
        
        // Clear feedback after 3 seconds
        setTimeout(() => {
          setTemplateFeedback(null);
          // Close the modal after feedback is shown
          setShowTemplateModal(false);
        }, 1500);
      } catch (error) {
        console.error('Error applying template:', error);
        setTemplateFeedback({
          message: 'Error applying template. Please try again.',
          type: 'error'
        });
        
        // Clear error after 3 seconds
        setTimeout(() => {
          setTemplateFeedback(null);
        }, 3000);
      } finally {
        setTemplateLoading(false);
      }
    }, 500); // Small delay for UX
  };

  // Update handleFloorPlanDimensions to enable real-world rulers
  const handleFloorPlanDimensions = (dimensions: { width: number; height: number; unit: string }) => {
    setRealWorldDimensions(dimensions);
    
    // Set stage dimensions while maintaining aspect ratio
    const aspectRatio = dimensions.width / dimensions.height;
    
    // Default maximum width for the stage
    const maxStageWidth = 1200;
    
    if (aspectRatio >= 1) {
      // Landscape orientation
      setStageWidth(maxStageWidth);
      setStageHeight(Math.round(maxStageWidth / aspectRatio));
    } else {
      // Portrait orientation
      const maxStageHeight = 800;
      setStageHeight(maxStageHeight);
      setStageWidth(Math.round(maxStageHeight * aspectRatio));
    }
    
    // Update grid size based on the real-world dimensions
    const newGridSize = Math.round((dimensions.unit === 'meters' ? 50 : 15) / scale);
    setGridSize(newGridSize);
    
    // Enable real-world rulers when floor plan dimensions are set
    setShowRealWorldRulers(true);
    
    console.log(`Real-world dimensions set: ${dimensions.width}x${dimensions.height} ${dimensions.unit}`);
  };

  // Add a new toggle function for real-world rulers
  const toggleRealWorldRulers = () => {
    setShowRealWorldRulers(prev => !prev);
  };

  // Add a function to handle floor plan image import
  const handleFloorPlanImported = (imageUrl: string) => {
    // Set the background image to the imported floor plan
    handleBackgroundUploaded(imageUrl);
    
    // You might want to clear existing assets when a new floor plan is imported
    if (window.confirm('Do you want to clear existing assets to start with a fresh floor plan?')) {
      setAssets([]);
      
      // Update history
      const newHistory = historyIndex >= 0
        ? history.slice(0, historyIndex + 1)
        : [...history];
      newHistory.push([]);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Add toggle function for grid snap
  const toggleGridSnap = () => {
    setGridSnap(!gridSnap);
  };

  // Add toggle function for measurement tool
  const toggleMeasurementTool = () => {
    setShowMeasurementTool(prev => !prev);
  };

  // Fix the handleDragEnd function with proper typing
  const handleDragEnd = (e: DragEvent) => {
    const id = e.target.id();
    
    // Apply grid snapping if enabled
    if (gridSnap && gridSize > 0) {
      const shape = e.target;
      const newX = Math.round(shape.x() / gridSize) * gridSize;
      const newY = Math.round(shape.y() / gridSize) * gridSize;
      
      // Update position to snap to grid
      shape.position({
        x: newX,
        y: newY
      });
      shape.getLayer().batchDraw();
    }
    
    // Update asset positions in the state
    const updatedAssets = assets.map(asset => {
      if (asset.id === id) {
        return {
          ...asset,
          x: e.target.x(),
          y: e.target.y()
        };
      }
      return asset;
    });
    
    // Update the assets state which will trigger the history update
    setAssets(updatedAssets);
    setSelectedAssetId(id);
  };

  // Add effect to handle collaborative asset updates
  useEffect(() => {
    if (!isCollaborating) return;

    // Register callback for asset updates from other users
    const unsubscribeAssetUpdate = onAssetUpdated((updatedAsset) => {
      setAssets(currentAssets => 
        currentAssets.map(asset => 
          asset.id === updatedAsset.id ? updatedAsset : asset
        )
      );
    });

    // Register callback for asset creations from other users
    const unsubscribeAssetCreation = onAssetCreated((newAsset) => {
      setAssets(currentAssets => [...currentAssets, newAsset]);
    });

    // Register callback for asset deletions from other users
    const unsubscribeAssetDeletion = onAssetDeleted((assetId) => {
      setAssets(currentAssets => 
        currentAssets.filter(asset => asset.id !== assetId)
      );
    });

    // Register callback for layer reordering from other users
    const unsubscribeLayerReorder = onLayersReordered((reorderedAssets) => {
      setAssets(reorderedAssets);
    });

    // These functions return cleanups
    return () => {
      if (typeof unsubscribeAssetUpdate === 'function') unsubscribeAssetUpdate();
      if (typeof unsubscribeAssetCreation === 'function') unsubscribeAssetCreation();
      if (typeof unsubscribeAssetDeletion === 'function') unsubscribeAssetDeletion();
      if (typeof unsubscribeLayerReorder === 'function') unsubscribeLayerReorder();
    };
  }, [isCollaborating, onAssetUpdated, onAssetCreated, onAssetDeleted, onLayersReordered]);

  // Add effect for cursor position tracking
  useEffect(() => {
    if (!isCollaborating || !canvasContainerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = canvasContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      updateCursor({ x, y });
    };

    const container = canvasContainerRef.current;
    container.addEventListener('mousemove', handleMouseMove);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isCollaborating, updateCursor]);

  // Modify handleAssetDelete for collaboration
  const handleAssetDelete = (id: string) => {
    const updatedAssets = assets.filter((asset) => asset.id !== id);
    setAssets(updatedAssets);
    setSelectedAssetId(null);
    
    // Broadcast deletion to other users if collaborating
    if (isCollaborating) {
      broadcastAssetDeletion(id);
    }
  };

  // Render placeholder if no background is uploaded yet
  if (!backgroundImage) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <BackgroundUploader 
          isUploading={isUploading}
          setIsUploading={setIsUploading}
          onUploadComplete={handleBackgroundUploaded}
        />
      </div>
    )
  }

  // Find selected asset
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId)

  return (
    <div className="flex flex-col h-screen">
      {/* Top tool bar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between">
        <div className="flex items-center">
          <button 
            className="mr-2 p-1 rounded hover:bg-gray-100"
            onClick={() => navigate('/dashboard')}
            title="Back to Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <input
            type="text"
            value={layoutName}
            onChange={(e) => setLayoutName(e.target.value)}
            className="border-none font-semibold text-lg focus:ring-0"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Undo/Redo */}
          <button 
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <button 
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          
          {/* Grid toggle */}
          <button 
            className={`p-1 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setShowGrid(!showGrid)}
            title={showGrid ? 'Hide Grid' : 'Show Grid'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5v14M4 5h16M4 12h16M4 19h16M9 5v14M14 5v14M19 5v14" />
            </svg>
          </button>
          
          {/* Snap to grid toggle */}
          <button 
            className={`p-1 rounded ${snapToGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setSnapToGrid(!snapToGrid)}
            title={snapToGrid ? 'Disable Snap to Grid' : 'Enable Snap to Grid'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </button>
          
          {/* Alignment toggle */}
          <button 
            className={`p-1 rounded ${enableAlignment ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={() => setEnableAlignment(!enableAlignment)}
            title={enableAlignment ? 'Disable Alignment Guides' : 'Enable Alignment Guides'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          
          {/* Reset view */}
          <button 
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => {
              setStageScale(1)
              setStagePosition({ x: 0, y: 0 })
            }}
            title="Reset View"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
          
          {/* Save button */}
          <button
            className="btn btn-primary"
            onClick={handleSaveLayout}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Layout'}
          </button>
          
          {/* Panel toggles */}
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            title={showLeftPanel ? 'Hide Left Panel' : 'Show Left Panel'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setShowRightPanel(!showRightPanel)}
            title={showRightPanel ? 'Hide Right Panel' : 'Show Right Panel'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          {/* Text tool button */}
          <button 
            className={`p-1 rounded ${toolMode === 'text' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
            onClick={handleTextToolClick}
            title="Add Text Annotation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </button>
          
          {/* Shape tool button and dropdown */}
          <div className="relative">
            <button 
              className={`p-1.5 rounded ${toolMode === 'shape' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              onClick={handleShapeToolClick}
              title="Add Shape"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
              </svg>
            </button>
            {toolMode === 'shape' && (
              <div className="absolute z-10 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg">
                <div className="p-2 grid grid-cols-2 gap-1">
                  <button
                    className={`p-2 rounded flex items-center justify-center ${currentShape === 'rectangle' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                    onClick={() => handleShapeTypeChange('rectangle')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                    </svg>
                  </button>
                  <button
                    className={`p-2 rounded flex items-center justify-center ${currentShape === 'circle' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                    onClick={() => handleShapeTypeChange('circle')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    </svg>
                  </button>
                  <button
                    className={`p-2 rounded flex items-center justify-center ${currentShape === 'line' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                    onClick={() => handleShapeTypeChange('line')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <line x1="5" y1="19" x2="19" y2="5" strokeWidth="2" />
                    </svg>
                  </button>
                  <button
                    className={`p-2 rounded flex items-center justify-center ${currentShape === 'arrow' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}
                    onClick={() => handleShapeTypeChange('arrow')}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Add the new template button */}
          <button
            type="button"
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            onClick={() => setShowTemplateModal(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2"
              />
            </svg>
            <span>Templates</span>
          </button>
          
          {/* Add the floor plan button */}
          <button
            type="button"
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2"
            onClick={() => setShowFloorPlanModal(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <span>Floor Plan</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar - Assets/Layers */}
        {showLeftPanel && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  className={`flex-1 py-3 text-center ${
                    activePanel === 'assets' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
                  }`}
                  onClick={() => setActivePanel('assets')}
                >
                  Assets
                </button>
                <button
                  className={`flex-1 py-3 text-center ${
                    activePanel === 'layers' ? 'text-primary border-b-2 border-primary' : 'text-gray-500'
                  }`}
                  onClick={() => setActivePanel('layers')}
                >
                  Layers
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              {activePanel === 'assets' ? (
                <AssetPanel onAssetSelected={handleAssetSelected} />
              ) : (
                <LayerPanel
                  assets={assets}
                  selectedAssetId={selectedAssetId}
                  onAssetSelect={setSelectedAssetId}
                  onLayerReorder={handleLayerReorder}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleLock={handleToggleLock}
                />
              )}
            </div>
          </div>
        )}
        
        {/* Main canvas area */}
        <div className="flex-1 relative">
          {/* Add position styling */}
          <div style={{ 
            paddingTop: showRulers ? `${rulerSize}px` : '25px', 
            paddingLeft: showRulers ? `${rulerSize}px` : '25px', 
            position: 'relative' 
          }}>
            {/* Add real-world rulers when enabled */}
            {showRealWorldRulers && realWorldDimensions && (
              <>
                <RealWorldRuler
                  orientation="horizontal"
                  canvasSize={stageWidth}
                  realWorldSize={realWorldDimensions.width}
                  unit={realWorldDimensions.unit}
                  scale={scale}
                />
                <RealWorldRuler
                  orientation="vertical"
                  canvasSize={stageHeight}
                  realWorldSize={realWorldDimensions.height}
                  unit={realWorldDimensions.unit}
                  scale={scale}
                />
              </>
            )}
            
            <CanvasStage 
              stageWidth={stageWidth}
              stageHeight={stageHeight}
              stageRef={stageRef}
              stageScale={stageScale}
              stagePosition={stagePosition}
              backgroundImage={backgroundImage}
              assets={assets}
              selectedAssetId={selectedAssetId}
              toolMode={toolMode}
              gridSize={gridSize}
              showGrid={showGrid}
              gridSnap={gridSnap}
              onSelect={setSelectedAssetId}
              onPositionChange={setStagePosition}
              onTransformEnd={handleDragEnd}
              onZoom={setStageScale}
              onPan={setStagePosition}
              onTextDoubleClick={handleTextDoubleClick}
              onDrawShape={handleAddShape}
              onPointMeasurement={handleDragEnd}
            />
            
            {/* Render remote cursors when collaborating */}
            {isCollaborating && <RemoteCursors containerRef={canvasContainerRef} />}
          </div>
          
          {/* Show the real-world dimensions info */}
          {realWorldDimensions && (
            <div className="absolute bottom-2 right-2 bg-white px-3 py-1 rounded-md shadow text-sm text-gray-600 opacity-80 hover:opacity-100 transition-opacity">
              {realWorldDimensions.width} × {realWorldDimensions.height} {realWorldDimensions.unit}
              {scale !== 1 && ` (Scale: 1:${scale})`}
            </div>
          )}
        </div>
        
        {/* Right sidebar - Tool panel */}
        {showRightPanel && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="border-b border-gray-200 p-4 flex justify-between items-center">
              <div className="flex">
                <button
                  onClick={() => setActivePanel('assets')}
                  className={`px-3 py-1 text-sm rounded-l ${
                    activePanel === 'assets'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Assets
                </button>
                <button
                  onClick={() => setActivePanel('layers')}
                  className={`px-3 py-1 text-sm rounded-r ${
                    activePanel === 'layers'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Layers
                </button>
              </div>
              <button 
                onClick={() => setShowLeftPanel(!showLeftPanel)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Show tool panel or asset panel based on active tab */}
            {activePanel === 'tools' && (
              <ToolPanel
                selectedAsset={selectedAsset}
                updateAsset={handleAssetUpdate}
                deleteAsset={handleAssetDelete}
                toolMode={toolMode}
                setToolMode={setToolMode}
                gridSettings={{
                  showGrid,
                  setShowGrid,
                  gridSize,
                  setGridSize,
                  snapToGrid,
                  setSnapToGrid
                }}
                alignmentSettings={{
                  enableAlignment,
                  setEnableAlignment
                }}
                rulerSettings={{
                  showRulers,
                  setShowRulers,
                  rulerUnit,
                  setRulerUnit
                }}
                shapeSettings={{
                  currentShape,
                  setCurrentShape: handleShapeTypeChange,
                  strokeWidth,
                  setStrokeWidth,
                  strokeColor,
                  setStrokeColor,
                  fillColor,
                  setFillColor
                }}
              />
            )}
            
            {activePanel === 'assets' && (
              <AssetPanel onAssetSelected={handleAssetSelected} />
            )}
            
            {activePanel === 'layers' && (
              <div className="flex-1 overflow-y-auto">
                <LayerPanel 
                  assets={assets}
                  selectedAssetId={selectedAssetId}
                  onAssetSelect={setSelectedAssetId}
                  onLayerReorder={handleLayerReorder}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleLock={handleToggleLock}
                />
                
                {/* Add the collaboration panel if we have a layoutId */}
                {layoutId && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <CollaborationPanel layoutId={layoutId} />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Bottom toolbar with additional controls */}
      <div className="bg-white border-t border-gray-200 p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleUndo} 
            disabled={historyIndex <= 0}
            className={`p-1 rounded ${historyIndex <= 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button 
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className={`p-1 rounded ${historyIndex >= history.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
          <div className="border-l border-gray-200 h-6 mx-2"></div>
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded ${showGrid ? 'text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Toggle Grid"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          </button>
          <button 
            onClick={() => setShowRulers(!showRulers)}
            className={`p-1 rounded ${showRulers ? 'text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
            title="Toggle Rulers"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <span className="text-xs text-gray-500 mr-2">Zoom:</span>
            <button 
              onClick={() => {
                const newScale = Math.max(0.1, stageScale - 0.1);
                setStageScale(newScale);
              }}
              className="p-1 rounded text-gray-600 hover:bg-gray-100"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-xs font-medium mx-1">{Math.round(stageScale * 100)}%</span>
            <button 
              onClick={() => {
                const newScale = Math.min(5, stageScale + 0.1);
                setStageScale(newScale);
              }}
              className="p-1 rounded text-gray-600 hover:bg-gray-100"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          
          <button 
            onClick={() => {
              setStageScale(1);
              setStagePosition({x: 0, y: 0});
            }}
            className="text-xs text-gray-600 hover:text-gray-900"
          >
            Reset View
          </button>
        </div>
      </div>
      
      {/* Text editor modal */}
      {editingTextAsset && (
        <TextEditor
          asset={editingTextAsset}
          onSave={handleSaveTextEdit}
          onCancel={() => setEditingTextAsset(null)}
          position={textEditorPosition}
        />
      )}
      
      {/* Update the template modal with loading state and feedback */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Floor Plan Templates</h2>
              <button
                onClick={() => {
                  if (!templateLoading) setShowTemplateModal(false);
                }}
                className={`text-gray-500 hover:text-gray-700 ${templateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={templateLoading}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {templateFeedback && (
              <div className={`p-4 ${templateFeedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {templateFeedback.message}
              </div>
            )}
            
            {templateLoading ? (
              <div className="flex flex-col items-center justify-center p-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-gray-600">Applying template...</p>
              </div>
            ) : (
              <div className="p-4">
                <FloorPlanTemplateSelector onSelectTemplate={handleTemplateSelect} />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Add the floor plan modal */}
      {showFloorPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <FloorPlanMatcher
            onDimensionsSet={handleFloorPlanDimensions}
            onFloorPlanImported={handleFloorPlanImported}
            onClose={() => setShowFloorPlanModal(false)}
          />
        </div>
      )}
      
      {/* Add collaboration notifications */}
      <CollaborationNotification />
    </div>
  )
}

export default CanvasEditor 