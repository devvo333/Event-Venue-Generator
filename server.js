const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, replace with your client URL
    methods: ["GET", "POST"]
  }
});

// Store active sessions and their participants
const activeSessions = new Map();

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join a collaboration session
  socket.on('join-session', ({ layoutId, user }) => {
    console.log(`User ${user.full_name} joined session for layout ${layoutId}`);
    
    // Add user to session
    socket.join(layoutId);
    
    // Track session participants
    if (!activeSessions.has(layoutId)) {
      activeSessions.set(layoutId, new Map());
    }
    
    const sessionUsers = activeSessions.get(layoutId);
    sessionUsers.set(socket.id, {
      id: user.id,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      cursor: { x: 0, y: 0 }
    });
    
    // Broadcast updated participant list to everyone in the session
    io.to(layoutId).emit('session-users-updated', {
      users: Array.from(sessionUsers.values())
    });
    
    // Notify everyone that a new user joined
    socket.to(layoutId).emit('user-joined', {
      user: {
        id: user.id,
        full_name: user.full_name
      }
    });
  });
  
  // Update cursor position
  socket.on('cursor-move', ({ layoutId, position }) => {
    const sessions = activeSessions.get(layoutId);
    if (sessions && sessions.has(socket.id)) {
      const userData = sessions.get(socket.id);
      userData.cursor = position;
      
      // Broadcast cursor position to other users in the session
      socket.to(layoutId).emit('cursor-moved', {
        userId: userData.id,
        position
      });
    }
  });
  
  // Handle asset updates
  socket.on('asset-updated', ({ layoutId, asset }) => {
    // Broadcast the asset update to everyone except the sender
    socket.to(layoutId).emit('asset-update', { asset });
  });
  
  // Handle asset creation
  socket.on('asset-created', ({ layoutId, asset }) => {
    socket.to(layoutId).emit('asset-add', { asset });
  });
  
  // Handle asset deletion
  socket.on('asset-deleted', ({ layoutId, assetId }) => {
    socket.to(layoutId).emit('asset-remove', { assetId });
  });
  
  // Handle layer reordering
  socket.on('layers-reordered', ({ layoutId, assets }) => {
    socket.to(layoutId).emit('update-layers', { assets });
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove user from all sessions they were part of
    activeSessions.forEach((users, layoutId) => {
      if (users.has(socket.id)) {
        const userData = users.get(socket.id);
        users.delete(socket.id);
        
        // If session is empty, remove it
        if (users.size === 0) {
          activeSessions.delete(layoutId);
        } else {
          // Notify others that user left
          io.to(layoutId).emit('user-left', {
            userId: userData.id
          });
          
          // Update participant list
          io.to(layoutId).emit('session-users-updated', {
            users: Array.from(users.values())
          });
        }
      }
    });
  });
  
  // Handle leaving a session explicitly
  socket.on('leave-session', ({ layoutId }) => {
    socket.leave(layoutId);
    
    const sessions = activeSessions.get(layoutId);
    if (sessions && sessions.has(socket.id)) {
      const userData = sessions.get(socket.id);
      sessions.delete(socket.id);
      
      // If session is empty, remove it
      if (sessions.size === 0) {
        activeSessions.delete(layoutId);
      } else {
        // Notify others that user left
        io.to(layoutId).emit('user-left', {
          userId: userData.id
        });
        
        // Update participant list
        io.to(layoutId).emit('session-users-updated', {
          users: Array.from(sessions.values())
        });
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Collaborative editing server running on port ${PORT}`);
}); 