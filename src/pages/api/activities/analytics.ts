import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { getActivityAnalytics } from '../../../api/activityService';

// Define the response type
type AnalyticsResponse = {
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
};

/**
 * API endpoint for retrieving user activity analytics
 * Requires authentication
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AnalyticsResponse>
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    // Initialize Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          get: (key) => {
            const cookies = req.cookies;
            return cookies[key] ?? '';
          },
          set: (key, value, options) => {
            // We don't need to set cookies in this API route
          },
          remove: (key, options) => {
            // We don't need to remove cookies in this API route
          },
        },
      }
    );
    
    // Check if user is authenticated
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized: Authentication required' 
      });
    }

    // Get user ID from session
    const userId = session.user.id;
    
    // Get period from query parameters (default to 'week')
    const period = (req.query.period as string || 'week') as 'day' | 'week' | 'month' | 'year';
    
    // Validate period
    if (!['day', 'week', 'month', 'year'].includes(period)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid period parameter. Must be one of: day, week, month, year'
      });
    }
    
    // Get analytics
    const result = await getActivityAnalytics(userId, period);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    // Return success
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in activity analytics API:', err);
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${(err as Error).message}` 
    });
  }
} 