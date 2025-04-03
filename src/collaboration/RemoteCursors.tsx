import React, { useEffect, useState } from 'react';
import { useCollaboration } from './CollaborationContext';
import RemoteCursor from './RemoteCursor';

interface RemoteCursorsProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

// Color palette for user cursors
const CURSOR_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

const RemoteCursors: React.FC<RemoteCursorsProps> = ({ containerRef }) => {
  const { cursors, participants, isCollaborating } = useCollaboration();
  const [userColors, setUserColors] = useState<Record<string, string>>({});

  // Assign colors to users if they don't have one
  useEffect(() => {
    if (!isCollaborating) return;

    const newUserColors = { ...userColors };
    let colorIndex = 0;

    participants.forEach(participant => {
      if (!newUserColors[participant.id]) {
        newUserColors[participant.id] = CURSOR_COLORS[colorIndex % CURSOR_COLORS.length];
        colorIndex++;
      }
    });

    setUserColors(newUserColors);
  }, [participants, isCollaborating]);

  if (!isCollaborating || !containerRef.current) {
    return null;
  }

  return (
    <>
      {Object.entries(cursors).map(([userId, position]) => {
        const participant = participants.find(p => p.id === userId);
        
        if (!participant) return null;
        
        return (
          <RemoteCursor 
            key={userId}
            position={position}
            userName={participant.full_name}
            color={userColors[userId]}
          />
        );
      })}
    </>
  );
};

export default RemoteCursors; 