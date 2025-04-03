import React from 'react';

interface RemoteCursorProps {
  position: { x: number; y: number };
  userName: string;
  color?: string;
}

const RemoteCursor: React.FC<RemoteCursorProps> = ({ 
  position, 
  userName, 
  color = '#3b82f6' // Default to blue
}) => {
  return (
    <div 
      className="absolute pointer-events-none z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-8px, -8px)'
      }}
    >
      {/* Cursor icon */}
      <div 
        className="relative"
        style={{ 
          width: '18px', 
          height: '18px' 
        }}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M6 3L18 14H12L8 16.5V14H6V3Z" 
            fill={color} 
            stroke="white" 
            strokeWidth="1"
          />
        </svg>
        
        {/* Username label */}
        <div 
          className="absolute left-4 top-0 whitespace-nowrap px-2 py-1 rounded text-xs text-white"
          style={{ backgroundColor: color }}
        >
          {userName}
        </div>
      </div>
    </div>
  );
};

export default RemoteCursor; 