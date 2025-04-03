# Collaborative Editing in Event Venue Generator

This document outlines the collaborative editing capabilities implemented in the Event Venue Generator application, which allow multiple users to work on the same layout simultaneously in real-time.

## Overview

The collaborative editing feature enables:

- Multiple users to edit the same venue layout simultaneously
- Real-time synchronization of all changes across participants
- Visibility of each participant's cursor position and actions
- Clear indication of who is currently editing the layout
- Smooth joining and leaving of collaboration sessions

## Technologies Used

- **Socket.IO**: For real-time bidirectional communication
- **Express**: For the collaboration server backend
- **React Context API**: For managing collaboration state on the client
- **Custom WebSocket Protocol**: For efficient synchronization of editing operations

## Architecture

### Server-Side Components

1. **Collaboration Server**: A standalone Node.js server built with Express and Socket.IO that:
   - Manages active collaboration sessions
   - Tracks participants in each session
   - Broadcasts changes to all session participants
   - Handles cursor position updates
   - Manages session lifecycle events (join/leave)

2. **Session Management**: 
   - Each layout has a unique session identified by the layout ID
   - The server maintains a map of active sessions and their participants
   - When a session becomes empty, it is automatically cleaned up

### Client-Side Components

1. **CollaborationContext**: A React context that:
   - Establishes and maintains the socket connection
   - Provides hooks for components to access collaboration features
   - Manages the local state of collaborative editing
   - Exposes methods for broadcasting changes

2. **CollaborationPanel**: A UI component that:
   - Shows connection status
   - Displays the list of active participants
   - Provides controls to join or leave the collaboration session

3. **RemoteCursors**: Visualizes other users' cursor positions in real-time

4. **CollaborationNotification**: Displays notifications for collaboration events

5. **CollaborativeEditor**: A wrapper component that integrates with the canvas editor

## How It Works

### Initialization

1. The application starts with the collaboration module in a disconnected state
2. When a user opens a layout, they can choose to start collaborating
3. Upon joining, the server adds them to the session and notifies other participants

### Synchronization

1. When a user modifies the layout (moves, creates, deletes assets):
   - The change is applied locally first
   - The change is then broadcast to all other participants
   - Other participants receive the change and apply it to their local state

2. Cursor movement:
   - As users move their cursor, the position is sent to the server
   - The server broadcasts this to other participants
   - Other participants see the remote cursor moving in real-time

### Data Flow

```
┌──────────────┐  Asset Update   ┌──────────────┐  Broadcast   ┌──────────────┐
│ User Action  │ ──────────────> │ Local State  │ ───────────> │ Socket.IO    │
└──────────────┘                 └──────────────┘              └──────────────┘
                                                                      │
                                                                      │
┌──────────────┐  Apply Update   ┌──────────────┐  Receive     ┌──────────────┐
│ Other Users  │ <─────────────  │ Remote State │ <────────────│ Server       │
└──────────────┘                 └──────────────┘              └──────────────┘
```

## User Guide

### Starting Collaboration

1. Open a layout in the editor
2. Look for the "Collaboration" panel in the right sidebar
3. Click "Start Collaborating" to join the session
4. Share the layout URL with others to invite them to collaborate

### During Collaboration

- **Seeing Others**: Other participants appear in the participants list
- **Cursor Tracking**: You can see where others are working with colored cursors
- **Real-time Updates**: All changes made by any participant are visible to everyone
- **Notifications**: You'll be notified when others join or leave the session

### Ending Collaboration

1. Click "Leave Session" in the Collaboration panel
2. Your changes will remain synchronized until you leave

## Running the Collaboration Server

The collaboration server runs separately from the main application:

```bash
# Start the collaboration server
./start-collab-server.sh

# Or manually with Node.js
node server.js
```

By default, the server runs on port 3001 and accepts connections from any origin.

## Implementation Notes

### Security Considerations

- In a production environment, configure CORS to accept only trusted origins
- Implement authentication checks on the server to verify user permissions
- Add validation for incoming data to prevent malicious input

### Performance Optimizations

- Cursor updates are throttled to reduce network traffic
- Asset updates are sent as minimal delta changes when possible
- The server broadcasts only to users in the same session

## Troubleshooting

### Common Issues

1. **Connection Problems**:
   - Check that the collaboration server is running
   - Verify the client is connecting to the correct server URL

2. **Synchronization Issues**:
   - Ensure all participants have the latest version of the application
   - Check for network connectivity problems
   - Try leaving and rejoining the session

3. **Cursor Visibility Issues**:
   - Make sure the canvas container is properly sized
   - Check that cursor tracking is enabled

## Future Enhancements

- Chat functionality between collaborators
- Conflict resolution for simultaneous edits
- User presence awareness (idle, active, typing)
- Role-based permissions (view-only, edit specific elements)
- Session recording and playback
- Mobile support for collaborative editing 