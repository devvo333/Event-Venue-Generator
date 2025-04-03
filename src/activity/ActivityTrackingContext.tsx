import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';

export type ActivityActionType = 
  // Canvas actions
  | 'canvas_edit'
  | 'asset_add'
  | 'asset_delete'
  | 'asset_modify'
  | 'layout_save'
  | 'layout_export'
  | 'floor_plan_import'
  | 'measurement_create'
  
  // Authentication actions
  | 'user_login'
  | 'user_logout'
  | 'profile_update'
  
  // Venue actions
  | 'venue_create'
  | 'venue_update'
  | 'venue_delete'
  | 'venue_view'
  
  // Collaboration actions
  | 'session_join'
  | 'session_leave'
  | 'session_create'
  
  // Tutorial actions
  | 'tutorial_start'
  | 'tutorial_complete'
  
  // Preference actions
  | 'preferences_update';

export interface ActivityEvent {
  action: ActivityActionType;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp?: string;
}

interface ActivityTrackingContextType {
  trackActivity: (event: ActivityEvent) => Promise<void>;
  recentActivities: ActivityEvent[];
  isTracking: boolean;
  enableTracking: () => void;
  disableTracking: () => void;
  clearLocalActivity: () => void;
}

const ActivityTrackingContext = createContext<ActivityTrackingContextType | undefined>(undefined);

interface ActivityTrackingProviderProps {
  children: ReactNode;
  batchSize?: number; // How many events to batch before sending to server
  flushInterval?: number; // How often to send events in milliseconds
}

export const ActivityTrackingProvider: React.FC<ActivityTrackingProviderProps> = ({
  children,
  batchSize = 10,
  flushInterval = 30000, // Default 30 seconds
}) => {
  const { profile } = useAuth();
  const [activityQueue, setActivityQueue] = useState<ActivityEvent[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityEvent[]>([]);
  const [isTracking, setIsTracking] = useState<boolean>(true);
  const [lastFlush, setLastFlush] = useState<number>(Date.now());

  // Load tracking preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('activityTracking');
    if (savedPreference === 'disabled') {
      setIsTracking(false);
    }
  }, []);

  // Regular interval to flush events
  useEffect(() => {
    if (!isTracking) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      if (activityQueue.length > 0 && (now - lastFlush > flushInterval)) {
        flushEvents();
      }
    }, flushInterval / 3); // Check more frequently than the flush interval

    return () => clearInterval(intervalId);
  }, [activityQueue, isTracking, lastFlush, flushInterval]);

  // Flush events when queue reaches batch size
  useEffect(() => {
    if (isTracking && activityQueue.length >= batchSize) {
      flushEvents();
    }
  }, [activityQueue, isTracking, batchSize]);

  // Track activity
  const trackActivity = async (event: ActivityEvent): Promise<void> => {
    if (!isTracking) return;

    // Add timestamp if not provided
    const fullEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };

    // Add to local queue
    setActivityQueue(prev => [...prev, fullEvent]);
    
    // Update recent activities (for UI display if needed)
    setRecentActivities(prev => {
      const newRecent = [fullEvent, ...prev];
      // Keep last 20 activities for display
      return newRecent.slice(0, 20);
    });
  };

  // Flush events to the server
  const flushEvents = async () => {
    if (!profile || activityQueue.length === 0) return;

    try {
      const eventsToSend = [...activityQueue];
      
      // Format events for database
      const formattedEvents = eventsToSend.map(event => ({
        user_id: profile.id,
        action: event.action,
        resource_type: event.resourceType || null,
        resource_id: event.resourceId || null,
        metadata: event.metadata || {},
        created_at: event.timestamp,
      }));

      // Send to Supabase
      const { error } = await supabase
        .from('user_activity_logs')
        .insert(formattedEvents);

      if (error) {
        console.error('Error logging activities:', error);
        return;
      }

      // Clear sent events from queue
      setActivityQueue(prev => 
        prev.filter(event => !eventsToSend.includes(event))
      );
      
      setLastFlush(Date.now());
    } catch (err) {
      console.error('Failed to send activity logs:', err);
    }
  };

  // Enable activity tracking
  const enableTracking = () => {
    setIsTracking(true);
    localStorage.setItem('activityTracking', 'enabled');
  };

  // Disable activity tracking
  const disableTracking = () => {
    setIsTracking(false);
    localStorage.setItem('activityTracking', 'disabled');
    // Flush any remaining events before disabling
    if (activityQueue.length > 0) {
      flushEvents();
    }
  };

  // Clear local activity history
  const clearLocalActivity = () => {
    setRecentActivities([]);
  };

  // Flush events when user logs out
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (activityQueue.length > 0) {
        flushEvents();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Flush any pending events on unmount
      if (activityQueue.length > 0) {
        flushEvents();
      }
    };
  }, [activityQueue]);

  return (
    <ActivityTrackingContext.Provider
      value={{
        trackActivity,
        recentActivities,
        isTracking,
        enableTracking,
        disableTracking,
        clearLocalActivity
      }}
    >
      {children}
    </ActivityTrackingContext.Provider>
  );
};

export const useActivityTracking = () => {
  const context = useContext(ActivityTrackingContext);
  
  if (context === undefined) {
    throw new Error('useActivityTracking must be used within an ActivityTrackingProvider');
  }
  
  return context;
}; 