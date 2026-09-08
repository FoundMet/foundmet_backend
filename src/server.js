import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || 4000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Socket.io Real-time connection handler
io.on("connection", (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join a direct message room between two users
  socket.on("join_room", ({ roomId, user }) => {
    if (roomId) {
      socket.join(roomId);
      console.log(`[Socket.IO] User ${user?.name || socket.id} joined room ${roomId}`);
    }
  });

  // Handle direct message
  socket.on("send_message", (messageData) => {
    // messageData: { roomId, senderId, senderName, senderPhoto, receiverId, text, timestamp }
    if (messageData?.roomId) {
      // Broadcast to room members including sender
      io.to(messageData.roomId).emit("receive_message", {
        ...messageData,
        id: messageData.id || `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: messageData.timestamp || new Date().toISOString()
      });
    }
  });

  // Handle typing state
  socket.on("typing", ({ roomId, userId, userName, isTyping }) => {
    if (roomId) {
      socket.to(roomId).emit("user_typing", { userId, userName, isTyping });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`FoundMet backend & Socket.IO server running on port ${PORT}`);
});
