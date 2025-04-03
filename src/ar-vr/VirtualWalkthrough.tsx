import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Slider,
  Stack,
  IconButton,
  Alert,
  Tooltip,
  Grid,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  DirectionsWalk as WalkIcon,
  Videocam as CameraIcon,
  Map as MapIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  LightMode as LightModeIcon,
  InfoOutlined as InfoIcon,
  ViewInAr as ViewInArIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  ChevronLeft as ChevronLeftIcon,
  ArrowDropDown as ArrowDropDownIcon,
} from '@mui/icons-material';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  PointerLockControls,
  FirstPersonControls,
  Sky,
  Environment,
  Stats,
  Html,
  useTexture,
} from '@react-three/drei';
import * as THREE from 'three';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// Floor component
const Floor = ({ floorPlanTexture, dimensions }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[dimensions.width || 20, dimensions.length || 20]} />
      <meshStandardMaterial 
        map={floorPlanTexture} 
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  );
};

// Wall component
const Wall = ({ position, width, height, depth, rotation = 0, color = "#f0f0f0" }) => {
  return (
    <mesh 
      position={position} 
      rotation={[0, rotation, 0]} 
      castShadow 
      receiveShadow
    >
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Furniture component
const Furniture = ({ item }) => {
  return (
    <mesh
      position={[item.position.x, item.position.y, item.position.z]}
      rotation={[0, item.rotation || 0, 0]}
      scale={item.scale || [1, 1, 1]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={item.dimensions || [1, 1, 1]} />
      <meshStandardMaterial color={item.color || "#d0d0d0"} />
      {item.label && (
        <Html position={[0, item.dimensions?.[1] / 2 + 0.5, 0]} center>
          <div style={{
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            transform: 'translateY(-20px)',
            pointerEvents: 'none',
          }}>
            {item.label}
          </div>
        </Html>
      )}
    </mesh>
  );
};

// Camera controls wrapper
const Controls = ({ walkSpeed = 2, lookSpeed = 0.5 }) => {
  const controlsRef = useRef();
  const { camera, gl } = useThree();
  
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.lookSpeed = lookSpeed;
      controlsRef.current.movementSpeed = walkSpeed;
    }
  }, [walkSpeed, lookSpeed]);
  
  return (
    <FirstPersonControls
      ref={controlsRef}
      lookSpeed={lookSpeed}
      movementSpeed={walkSpeed}
      lookVertical={true}
      constrainVertical={true}
      verticalMin={Math.PI / 6}
      verticalMax={Math.PI / 2}
      heightCoef={1}
      activeLook={true}
    />
  );
};

// Main scene component
const WalkthroughScene = ({ layoutData, floorPlanTexture, isLoading, walkSpeed, lookSpeed }) => {
  const { scene } = useThree();
  
  useEffect(() => {
    if (!isLoading) {
      // Setup lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 15);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      scene.add(directionalLight);
    }
  }, [scene, isLoading]);
  
  if (isLoading || !layoutData) {
    return (
      <Html center>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 1, color: 'white' }}>
          Loading venue...
        </Typography>
      </Html>
    );
  }
  
  return (
    <>
      <Sky distance={450000} sunPosition={[0, 1, 0]} inclination={0.6} azimuth={0.25} />
      
      {/* Floor */}
      <Floor 
        floorPlanTexture={floorPlanTexture} 
        dimensions={{ 
          width: layoutData.venueWidth || 20, 
          length: layoutData.venueLength || 20 
        }} 
      />
      
      {/* Walls */}
      {layoutData.walls?.map((wall, index) => (
        <Wall 
          key={`wall-${index}`}
          position={[wall.position.x, wall.position.y, wall.position.z]}
          width={wall.width}
          height={wall.height}
          depth={wall.depth}
          rotation={wall.rotation || 0}
          color={wall.color}
        />
      ))}
      
      {/* Furniture */}
      {layoutData.furniture?.map((item, index) => (
        <Furniture key={`furniture-${index}`} item={item} />
      ))}
      
      {/* Controls */}
      <Controls walkSpeed={walkSpeed} lookSpeed={lookSpeed} />
    </>
  );
};

// Mini map component
const MiniMap = ({ layoutData, viewPosition, visible }) => {
  if (!visible || !layoutData) return null;
  
  const mapSize = 150;
  const scale = 0.05; // Scale factor to convert 3D units to map pixels
  
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 16,
        right: 16,
        width: mapSize,
        height: mapSize,
        bgcolor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 1,
        p: 1,
        display: visible ? 'block' : 'none',
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          bgcolor: '#f5f5f5',
          overflow: 'hidden',
        }}
      >
        {/* Map content - walls */}
        {layoutData.walls?.map((wall, index) => (
          <Box
            key={`map-wall-${index}`}
            sx={{
              position: 'absolute',
              left: `${50 + wall.position.x * scale * mapSize}px`,
              top: `${50 + wall.position.z * scale * mapSize}px`,
              width: `${wall.width * scale * mapSize}px`,
              height: `${wall.depth * scale * mapSize}px`,
              bgcolor: wall.color || '#666',
              transform: `translate(-50%, -50%) rotate(${wall.rotation * (180 / Math.PI)}deg)`,
            }}
          />
        ))}
        
        {/* Map content - furniture */}
        {layoutData.furniture?.map((item, index) => (
          <Box
            key={`map-furniture-${index}`}
            sx={{
              position: 'absolute',
              left: `${50 + item.position.x * scale * mapSize}px`,
              top: `${50 + item.position.z * scale * mapSize}px`,
              width: `${item.dimensions?.[0] * scale * mapSize || 5}px`,
              height: `${item.dimensions?.[2] * scale * mapSize || 5}px`,
              bgcolor: item.color || '#999',
              transform: `translate(-50%, -50%) rotate(${item.rotation * (180 / Math.PI)}deg)`,
            }}
          />
        ))}
        
        {/* User position */}
        <Box
          sx={{
            position: 'absolute',
            left: `${50 + viewPosition.x * scale * mapSize}px`,
            top: `${50 + viewPosition.z * scale * mapSize}px`,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'red',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 0 2px white',
          }}
        />
      </Box>
    </Box>
  );
};

// Main VirtualWalkthrough component
const VirtualWalkthrough: React.FC = () => {
  const navigate = useNavigate();
  const { layoutId } = useParams<{ layoutId?: string }>();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const queryLayoutId = queryParams.get('layoutId');
  const queryVenueId = queryParams.get('venueId');
  const supabase = useSupabaseClient();
  
  // Current IDs
  const currentLayoutId = layoutId || queryLayoutId;
  const currentVenueId = queryVenueId;
  
  // State
  const [layoutData, setLayoutData] = useState<any>(null);
  const [venue, setVenue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [floorPlanTexture, setFloorPlanTexture] = useState<THREE.Texture | null>(null);
  const [viewPosition, setViewPosition] = useState({ x: 0, y: 1.7, z: 0 });
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [walkSpeed, setWalkSpeed] = useState(2);
  const [lookSpeed, setLookSpeed] = useState(0.5);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  
  // Fetch layout and venue data
  useEffect(() => {
    const fetchLayoutData = async () => {
      try {
        setLoading(true);
        
        if (!currentLayoutId && !currentVenueId) {
          throw new Error('Layout ID or Venue ID is required');
        }
        
        let layout = null;
        
        // Fetch layout data if layout ID is provided
        if (currentLayoutId) {
          const { data: layoutData, error: layoutError } = await supabase
            .from('layouts')
            .select('*')
            .eq('id', currentLayoutId)
            .single();
          
          if (layoutError) throw layoutError;
          if (!layoutData) throw new Error('Layout not found');
          
          layout = layoutData;
          
          // If venue ID is not provided, get it from the layout
          if (!currentVenueId && layout.venue_id) {
            const { data: venueData, error: venueError } = await supabase
              .from('venues')
              .select('*')
              .eq('id', layout.venue_id)
              .single();
            
            if (venueError) throw venueError;
            if (!venueData) throw new Error('Venue not found');
            
            setVenue(venueData);
          }
        }
        
        // Fetch venue data if venue ID is provided
        if (currentVenueId) {
          const { data: venueData, error: venueError } = await supabase
            .from('venues')
            .select('*')
            .eq('id', currentVenueId)
            .single();
          
          if (venueError) throw venueError;
          if (!venueData) throw new Error('Venue not found');
          
          setVenue(venueData);
          
          // If layout ID is not provided, get the default layout for the venue
          if (!currentLayoutId) {
            const { data: layoutsData, error: layoutsError } = await supabase
              .from('layouts')
              .select('*')
              .eq('venue_id', currentVenueId)
              .eq('is_default', true)
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (layoutsError) throw layoutsError;
            
            if (layoutsData && layoutsData.length > 0) {
              layout = layoutsData[0];
            } else {
              // If no default layout, just get the most recent one
              const { data: recentLayouts, error: recentError } = await supabase
                .from('layouts')
                .select('*')
                .eq('venue_id', currentVenueId)
                .order('created_at', { ascending: false })
                .limit(1);
              
              if (recentError) throw recentError;
              
              if (recentLayouts && recentLayouts.length > 0) {
                layout = recentLayouts[0];
              } else {
                throw new Error('No layouts found for this venue');
              }
            }
          }
        }
        
        if (!layout) throw new Error('Layout not found');
        
        // Process layout data for 3D rendering
        const processedLayout = {
          ...layout,
          // Parse canvas_data JSON if it's a string
          canvas_data: typeof layout.canvas_data === 'string'
            ? JSON.parse(layout.canvas_data)
            : layout.canvas_data,
        };
        
        // Transform canvas data to 3D scene data
        const sceneData = transformCanvasDataTo3D(processedLayout);
        setLayoutData(sceneData);
        
        // Load floor plan texture
        if (processedLayout.floor_plan_url) {
          const textureLoader = new THREE.TextureLoader();
          textureLoader.load(
            processedLayout.floor_plan_url,
            (texture) => {
              setFloorPlanTexture(texture);
              setLoading(false);
            },
            undefined,
            (err) => {
              console.error('Error loading texture:', err);
              setFloorPlanTexture(null);
              setLoading(false);
            }
          );
        } else {
          // Create a default grid texture
          const canvas = document.createElement('canvas');
          canvas.width = 1024;
          canvas.height = 1024;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, 1024, 1024);
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 2;
            const gridSize = 64;
            for (let i = 0; i <= canvas.width; i += gridSize) {
              ctx.beginPath();
              ctx.moveTo(i, 0);
              ctx.lineTo(i, canvas.height);
              ctx.stroke();
            }
            for (let j = 0; j <= canvas.height; j += gridSize) {
              ctx.beginPath();
              ctx.moveTo(0, j);
              ctx.lineTo(canvas.width, j);
              ctx.stroke();
            }
          }
          const texture = new THREE.CanvasTexture(canvas);
          setFloorPlanTexture(texture);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching layout data:', err);
        setError(err.message || 'Failed to load layout data');
        setLoading(false);
      }
    };
    
    fetchLayoutData();
  }, [currentLayoutId, currentVenueId, supabase]);
  
  // Transform canvas data to 3D scene data
  const transformCanvasDataTo3D = (layout) => {
    const canvasData = layout.canvas_data || {};
    const objects = canvasData.objects || [];
    
    const walls = [];
    const furniture = [];
    
    // Process objects from canvas data
    objects.forEach((obj) => {
      const { type, x, y, width, height, scaleX, scaleY, angle, fill, stroke } = obj;
      
      // Scale factor for converting 2D coordinates to 3D
      const scaleFactor = 0.01;
      
      // Convert 2D position to 3D position
      const position = {
        x: (x - 500) * scaleFactor,
        y: 0, // Default height
        z: (y - 500) * scaleFactor
      };
      
      if (type === 'rect' || type === 'wall') {
        // Add as wall if it's a wall or a thin rectangle
        const isWall = type === 'wall' || (width > height * 3 || height > width * 3);
        
        if (isWall) {
          const wallHeight = 2.5;
          const wallWidth = width * scaleFactor;
          const wallDepth = height * scaleFactor;
          
          walls.push({
            position: {
              x: position.x,
              y: wallHeight / 2, // Center height
              z: position.z
            },
            width: wallWidth,
            height: wallHeight,
            depth: wallDepth,
            rotation: (angle || 0) * Math.PI / 180,
            color: fill || '#e0e0e0'
          });
        } else {
          // Regular furniture
          furniture.push({
            position: {
              x: position.x,
              y: 0.25, // Half the height
              z: position.z
            },
            dimensions: [
              width * scaleFactor,
              0.5, // Default height
              height * scaleFactor
            ],
            rotation: (angle || 0) * Math.PI / 180,
            color: fill || '#d0d0d0',
            label: obj.name || null
          });
        }
      } else if (type === 'circle') {
        // Add as circular furniture
        const radius = Math.max(width, height) * scaleFactor / 2;
        furniture.push({
          position: {
            x: position.x,
            y: 0.25, // Half the height
            z: position.z
          },
          dimensions: [radius * 2, 0.5, radius * 2],
          rotation: (angle || 0) * Math.PI / 180,
          color: fill || '#d0d0d0',
          label: obj.name || null
        });
      } else if (type === 'table' || type === 'chair' || type === 'furniture') {
        // Specific furniture types
        const itemHeight = type === 'table' ? 0.75 : 0.5;
        furniture.push({
          position: {
            x: position.x,
            y: itemHeight / 2, // Center height
            z: position.z
          },
          dimensions: [
            width * scaleFactor,
            itemHeight,
            height * scaleFactor
          ],
          rotation: (angle || 0) * Math.PI / 180,
          color: type === 'table' ? '#8B4513' : '#A0522D',
          label: obj.name || type
        });
      }
    });
    
    return {
      walls,
      furniture,
      venueWidth: layout.venue_width || 10,
      venueLength: layout.venue_length || 10,
      name: layout.name || 'Venue Layout'
    };
  };
  
  // Handle navigation back
  const handleBack = () => {
    navigate(-1);
  };
  
  // Toggle settings drawer
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };
  
  return (
    <Box sx={{ height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#121212', position: 'relative' }}>
      {/* Header with controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          p: 2,
          zIndex: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'rgba(0,0,0,0.5)',
          color: 'white',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1 }}>
            {loading ? 'Loading...' : (layoutData?.name || 'Virtual Walkthrough')}
          </Typography>
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Tooltip title={showMiniMap ? "Hide Map" : "Show Map"}>
            <IconButton color="inherit" onClick={() => setShowMiniMap(!showMiniMap)}>
              <MapIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Help">
            <IconButton color="inherit">
              <InfoIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="View in AR">
            <IconButton 
              color="inherit" 
              onClick={() => navigate(`/ar-viewer/${currentLayoutId || ''}${currentVenueId ? `?venueId=${currentVenueId}` : ''}`)}
            >
              <ViewInArIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Settings">
            <IconButton color="inherit" onClick={toggleSettings}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      
      {/* Error message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)', 
            zIndex: 20,
            maxWidth: 400
          }}
        >
          {error}
        </Alert>
      )}
      
      {/* 3D Scene */}
      <Canvas
        shadows
        camera={{ position: [0, 1.7, 0], fov: 75 }}
        style={{ background: '#87CEEB' }}
      >
        {showStats && <Stats />}
        <WalkthroughScene
          layoutData={layoutData}
          floorPlanTexture={floorPlanTexture}
          isLoading={loading}
          walkSpeed={walkSpeed}
          lookSpeed={lookSpeed}
        />
      </Canvas>
      
      {/* Mini Map */}
      <MiniMap
        layoutData={layoutData}
        viewPosition={viewPosition}
        visible={showMiniMap && !loading}
      />
      
      {/* Movement controls for mobile */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: { xs: 'flex', md: 'none' },
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          zIndex: 10,
        }}
      >
        <Paper
          sx={{
            p: 1,
            bgcolor: 'rgba(0,0,0,0.7)',
            color: 'white',
            borderRadius: 2,
          }}
        >
          <Grid container spacing={1}>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <IconButton color="inherit" size="large">
                <ArrowDropDownIcon style={{ transform: 'rotate(180deg)' }} />
              </IconButton>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <IconButton color="inherit" size="large">
                <ArrowDropDownIcon style={{ transform: 'rotate(90deg)' }} />
              </IconButton>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <IconButton color="inherit" size="large">
                <ArrowDropDownIcon style={{ transform: 'rotate(270deg)' }} />
              </IconButton>
            </Grid>
            <Grid item xs={4} sx={{ textAlign: 'center' }}>
              <IconButton color="inherit" size="large">
                <ArrowDropDownIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Paper>
      </Box>
      
      {/* Settings drawer */}
      <Drawer
        anchor="right"
        open={showSettings}
        onClose={toggleSettings}
        PaperProps={{
          sx: {
            width: 300,
            bgcolor: 'background.paper',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={toggleSettings}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>
        
        <List>
          <ListItem>
            <ListItemText
              primary="Walk Speed"
              secondary={
                <Slider
                  value={walkSpeed}
                  onChange={(_, value) => setWalkSpeed(value as number)}
                  min={0.5}
                  max={5}
                  step={0.1}
                  valueLabelDisplay="auto"
                />
              }
            />
          </ListItem>
          
          <ListItem>
            <ListItemText
              primary="Look Speed"
              secondary={
                <Slider
                  value={lookSpeed}
                  onChange={(_, value) => setLookSpeed(value as number)}
                  min={0.1}
                  max={1}
                  step={0.05}
                  valueLabelDisplay="auto"
                />
              }
            />
          </ListItem>
          
          <Divider />
          
          <ListItem>
            <ListItemIcon>
              <MapIcon />
            </ListItemIcon>
            <ListItemText
              primary="Show Mini Map"
              secondary="Display a map of the venue"
            />
            <IconButton 
              edge="end" 
              onClick={() => setShowMiniMap(!showMiniMap)}
              color={showMiniMap ? "primary" : "default"}
            >
              {showMiniMap ? "ON" : "OFF"}
            </IconButton>
          </ListItem>
          
          <ListItem>
            <ListItemIcon>
              <CameraIcon />
            </ListItemIcon>
            <ListItemText
              primary="Show Stats"
              secondary="Display performance statistics"
            />
            <IconButton 
              edge="end" 
              onClick={() => setShowStats(!showStats)}
              color={showStats ? "primary" : "default"}
            >
              {showStats ? "ON" : "OFF"}
            </IconButton>
          </ListItem>
        </List>
        
        <Box sx={{ p: 2, mt: 'auto' }}>
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => navigate(`/ar-viewer/${currentLayoutId || ''}${currentVenueId ? `?venueId=${currentVenueId}` : ''}`)}
            startIcon={<ViewInArIcon />}
          >
            View in AR
          </Button>
        </Box>
      </Drawer>
      
      {/* Instructions overlay (shown on first load) */}
      {!loading && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            maxWidth: 300,
            zIndex: 10,
          }}
        >
          <Paper
            sx={{
              p: 2,
              bgcolor: 'rgba(0,0,0,0.7)',
              color: 'white',
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Controls:
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              • W/A/S/D or Arrow Keys: Move
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              • Mouse: Look around
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              • Shift: Run
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
              • ESC: Release controls
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              Click on the screen to begin navigation
            </Typography>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default VirtualWalkthrough; 