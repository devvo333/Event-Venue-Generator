import { createClient } from '@supabase/supabase-js';
import { ActivityEvent } from '../activity/ActivityTrackingContext';

// Initialize Supabase client for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Logs multiple user activities to the database
 * @param userId User ID
 * @param events Array of activity events to log
 * @param sessionId Optional session ID to group related activities
 */
export const logActivities = async (
  userId: string,
  events: ActivityEvent[],
  sessionId?: string
): Promise<{ success: boolean; message: string; count?: number }> => {
  if (!userId || !events || events.length === 0) {
    return { success: false, message: 'Invalid input: userId and events required' };
  }

  try {
    // Map the events to the database schema
    const records = events.map(event => ({
      user_id: userId,
      action: event.action,
      resource_type: event.resourceType || null,
      resource_id: event.resourceId || null,
      metadata: event.metadata || {},
      created_at: event.timestamp || new Date().toISOString(),
      session_id: sessionId || null
    }));

    // Insert all records in a single batch
    const { error, count } = await supabase
      .from('user_activity_logs')
      .insert(records)
      .select('count');

    if (error) {
      console.error('Error logging activities:', error);
      return { 
        success: false, 
        message: `Failed to log activities: ${error.message}` 
      };
    }

    return { 
      success: true, 
      message: 'Activities logged successfully', 
      count: count ?? undefined 
    };
  } catch (err) {
    console.error('Exception in logActivities:', err);
    return { 
      success: false, 
      message: `Exception logging activities: ${(err as Error).message}` 
    };
  }
};

/**
 * Retrieves user activity logs with pagination
 * @param userId User ID to fetch activities for
 * @param limit Maximum number of records to retrieve
 * @param offset Number of records to skip (for pagination)
 * @param filters Optional filters for action type, resource type, etc.
 */
export const getUserActivities = async (
  userId: string,
  limit: number = 50,
  offset: number = 0,
  filters?: {
    actionTypes?: string[];
    resourceTypes?: string[];
    startDate?: string;
    endDate?: string;
    sessionId?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  data?: any[];
  count?: number;
}> => {
  if (!userId) {
    return { success: false, message: 'User ID is required' };
  }

  try {
    let query = supabase
      .from('user_activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters if provided
    if (filters) {
      if (filters.actionTypes && filters.actionTypes.length > 0) {
        query = query.in('action', filters.actionTypes);
      }
      
      if (filters.resourceTypes && filters.resourceTypes.length > 0) {
        query = query.in('resource_type', filters.resourceTypes);
      }
      
      if (filters.startDate) {
        query = query.gte('created_at', filters.startDate);
      }
      
      if (filters.endDate) {
        query = query.lte('created_at', filters.endDate);
      }
      
      if (filters.sessionId) {
        query = query.eq('session_id', filters.sessionId);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error retrieving activities:', error);
      return { 
        success: false, 
        message: `Failed to retrieve activities: ${error.message}` 
      };
    }

    return { 
      success: true, 
      message: 'Activities retrieved successfully', 
      data, 
      count: count ?? undefined 
    };
  } catch (err) {
    console.error('Exception in getUserActivities:', err);
    return { 
      success: false, 
      message: `Exception retrieving activities: ${(err as Error).message}` 
    };
  }
};

/**
 * Generates activity analytics for a user
 * @param userId User ID to analyze
 * @param period Period for analytics ('day', 'week', 'month', 'year')
 */
export const getActivityAnalytics = async (
  userId: string,
  period: 'day' | 'week' | 'month' | 'year' = 'week'
): Promise<{
  success: boolean;
  message: string;
  data?: {
    actionCounts: Record<string, number>;
    resourceCounts: Record<string, number>;
    timeDistribution: Record<string, number>;
    mostActive: {
      day?: string;
      hour?: number;
    };
    totalCount: number;
  };
}> => {
  if (!userId) {
    return { success: false, message: 'User ID is required' };
  }

  try {
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    // Fetch activities for the period
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error retrieving activity analytics:', error);
      return { 
        success: false, 
        message: `Failed to retrieve activity analytics: ${error.message}` 
      };
    }

    if (!data || data.length === 0) {
      return { 
        success: true, 
        message: 'No activities found for the selected period',
        data: {
          actionCounts: {},
          resourceCounts: {},
          timeDistribution: {},
          mostActive: {},
          totalCount: 0
        }
      };
    }

    // Process the data to generate analytics
    const actionCounts: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};
    const timeDistribution: Record<string, number> = {};
    const dayDistribution: Record<string, number> = {};
    const hourDistribution: Record<number, number> = {};

    data.forEach(item => {
      // Count by action type
      const action = item.action;
      actionCounts[action] = (actionCounts[action] || 0) + 1;
      
      // Count by resource type
      if (item.resource_type) {
        const resourceType = item.resource_type;
        resourceCounts[resourceType] = (resourceCounts[resourceType] || 0) + 1;
      }
      
      // Distribution by time
      const timestamp = new Date(item.created_at);
      const day = timestamp.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = timestamp.getHours();
      
      // Format as HH:00
      const timeKey = `${hour.toString().padStart(2, '0')}:00`;
      timeDistribution[timeKey] = (timeDistribution[timeKey] || 0) + 1;
      
      // Track distributions for finding most active periods
      dayDistribution[day] = (dayDistribution[day] || 0) + 1;
      hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    });

    // Determine most active day and hour
    let mostActiveDay: string | undefined;
    let mostActiveHour: number | undefined;
    let maxDayCount = 0;
    let maxHourCount = 0;

    Object.entries(dayDistribution).forEach(([day, count]) => {
      if (count > maxDayCount) {
        maxDayCount = count;
        mostActiveDay = day;
      }
    });

    Object.entries(hourDistribution).forEach(([hourStr, count]) => {
      const hour = parseInt(hourStr);
      if (count > maxHourCount) {
        maxHourCount = count;
        mostActiveHour = hour;
      }
    });

    return {
      success: true,
      message: 'Activity analytics generated successfully',
      data: {
        actionCounts,
        resourceCounts,
        timeDistribution,
        mostActive: {
          day: mostActiveDay,
          hour: mostActiveHour
        },
        totalCount: data.length
      }
    };
  } catch (err) {
    console.error('Exception in getActivityAnalytics:', err);
    return { 
      success: false, 
      message: `Exception generating activity analytics: ${(err as Error).message}` 
    };
  }
};

/**
 * Deletes activity logs for a user within a date range
 * @param userId User ID
 * @param options Options for deletion including date range
 */
export const deleteActivityLogs = async (
  userId: string,
  options: {
    startDate?: string;
    endDate?: string;
    actionTypes?: string[];
    resourceTypes?: string[];
    all?: boolean;
  }
): Promise<{ success: boolean; message: string; count?: number }> => {
  if (!userId) {
    return { success: false, message: 'User ID is required' };
  }

  try {
    // Start with basic query
    let query = supabase
      .from('user_activity_logs')
      .delete({ count: 'exact' })
      .eq('user_id', userId);
    
    // Apply filters unless 'all' is specified
    if (!options.all) {
      if (options.startDate) {
        query = query.gte('created_at', options.startDate);
      }
      
      if (options.endDate) {
        query = query.lte('created_at', options.endDate);
      }
      
      if (options.actionTypes && options.actionTypes.length > 0) {
        query = query.in('action', options.actionTypes);
      }
      
      if (options.resourceTypes && options.resourceTypes.length > 0) {
        query = query.in('resource_type', options.resourceTypes);
      }
    }

    const { error, count } = await query;

    if (error) {
      console.error('Error deleting activities:', error);
      return { 
        success: false, 
        message: `Failed to delete activities: ${error.message}` 
      };
    }

    return { 
      success: true, 
      message: `Successfully deleted ${count ?? 0} activity records`, 
      count: count ?? undefined 
    };
  } catch (err) {
    console.error('Exception in deleteActivityLogs:', err);
    return { 
      success: false, 
      message: `Exception deleting activities: ${(err as Error).message}` 
    };
  }
}; 