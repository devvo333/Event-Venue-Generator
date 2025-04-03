# Activity Tracking System

The Event Venue Generator includes a comprehensive activity tracking system that monitors user actions throughout the application. This feature provides insights into user behavior, helps identify popular features, and enables users to review their own activity history.

## Overview

The activity tracking system records a wide range of user actions, from simple navigation to complex venue editing operations. The data collected is used to generate analytics and provide a detailed history of user interactions with the platform.

## Features

### User Activity Logging

- **Comprehensive Event Tracking**: Records various user actions including:
  - Canvas editing operations
  - Asset management (add, modify, delete)
  - Layout operations (save, export)
  - User account actions (login, logout, profile updates)
  - Venue management (create, update, delete)
  - Session management (join, leave, create)
  - Tutorial interactions (start, complete)
  - Preference changes

- **Metadata Collection**: Each activity includes contextual information:
  - Timestamp of action
  - Resource type affected (venue, asset, layout, etc.)
  - Resource identifier 
  - Additional contextual metadata

- **Privacy-Focused**: Users can enable or disable activity tracking at any time

### Activity History

- **Chronological Timeline**: View a sequential list of all actions
- **Filtering**: Filter activity by type, date range, or resource
- **Locally Cached**: Recent activities are stored locally and synced with server
- **Visual Indicators**: Color-coded icons for different activity types

### Analytics Dashboard

- **Usage Patterns**: Visualize activity frequency and patterns
- **Top Actions**: Identify most frequently performed actions
- **Resource Usage**: Track which resources are most accessed
- **Time Distribution**: See activity patterns by hour of day
- **Period Comparison**: Compare activity across different time periods (day, week, month, year)

## Implementation

### Components

1. **ActivityTrackingContext**: React context for tracking and managing user activity
   - Provides hooks for recording activities
   - Manages local caching and periodic server synchronization
   - Controls tracking preferences (enable/disable)

2. **ActivityHistoryPanel**: UI component to display activity history
   - Shows chronological list of user activities
   - Allows filtering and sorting
   - Provides visual indication of activity types

3. **ActivityAnalyticsDashboard**: Visualization of user activity patterns
   - Charts showing activity distribution
   - Statistics on most common actions
   - Time-based analysis of usage patterns

4. **Server-Side Components**:
   - Database schema for storing activity logs
   - API endpoints for collecting and retrieving activity data
   - Analytics generation services

### Database Structure

The activity data is stored in a `user_activity_logs` table in the Supabase database with the following structure:

- `id`: Unique identifier for the activity log entry
- `user_id`: Reference to the user who performed the action
- `action`: The type of action performed
- `resource_type`: Type of resource affected by the action
- `resource_id`: Identifier of the specific resource
- `metadata`: JSON object containing additional context
- `created_at`: Timestamp when the action occurred
- `session_id`: Optional session identifier for grouping related activities

## User Experience

### Activity Dashboard

Users can access their activity history and analytics through the dedicated Activity Dashboard page (`/activity-dashboard`). The dashboard includes:

1. **Analytics Section**:
   - Summary statistics (total activities, most active periods)
   - Graphical representation of activity patterns
   - Breakdown of activity by type

2. **Activity History**:
   - Chronological list of recent activities
   - Filter controls to narrow down displayed activities
   - Visual indicators for different activity types

### Privacy Controls

Users have control over activity tracking through:

- Toggle to enable/disable activity tracking
- Clear button to remove local activity history
- Privacy information explaining data usage

## Technical Considerations

### Performance

- Activities are batched before sending to server
- Local storage prevents data loss during connectivity issues
- Efficient database indexing for fast retrieval

### Security

- Row-level security ensures users can only access their own activity data
- No sensitive information is included in activity logs
- Activity data is isolated from primary application data

## Future Enhancements

Planned improvements to the activity tracking system include:

1. **Enhanced Analytics**: More sophisticated analysis of user behavior patterns
2. **Recommendations**: Personalized feature suggestions based on activity history
3. **Performance Metrics**: Track efficiency and time spent on different tasks
4. **Team Analytics**: Aggregate data for team accounts to identify collaboration patterns
5. **Export Capabilities**: Allow users to export their activity history and analytics

## API Reference

### Client-Side API

```typescript
// Track a new activity
trackActivity({
  action: 'canvas_edit',
  resourceType: 'venue',
  resourceId: '123',
  metadata: { tool: 'move', objects: 2 }
});

// Enable/disable tracking
enableTracking();
disableTracking();

// Clear local activity
clearLocalActivity();
```

### Server-Side API

The following API endpoints are available:

- `POST /api/activities/log`: Log one or more activities
- `GET /api/activities/history`: Retrieve activity history with optional filters
- `GET /api/activities/analytics`: Get analytics for a specific time period

## Conclusion

The activity tracking system provides valuable insights for both users and platform administrators, enabling a better understanding of how the Event Venue Generator is used while maintaining user privacy and control. 