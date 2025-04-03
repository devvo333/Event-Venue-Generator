declare module '@react-three/fiber' {
  export * from '@react-three/fiber';
}

declare module '@react-three/drei' {
  export * from '@react-three/drei';
}

declare module '@react-three/xr' {
  export const ARButton: React.ComponentType<any>;
  export const ARCanvas: React.ComponentType<any>;
  export const useXR: () => any;
  export const useHitTest: () => any;
  export const Interactive: React.ComponentType<any>;
}

declare module 'qrcode.react' {
  import * as React from 'react';
  
  export interface QRCodeProps {
    value: string;
    size?: number;
    level?: 'L' | 'M' | 'Q' | 'H';
    bgColor?: string;
    fgColor?: string;
    style?: React.CSSProperties;
    includeMargin?: boolean;
    imageSettings?: {
      src: string;
      height: number;
      width: number;
      excavate?: boolean;
      x?: number;
      y?: number;
    };
  }
  
  const QRCode: React.FC<QRCodeProps>;
  
  export default QRCode;
} 