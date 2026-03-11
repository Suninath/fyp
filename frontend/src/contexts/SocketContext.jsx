import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { io } from "socket.io-client";
import { 
  updateConversationWithMessage, 
  updateUserOnlineStatus,
  addMessage 
} from "../rtk/slice/chatSlice";
import { getConversations } from "../rtk/thunk/chatThunk";

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const { authenticate } = useSelector((state) => state.auth);

  useEffect(() => {
    // Cleanup existing socket if not authenticated
    if (!authenticate) {
      if (socketRef.current) {
        console.log("Disconnecting socket - user not authenticated");
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Don't create new socket if one already exists and is connected
    if (socketRef.current?.connected) {
      console.log("Socket already connected, skipping reconnection");
      return;
    }

    // Connect to socket server
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    console.log("🔌 Connecting to socket server at:", socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Socket connected with ID:", newSocket.id);
      setIsConnected(true);
      // Refresh conversations when socket connects
      dispatch(getConversations());
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("🔴 Socket connection error:", error.message);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("🔄 Socket reconnected after", attemptNumber, "attempts");
      setIsConnected(true);
    });

    // Global listener for incoming messages
    newSocket.on("message:receive", (message) => {
      console.log("📩 Received message:", message);
      if (message && message.id) {
        dispatch(addMessage(message));
        dispatch(updateConversationWithMessage({ message, isIncoming: true }));
      }
    });

    // Global listener for sent message confirmations
    newSocket.on("message:sent", (message) => {
      console.log("📤 Message sent confirmation:", message);
      if (message && message.id) {
        dispatch(addMessage(message));
        dispatch(updateConversationWithMessage({ message, isIncoming: false }));
      }
    });

    // Global listener for user online status
    newSocket.on("user:online", (data) => {
      console.log("🟢 User online:", data);
      if (data && data.userId) {
        dispatch(updateUserOnlineStatus({ userId: data.userId, isOnline: true }));
      }
    });

    newSocket.on("user:offline", (data) => {
      console.log("⚫ User offline:", data);
      if (data && data.userId) {
        dispatch(updateUserOnlineStatus({ userId: data.userId, isOnline: false }));
      }
    });

    newSocket.on("message:error", (error) => {
      console.error("💬 Message error:", error);
    });

    return () => {
      console.log("🧹 Cleaning up socket connection");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [authenticate, dispatch]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
