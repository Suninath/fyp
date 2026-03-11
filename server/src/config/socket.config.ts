import { Server, Socket } from "socket.io";
import { ChatService } from "../service/chat.service";
import jwt from "jsonwebtoken";

const chatService = new ChatService();

// Store online users: userId -> socketId
const onlineUsers = new Map<string, string>();

interface AuthSocket extends Socket {
  userId?: string;
}

// Extract a cookie value by name from the raw cookie header
const getCookie = (cookieHeader: string | undefined, name: string) => {
  if (!cookieHeader) return null;
  for (const pair of cookieHeader.split(";")) {
    const [key, value] = pair.trim().split("=");
    if (key === name && value) return decodeURIComponent(value);
  }
  return null;
};

export const setupSocketIO = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: AuthSocket, next) => {
    try {
      console.log("🔗 Socket attempting to connect:", socket.id, "Handshake headers:", Object.keys(socket.handshake.headers));
      const tokenFromAuth = socket.handshake.auth?.token as string | undefined;
      const tokenFromCookie = getCookie(socket.handshake.headers.cookie, "access_token");
      const token = tokenFromAuth || tokenFromCookie;
      
      console.log("🔐 Socket auth attempt");
      console.log("   - Token from handshake.auth:", !!tokenFromAuth);
      console.log("   - Token from cookie:", !!tokenFromCookie);
      console.log("   - Cookie header:", socket.handshake.headers.cookie ? "present" : "missing");
      
      if (!token) {
        console.log("❌ No token provided - connection rejected");
        return next(new Error("Authentication error: No token"));
      }

      const decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as { id: string | number };
      
      // Always store as string for consistent lookup
      socket.userId = String(decoded.id);
      console.log("✅ Socket authenticated for user:", socket.userId);
      next();
    } catch (error: any) {
      console.error("❌ Socket auth error:", error.message);
      next(new Error("Authentication error: " + error.message));
    }
  });

  io.on("connection", (socket: AuthSocket) => {
    const userIdString = String(socket.userId!);
    const userIdNum = parseInt(userIdString, 10);
    console.log(`✅ User connected: ${userIdString} (socket: ${socket.id})`);

    // Store user as online
    onlineUsers.set(userIdString, socket.id);
    console.log("📊 Online users:", Array.from(onlineUsers.entries()));
    
    // Update user status to online
    chatService.updateOnlineStatus(userIdNum, true);
    
    // Broadcast to all users that this user is online
    io.emit("user:online", { userId: userIdNum, isOnline: true });

    // Join user's personal room
    socket.join(`user:${userIdString}`);

    // Handle sending messages
    socket.on("message:send", async (data: { receiverId: string; content: string }) => {
      try {
        console.log(`📨 Message from ${userIdString} to ${data.receiverId}: "${data.content}"`);
        
        if (!data.receiverId || !data.content) {
          console.error("❌ Invalid message data");
          socket.emit("message:error", { error: "Invalid message data" });
          return;
        }
        
        const receiverIdNum = parseInt(data.receiverId, 10);
        const message = await chatService.sendMessage(userIdNum, receiverIdNum, data.content);
        console.log("💾 Message saved with ID:", message.id);

        // Send to receiver if online
        const receiverIdStr = String(data.receiverId);
        const receiverSocketId = onlineUsers.get(receiverIdStr);
        console.log(`🔍 Looking for receiver ${receiverIdStr}, found socket: ${receiverSocketId}`);
        console.log("📊 Current online users:", Array.from(onlineUsers.entries()));
        
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message:receive", message);
          console.log("✅ Message sent to receiver socket:", receiverSocketId);
        } else {
          console.log("⚠️ Receiver not online, message stored for later");
        }

        // Send confirmation to sender
        socket.emit("message:sent", message);
        console.log("✅ Confirmation sent to sender");
      } catch (error: any) {
        console.error("❌ Error sending message:", error.message);
        socket.emit("message:error", { error: error.message || "Failed to send message" });
      }
    });

    // Handle typing indicator
    socket.on("typing:start", (data: { receiverId: string }) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:start", { userId: userIdNum });
      }
    });

    socket.on("typing:stop", (data: { receiverId: string }) => {
      const receiverSocketId = onlineUsers.get(String(data.receiverId));
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing:stop", { userId: userIdNum });
      }
    });

    // Handle marking messages as read
    socket.on("messages:read", async (data: { otherUserId: string }) => {
      try {
        const otherUserIdNum = parseInt(data.otherUserId, 10);
        await chatService.markAsRead(userIdNum, otherUserIdNum);
        
        // Notify the other user that messages were read
        const otherSocketId = onlineUsers.get(String(data.otherUserId));
        if (otherSocketId) {
          io.to(otherSocketId).emit("messages:read", { userId: userIdNum });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    // Handle disconnect
    socket.on("disconnect", async () => {
      console.log(`User disconnected: ${userIdString}`);
      
      // Remove from online users
      onlineUsers.delete(userIdString);
      
      // Update user status to offline
      await chatService.updateOnlineStatus(userIdNum, false);
      
      // Broadcast to all users that this user is offline
      io.emit("user:offline", { userId: userIdNum, isOnline: false });
    });
  });
};

// Export function to get online users (for API use)
export const getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
