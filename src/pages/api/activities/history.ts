import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { getUserActivities } from '../../../api/activityService';

// Define the response type
type HistoryResponse = {
  success: boolean;
  message: string;
  data?: any[];
  count?: number;
};

/**
 * API endpoint for retrieving user activity history
 * Requires authentication
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HistoryResponse>
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
    
    // Get query parameters
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    // Build filters
    const filters: any = {};
    
    if (req.query.actionTypes) {
      filters.actionTypes = (req.query.actionTypes as string).split(',');
    }
    
    if (req.query.resourceTypes) {
      filters.resourceTypes = (req.query.resourceTypes as string).split(',');
    }
    
    if (req.query.startDate) {
      filters.startDate = req.query.startDate as string;
    }
    
    if (req.query.endDate) {
      filters.endDate = req.query.endDate as string;
    }
    
    if (req.query.sessionId) {
      filters.sessionId = req.query.sessionId as string;
    }
    
    // Get activities
    const result = await getUserActivities(userId, limit, offset, 
      Object.keys(filters).length > 0 ? filters : undefined);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    // Return success
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in activity history API:', err);
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${(err as Error).message}` 
    });
  }
} 