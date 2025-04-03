import { Suspense, useState } from 'react';
import { Box, Container } from '@mui/material';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ARButton } from '@react-three/xr';

function Scene() {
  const [red, setRed] = useState(false);

  return (
    <group>
      <mesh 
        position={[0, 1, -1]} 
        onClick={() => setRed(!red)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={red ? 'red' : 'blue'} />
      </mesh>
      <OrbitControls />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
    </group>
  );
}

export default function ARViewer() {
  return (
    <Container>
      <Box sx={{ height: '100vh', width: '100%' }}>
        <ARButton />
        <Canvas>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </Box>
    </Container>
  );
} 