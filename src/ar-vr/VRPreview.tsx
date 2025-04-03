import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Typography, Button, Paper, CircularProgress,
  Card, CardContent, Grid, IconButton, Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import InfoIcon from '@mui/icons-material/Info';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useAuth } from '../auth/AuthContext';
import { fetchLayoutById } from '../services/layoutService';
import { Floor, Wall, Furniture, transformCanvasDataTo3D } from './VirtualWalkthroughComponents';

interface VRPreviewProps {
  isEmbedded?: boolean;
}

const VREnvironment: React.FC<{ layoutData: any }> = ({ layoutData }) => {
  const theme = useTheme();
  const [transformedData, setTransformedData] = useState<any>(null);

  useEffect(() => {
    if (layoutData) {
      const processed = transformCanvasDataTo3D(layoutData);
      setTransformedData(processed);
    }
  }, [layoutData]);

  if (!transformedData) return null;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <Environment preset="sunset" />

      {/* Floor */}
      <Floor 
        floorPlanTexture={transformedData.floorPlanTexture}
        dimensions={transformedData.floorDimensions}
      />

      {/* Walls */}
      {transformedData.walls.map((wall: any, index: number) => (
        <Wall
          key={`wall-${index}`}
          position={wall.position}
          width={wall.dimensions.width}
          height={wall.dimensions.height}
          depth={wall.dimensions.depth}
          rotation={wall.rotation}
          color={theme.palette.grey[300]}
        />
      ))}

      {/* Furniture */}
      {transformedData.furniture.map((item: any, index: number) => (
        <Furniture
          key={`furniture-${index}`}
          item={item}
        />
      ))}

      {/* User Position */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="blue" transparent opacity={0.5} />
      </mesh>
    </>
  );
};

const VRPreview: React.FC<VRPreviewProps> = ({ isEmbedded = false }) => {
  const { layoutId } = useParams<{ layoutId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();

  const [layoutData, setLayoutData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(true);

  useEffect(() => {
    if (!layoutId) {
      setError('No layout ID provided');
      setLoading(false);
      return;
    }

    const loadLayoutData = async () => {
      try {
        setLoading(true);
        const data = await fetchLayoutById(layoutId);
        if (!data) {
          throw new Error('Layout not found');
        }
        setLayoutData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error loading layout:', err);
        setError('Failed to load layout data. Please try again.');
        setLoading(false);
      }
    };

    loadLayoutData();
  }, [layoutId]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={isEmbedded ? "500px" : "80vh"}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Return to Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Box sx={{ 
      height: isEmbedded ? "500px" : "calc(100vh - 64px)",
      position: 'relative', 
      bgcolor: 'background.paper' 
    }}>
      <Canvas 
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 5, 10], fov: 50 }}
      >
        <Suspense fallback={null}>
          <VREnvironment layoutData={layoutData} />
        </Suspense>
        <OrbitControls />
      </Canvas>

      {/* Controls */}
      <Box sx={{ 
        position: 'absolute', 
        top: 16, 
        right: 16, 
        display: 'flex', 
        gap: 1,
        zIndex: 10
      }}>
        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
          <IconButton 
            onClick={toggleFullscreen}
            sx={{ bgcolor: 'background.paper' }}
          >
            {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={showHelp ? "Hide Help" : "Show Help"}>
          <IconButton 
            onClick={() => setShowHelp(!showHelp)}
            sx={{ bgcolor: 'background.paper' }}
          >
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default VRPreview; 