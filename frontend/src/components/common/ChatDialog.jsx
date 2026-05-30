import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  X,
  Send,
  Circle,
  MessageCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../../ui/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../ui/ui/dialog";
import { Input } from "../../ui/ui/input";
import { getMessages, markMessagesAsRead } from "../../rtk/thunk/chatThunk";
import { resetUnreadCount, setCurrentChatUser, clearMessages } from "../../rtk/slice/chatSlice";
import { useSocket } from "../../contexts/SocketContext";
import { ErrorToast } from "./toast";

const ChatDialog = ({ isOpen, onClose, otherUser }) => {
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  const { messages, messagesLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(otherUser?.isOnline || false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Set current chat user and fetch messages when dialog opens
  useEffect(() => {
    if (isOpen && otherUser) {
      console.log("📂 Opening chat with user:", otherUser.id);
      dispatch(setCurrentChatUser(otherUser.id));
      dispatch(getMessages(otherUser.id));
      dispatch(markMessagesAsRead(otherUser.id));
      dispatch(resetUnreadCount(otherUser.id));
      setIsOtherUserOnline(otherUser.isOnline);
    } else if (!isOpen) {
      // Clear current chat user when dialog closes
      dispatch(setCurrentChatUser(null));
    }
  }, [isOpen, otherUser, dispatch]);

  // Socket.IO event listeners for typing and chat-specific events
  useEffect(() => {
    if (!socket || !isOpen || !otherUser) return;

    console.log("🔗 Setting up chat-specific socket listeners");

    // Listen for typing indicators
    const handleTypingStart = (data) => {
      if (data.userId == otherUser.id) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (data) => {
      if (data.userId == otherUser.id) {
        setIsTyping(false);
      }
    };

    // Listen for online/offline status
    const handleUserOnline = (data) => {
      if (data.userId == otherUser.id) {
        setIsOtherUserOnline(true);
      }
    };

    const handleUserOffline = (data) => {
      if (data.userId == otherUser.id) {
        setIsOtherUserOnline(false);
      }
    };

    // Mark messages as read when receiving while chat is open
    const handleMessageReceiveInChat = (message) => {
      if (message?.sender?.id == otherUser.id) {
        console.log("📖 Marking message as read");
        socket.emit("messages:read", { otherUserId: String(otherUser.id) });
        dispatch(resetUnreadCount(otherUser.id));
      }
    };

    socket.on("typing:start", handleTypingStart);
    socket.on("typing:stop", handleTypingStop);
    socket.on("user:online", handleUserOnline);
    socket.on("user:offline", handleUserOffline);
    socket.on("message:receive", handleMessageReceiveInChat);
    socket.on("message:error", (err) => {
      console.error("Message error:", err);
      ErrorToast({ message: err?.error || "Unable to send message" });
      setSending(false);
    });

    return () => {
      console.log("🧹 Cleaning up chat-specific socket listeners");
      socket.off("typing:start", handleTypingStart);
      socket.off("typing:stop", handleTypingStop);
      socket.off("user:online", handleUserOnline);
      socket.off("user:offline", handleUserOffline);
      socket.off("message:receive", handleMessageReceiveInChat);
      socket.off("message:error");
    };
  }, [socket, isOpen, otherUser, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;
    
    if (!socket || !isConnected) {
      ErrorToast({ message: "Not connected to chat server. Please wait..." });
      return;
    }

    setSending(true);
    console.log("📤 Sending message to:", otherUser.id, "Content:", messageText.trim());
    
    try {
      socket.emit("message:send", {
        receiverId: String(otherUser.id),
        content: messageText.trim(),
      });

      setMessageText("");
      // Stop typing indicator
      socket.emit("typing:stop", { receiverId: String(otherUser.id) });
    } catch (error) {
      console.error("Failed to send message:", error);
      ErrorToast({ message: "Failed to send message" });
    } finally {
      // Set sending to false after a small delay to allow message:sent event
      setTimeout(() => setSending(false), 500);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);

    if (!socket) return;

    // Emit typing start
    socket.emit("typing:start", { receiverId: String(otherUser.id) });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { receiverId: String(otherUser.id) });
    }, 1000);
  };

  const formatTime = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString("en-US", { weekday: "short", hour: "2-digit", minute: "2-digit" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const getLastSeenText = () => {
    if (!otherUser.lastSeen) return "";
    const lastSeen = new Date(otherUser.lastSeen);
    const now = new Date();
    const diffInMinutes = Math.floor((now - lastSeen) / (1000 * 60));

    if (diffInMinutes < 1) return "Active now";
    if (diffInMinutes < 60) return `Active ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Active ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Active ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0 bg-white">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                {otherUser?.profileImage ? (
                  <img
                    src={otherUser.profileImage}
                    alt={otherUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple text-white flex items-center justify-center text-lg font-semibold">
                    {otherUser?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <Circle
                  size={12}
                  className={`absolute bottom-0 right-0 ${
                    isOtherUserOnline
                      ? "fill-green text-green"
                      : "fill-gray-400 text-gray-400"
                  }`}
                />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {otherUser?.name}
                </DialogTitle>
                <DialogDescription className="text-xs">
                  {isOtherUserOnline ? (
                    <span className="text-green font-medium">Active now</span>
                  ) : (
                    <span className="text-gray-500">{getLastSeenText()}</span>
                  )}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
          {messagesLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-purple" size={32} />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <MessageCircle size={48} className="mb-2" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isOwnMessage = msg.sender?.id == user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? "bg-purple text-white rounded-br-sm"
                          : "bg-white text-gray-800 rounded-bl-sm border"
                      }`}
                    >
                      <p className="text-sm break-words">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? "text-purple-200" : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.createdAt)}
                        {isOwnMessage && msg.isRead && " • Read"}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-2xl px-4 py-3 rounded-bl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t bg-white">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageText}
              onChange={handleTyping}
              placeholder={isOtherUserOnline ? "Type a message..." : "User is offline (will deliver when they return)"}
              className="flex-1"
              disabled={sending || !isConnected}
              maxLength={1000}
            />
            <Button
              type="submit"
              disabled={!messageText.trim() || sending || !isConnected}
              className="bg-purple hover:opacity-90"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </Button>
          </form>
          {!isConnected && (
            <p className="text-xs text-orange text-center mt-2">
              Connecting to chat server...
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatDialog;
