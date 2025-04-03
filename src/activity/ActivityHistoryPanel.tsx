import React, { useState, useEffect } from 'react';
import { useActivityTracking, ActivityEvent, ActivityActionType } from './ActivityTrackingContext';
import { supabase } from '../config/supabase';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';

// Activity icon mapping
const getActivityIcon = (action: string) => {
  switch (action) {
    case 'canvas_edit':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
      );
    case 'asset_add':
    case 'asset_modify':
    case 'asset_delete':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V9z" clipRule="evenodd" />
        </svg>
      );
    case 'layout_save':
    case 'layout_export':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
        </svg>
      );
    case 'user_login':
    case 'user_logout':
    case 'profile_update':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      );
    case 'venue_create':
    case 'venue_update':
    case 'venue_delete':
    case 'venue_view':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      );
    case 'session_join':
    case 'session_leave':
    case 'session_create':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      );
    case 'tutorial_start':
    case 'tutorial_complete':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
      );
    case 'preferences_update':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
        </svg>
      );
    case 'floor_plan_import':
    case 'measurement_create':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      );
  }
};

// Format action name for display
const formatActionName = (action: string) => {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface ActivityHistoryPanelProps {
  className?: string;
  maxItems?: number;
  showClear?: boolean;
  showFilters?: boolean;
}

const ActivityHistoryPanel: React.FC<ActivityHistoryPanelProps> = ({
  className = '',
  maxItems = 20,
  showClear = true,
  showFilters = true,
}) => {
  const { profile } = useAuth();
  const { recentActivities, clearLocalActivity, isTracking, enableTracking, disableTracking } = useActivityTracking();
  const [dbActivities, setDbActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [combinedActivities, setCombinedActivities] = useState<ActivityEvent[]>([]);

  // Load activities from database
  useEffect(() => {
    const loadActivities = async () => {
      if (!profile) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_activity_logs')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(maxItems);

        if (error) {
          console.error('Error loading activities:', error);
          return;
        }

        // Map DB format to ActivityEvent format
        if (data) {
          const mappedData: ActivityEvent[] = data.map(item => ({
            action: item.action as ActivityActionType,
            resourceType: item.resource_type,
            resourceId: item.resource_id,
            metadata: item.metadata,
            timestamp: item.created_at,
          }));
          setDbActivities(mappedData);
        }
      } catch (err) {
        console.error('Failed to load activities:', err);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [profile, maxItems]);

  // Combine local and DB activities
  useEffect(() => {
    // Combine and sort by timestamp
    const combined = [...recentActivities, ...dbActivities]
      .sort((a, b) => {
        const dateA = new Date(a.timestamp || '');
        const dateB = new Date(b.timestamp || '');
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, maxItems);

    // Apply filter if active
    if (activeFilter) {
      const filtered = combined.filter(activity => activity.action.includes(activeFilter));
      setCombinedActivities(filtered);
    } else {
      setCombinedActivities(combined);
    }
  }, [recentActivities, dbActivities, activeFilter, maxItems]);

  // Get unique action types for filters
  const actionTypes = Array.from(new Set(
    combinedActivities.map(activity => activity.action.split('_')[0])
  ));

  const handleFilterClick = (filter: string) => {
    if (activeFilter === filter) {
      setActiveFilter(null);
    } else {
      setActiveFilter(filter);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Recent Activity</h3>
          <div className="flex items-center space-x-2">
            {showClear && (
              <button
                className="text-sm text-gray-500 hover:text-red-500"
                onClick={clearLocalActivity}
              >
                Clear
              </button>
            )}
            <div className="flex items-center text-sm">
              <span className="mr-2">Tracking:</span>
              <button
                className={`px-2 py-1 rounded-l-md ${isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}
                onClick={enableTracking}
              >
                On
              </button>
              <button
                className={`px-2 py-1 rounded-r-md ${!isTracking ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'}`}
                onClick={disableTracking}
              >
                Off
              </button>
            </div>
          </div>
        </div>
        
        {showFilters && actionTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {actionTypes.map(type => (
              <button
                key={type}
                onClick={() => handleFilterClick(type)}
                className={`px-2 py-1 text-xs rounded-full ${
                  activeFilter === type 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
            {activeFilter && (
              <button
                onClick={() => setActiveFilter(null)}
                className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear Filter
              </button>
            )}
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading activity...</div>
        ) : combinedActivities.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No activity recorded yet</div>
        ) : (
          combinedActivities.map((activity, index) => (
            <div key={index} className="flex items-start p-3 hover:bg-gray-50">
              <div className="flex-shrink-0 mr-3 mt-1">
                {getActivityIcon(activity.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {formatActionName(activity.action)}
                </p>
                {activity.resourceType && (
                  <p className="text-xs text-gray-500">
                    {activity.resourceType.charAt(0).toUpperCase() + activity.resourceType.slice(1)}
                    {activity.resourceId && `: ${activity.resourceId}`}
                  </p>
                )}
                {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                  <p className="text-xs text-gray-500 truncate">
                    {Object.entries(activity.metadata)
                      .map(([key, value]) => `${key}: ${
                        typeof value === 'object' ? 'Object' : String(value).substring(0, 20)
                      }`)
                      .join(', ')}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 ml-3">
                <p className="text-xs text-gray-500">
                  {activity.timestamp && format(new Date(activity.timestamp), 'MMM d, h:mm a')}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
      
      {!isTracking && (
        <div className="p-3 bg-yellow-50 text-yellow-800 text-sm">
          Activity tracking is currently disabled. Enable tracking to record your actions.
        </div>
      )}
    </div>
  );
};

export default ActivityHistoryPanel; 