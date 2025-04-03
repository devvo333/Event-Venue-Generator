import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { logActivities } from '../../../api/activityService';
import { ActivityEvent } from '../../../activity/ActivityTrackingContext';

// Define the response type
type LogResponse = {
  success: boolean;
  message: string;
  count?: number;
};

/**
 * API endpoint for logging user activity events
 * Requires authentication
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogResponse>
) {
  // Only allow POST method
  if (req.method !== 'POST') {
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
    
    // Get request body data
    const { events, sessionId } = req.body;
    
    if (!events || !Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bad request: events array is required' 
      });
    }
    
    // Validate event structure
    const validEvents = events.filter((event: any): event is ActivityEvent => {
      return typeof event === 'object' && event !== null && typeof event.action === 'string';
    });
    
    if (validEvents.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bad request: no valid events found' 
      });
    }
    
    // Log activities
    const result = await logActivities(userId, validEvents, sessionId);
    
    if (!result.success) {
      return res.status(500).json(result);
    }
    
    // Return success
    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in activity logging API:', err);
    return res.status(500).json({ 
      success: false, 
      message: `Server error: ${(err as Error).message}` 
    });
  }
} 