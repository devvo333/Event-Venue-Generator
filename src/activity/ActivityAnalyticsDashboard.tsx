import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import axios from 'axios';

type Period = 'day' | 'week' | 'month' | 'year';

interface AnalyticsData {
  actionCounts: Record<string, number>;
  resourceCounts: Record<string, number>;
  timeDistribution: Record<string, number>;
  mostActive: {
    day?: string;
    hour?: number;
  };
  totalCount: number;
}

interface ActivityAnalyticsDashboardProps {
  className?: string;
}

const ActivityAnalyticsDashboard: React.FC<ActivityAnalyticsDashboardProps> = ({ 
  className = ''
}) => {
  const { profile } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Fetch analytics data when period changes or on component mount
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!profile) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/activities/analytics?period=${period}`);
        
        if (response.data.success && response.data.data) {
          setAnalytics(response.data.data);
        } else {
          setError(response.data.message || 'Failed to load analytics');
        }
      } catch (err) {
        console.error('Error fetching activity analytics:', err);
        setError('Failed to load analytics data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [profile, period]);

  // Helper to format numbers with commas
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };
  
  // Helper to format action names for display
  const formatActionName = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  // Get the background color for action bars
  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      canvas: 'bg-blue-500',
      asset: 'bg-green-500',
      venue: 'bg-yellow-500',
      user: 'bg-purple-500',
      layout: 'bg-indigo-500',
      session: 'bg-red-500',
      tutorial: 'bg-teal-500',
      preferences: 'bg-orange-500',
      floor: 'bg-pink-500',
      measurement: 'bg-pink-500'
    };
    
    const actionType = action.split('_')[0];
    return colors[actionType] || 'bg-gray-500';
  };
  
  // Get the top 5 most frequent actions
  const getTopActions = () => {
    if (!analytics || !analytics.actionCounts) return [];
    
    return Object.entries(analytics.actionCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };
  
  // Get the top 5 most used resource types
  const getTopResources = () => {
    if (!analytics || !analytics.resourceCounts) return [];
    
    return Object.entries(analytics.resourceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };
  
  // Convert time distribution to an array of hours and counts
  const getTimeDistribution = () => {
    if (!analytics || !analytics.timeDistribution) return [];
    
    return Object.entries(analytics.timeDistribution)
      .sort(([a], [b]) => {
        const hourA = parseInt(a.split(':')[0]);
        const hourB = parseInt(b.split(':')[0]);
        return hourA - hourB;
      });
  };
  
  // Format hour for display
  const formatHour = (hour: number) => {
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h} ${ampm}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <h3 className="text-lg font-medium">Activity Analytics</h3>
          <div className="flex items-center mt-2 md:mt-0">
            <span className="mr-2 text-sm text-gray-500">Period:</span>
            <div className="flex bg-gray-100 rounded-md overflow-hidden">
              {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
                <button
                  key={p}
                  className={`px-3 py-1 text-sm ${
                    period === p 
                      ? 'bg-blue-500 text-white' 
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setPeriod(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-500">Loading analytics...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-500">{error}</p>
        </div>
      ) : !analytics ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">No activity data available</p>
        </div>
      ) : (
        <div className="p-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Total Activities</h4>
              <p className="text-2xl font-bold">{formatNumber(analytics.totalCount)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Most Active Day</h4>
              <p className="text-2xl font-bold">{analytics.mostActive.day || "N/A"}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium text-gray-500 mb-1">Peak Activity Hour</h4>
              <p className="text-2xl font-bold">
                {analytics.mostActive.hour !== undefined 
                  ? formatHour(analytics.mostActive.hour) 
                  : "N/A"}
              </p>
            </div>
          </div>
          
          {/* Top Actions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Top Actions</h4>
            <div className="space-y-2">
              {getTopActions().map(([action, count]) => {
                const total = analytics.totalCount;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={action} className="relative">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {formatActionName(action)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full ${getActionColor(action)}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {getTopActions().length === 0 && (
                <p className="text-gray-500 text-sm">No actions recorded</p>
              )}
            </div>
          </div>
          
          {/* Resource Types */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Resource Types</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getTopResources().map(([resourceType, count]) => (
                <div key={resourceType} className="bg-gray-50 rounded p-3 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium capitalize">
                      {resourceType}
                    </span>
                    <span className="text-sm text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </div>
                </div>
              ))}
              
              {getTopResources().length === 0 && (
                <p className="text-gray-500 text-sm">No resources recorded</p>
              )}
            </div>
          </div>
          
          {/* Time Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Activity by Hour</h4>
            <div className="h-40 flex items-end space-x-1">
              {getTimeDistribution().map(([hour, count]) => {
                const hourNumber = parseInt(hour.split(':')[0]);
                const maxCount = Math.max(...Object.values(analytics.timeDistribution));
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                
                return (
                  <div key={hour} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-400 hover:bg-blue-600 rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-1 rotate-45 origin-left">
                      {formatHour(hourNumber)}
                    </span>
                  </div>
                );
              })}
              
              {getTimeDistribution().length === 0 && (
                <p className="text-gray-500 text-sm w-full text-center">No time data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityAnalyticsDashboard; 