declare module '@react-three/fiber' {
  import { ReactThreeFiber } from '@react-three/fiber';
  export const Canvas: React.FC<any>;
  export * from '@react-three/fiber';
}

declare module '@react-three/drei' {
  export const OrbitControls: React.FC<any>;
  export * from '@react-three/drei';
}

declare module '@pmndrs/xr' {
  import { ReactNode } from 'react';

  export interface XRStore {
    enterAR: () => Promise<void>;
    enterVR: () => Promise<void>;
    exit: () => void;
  }

  export interface XRProps {
    store: XRStore;
    children?: ReactNode;
  }

  export interface InteractiveProps {
    onSelect?: () => void;
    children?: ReactNode;
  }

  export const XR: React.FC<XRProps>;
  export const Interactive: React.FC<InteractiveProps>;
  export function createXRStore(config?: {
    mode?: 'AR' | 'VR';
    foveation?: number;
    referenceSpace?: string;
  }): XRStore;
} 