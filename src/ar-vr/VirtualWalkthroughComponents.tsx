import React from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// Floor component
export const Floor = ({ floorPlanTexture, dimensions }) => {
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
export const Wall = ({ position, width, height, depth, rotation = 0, color = "#f0f0f0" }) => {
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
export const Furniture = ({ item }) => {
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

// Scene transformation utility function
export const transformCanvasDataTo3D = (layout) => {
  const canvasData = layout.canvas_data || {};
  const objects = canvasData.objects || [];
  
  const walls = [];
  const furniture = [];
  
  // Process objects from canvas data
  objects.forEach((obj) => {
    const { type, x, y, width, height, angle, fill } = obj;
    
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