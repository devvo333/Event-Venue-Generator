import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';
import { Asset } from '@/types/assets';

// Define the server URL (would come from env in production)
const SOCKET_SERVER_URL = 'http://localhost:3001';

// Define the shape of a collaboration participant
interface Participant {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  cursor?: { x: number; y: number };
}

// Define the context type
interface CollaborationContextType {
  isConnected: boolean;
  isCollaborating: boolean;
  participants: Participant[];
  cursors: Record<string, { x: number; y: number }>;
  joinSession: (layoutId: string) => void;
  leaveSession: () => void;
  updateCursor: (position: { x: number; y: number }) => void;
  broadcastAssetUpdate: (asset: Asset) => void;
  broadcastAssetCreation: (asset: Asset) => void;
  broadcastAssetDeletion: (assetId: string) => void;
  broadcastLayerReorder: (assets: Asset[]) => void;
  onAssetUpdated: (callback: (asset: Asset) => void) => void;
  onAssetCreated: (callback: (asset: Asset) => void) => void;
  onAssetDeleted: (callback: (assetId: string) => void) => void;
  onLayersReordered: (callback: (assets: Asset[]) => void) => void;
}

// Create the context
const CollaborationContext = createContext<CollaborationContextType | undefined>(undefined);

// Provider props
interface CollaborationProviderProps {
  children: ReactNode;
}

// Create a provider component
export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const { profile } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCollaborating, setIsCollaborating] = useState(false);
  const [currentLayoutId, setCurrentLayoutId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [cursors, setCursors] = useState<Record<string, { x: number; y: number }>>({});
  
  // Asset update callbacks
  const [assetUpdateCallbacks, setAssetUpdateCallbacks] = useState<((asset: Asset) => void)[]>([]);
  const [assetCreateCallbacks, setAssetCreateCallbacks] = useState<((asset: Asset) => void)[]>([]);
  const [assetDeleteCallbacks, setAssetDeleteCallbacks] = useState<((assetId: string) => void)[]>([]);
  const [layerReorderCallbacks, setLayerReorderCallbacks] = useState<((assets: Asset[]) => void)[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    // Set up event listeners
    newSocket.on('connect', () => {
      console.log('Connected to collaboration server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setIsConnected(false);
      setIsCollaborating(false);
      setCurrentLayoutId(null);
      setParticipants([]);
      setCursors({});
    });

    // Clean up on unmount
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, []);

  // Set up session-related event handlers
  useEffect(() => {
    if (!socket) return;

    // Update participants when session updates
    socket.on('session-users-updated', ({ users }: { users: Participant[] }) => {
      setParticipants(users);
    });

    // Handle cursor updates
    socket.on('cursor-moved', ({ userId, position }: { userId: string; position: { x: number; y: number } }) => {
      setCursors(prev => ({
        ...prev,
        [userId]: position
      }));
    });

    // Handle asset updates
    socket.on('asset-update', ({ asset }: { asset: Asset }) => {
      assetUpdateCallbacks.forEach(callback => callback(asset));
    });

    // Handle asset creation
    socket.on('asset-add', ({ asset }: { asset: Asset }) => {
      assetCreateCallbacks.forEach(callback => callback(asset));
    });

    // Handle asset deletion
    socket.on('asset-remove', ({ assetId }: { assetId: string }) => {
      assetDeleteCallbacks.forEach(callback => callback(assetId));
    });

    // Handle layer reordering
    socket.on('update-layers', ({ assets }: { assets: Asset[] }) => {
      layerReorderCallbacks.forEach(callback => callback(assets));
    });

    return () => {
      socket.off('session-users-updated');
      socket.off('cursor-moved');
      socket.off('asset-update');
      socket.off('asset-add');
      socket.off('asset-remove');
      socket.off('update-layers');
    };
  }, [socket, assetUpdateCallbacks, assetCreateCallbacks, assetDeleteCallbacks, layerReorderCallbacks]);

  // Join a collaboration session
  const joinSession = (layoutId: string) => {
    if (!socket || !profile) return;

    console.log(`Joining collaboration session for layout: ${layoutId}`);
    
    socket.emit('join-session', {
      layoutId,
      user: {
        id: profile.id,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      }
    });

    setCurrentLayoutId(layoutId);
    setIsCollaborating(true);
  };

  // Leave a collaboration session
  const leaveSession = () => {
    if (!socket || !currentLayoutId) return;

    console.log(`Leaving collaboration session for layout: ${currentLayoutId}`);
    
    socket.emit('leave-session', {
      layoutId: currentLayoutId
    });

    setCurrentLayoutId(null);
    setIsCollaborating(false);
    setParticipants([]);
    setCursors({});
  };

  // Update cursor position
  const updateCursor = (position: { x: number; y: number }) => {
    if (!socket || !currentLayoutId || !isCollaborating) return;

    socket.emit('cursor-move', {
      layoutId: currentLayoutId,
      position
    });
  };

  // Broadcast asset update
  const broadcastAssetUpdate = (asset: Asset) => {
    if (!socket || !currentLayoutId || !isCollaborating) return;

    socket.emit('asset-updated', {
      layoutId: currentLayoutId,
      asset
    });
  };

  // Broadcast asset creation
  const broadcastAssetCreation = (asset: Asset) => {
    if (!socket || !currentLayoutId || !isCollaborating) return;

    socket.emit('asset-created', {
      layoutId: currentLayoutId,
      asset
    });
  };

  // Broadcast asset deletion
  const broadcastAssetDeletion = (assetId: string) => {
    if (!socket || !currentLayoutId || !isCollaborating) return;

    socket.emit('asset-deleted', {
      layoutId: currentLayoutId,
      assetId
    });
  };

  // Broadcast layer reordering
  const broadcastLayerReorder = (assets: Asset[]) => {
    if (!socket || !currentLayoutId || !isCollaborating) return;

    socket.emit('layers-reordered', {
      layoutId: currentLayoutId,
      assets
    });
  };

  // Register callback for asset updates
  const onAssetUpdated = (callback: (asset: Asset) => void) => {
    setAssetUpdateCallbacks(prev => [...prev, callback]);
    // Return a function to unregister
    return () => {
      setAssetUpdateCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  // Register callback for asset creation
  const onAssetCreated = (callback: (asset: Asset) => void) => {
    setAssetCreateCallbacks(prev => [...prev, callback]);
    // Return a function to unregister
    return () => {
      setAssetCreateCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  // Register callback for asset deletion
  const onAssetDeleted = (callback: (assetId: string) => void) => {
    setAssetDeleteCallbacks(prev => [...prev, callback]);
    // Return a function to unregister
    return () => {
      setAssetDeleteCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  // Register callback for layer reordering
  const onLayersReordered = (callback: (assets: Asset[]) => void) => {
    setLayerReorderCallbacks(prev => [...prev, callback]);
    // Return a function to unregister
    return () => {
      setLayerReorderCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  const value = {
    isConnected,
    isCollaborating,
    participants,
    cursors,
    joinSession,
    leaveSession,
    updateCursor,
    broadcastAssetUpdate,
    broadcastAssetCreation,
    broadcastAssetDeletion,
    broadcastLayerReorder,
    onAssetUpdated,
    onAssetCreated,
    onAssetDeleted,
    onLayersReordered
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};

// Create a hook for using the collaboration context
export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (context === undefined) {
    throw new Error('useCollaboration must be used within a CollaborationProvider');
  }
  return context;
}; 