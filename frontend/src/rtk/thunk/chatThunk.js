import { createAsyncThunk } from "@reduxjs/toolkit";
import { main_uri as axios } from "../../service";

// Get all conversations
export const getConversations = createAsyncThunk(
  "chat/getConversations",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/api/v1/chat/conversations");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch conversations"
      );
    }
  }
);

// Get messages in a conversation
export const getMessages = createAsyncThunk(
  "chat/getMessages",
  async (otherUserId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/v1/chat/messages/${otherUserId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch messages"
      );
    }
  }
);

// Send a message
export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/chat/messages", {
        receiverId,
        content,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message"
      );
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  "chat/markAsRead",
  async (otherUserId, { rejectWithValue }) => {
    try {
      await axios.put(`/api/v1/chat/messages/${otherUserId}/read`);
      return otherUserId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to mark messages as read"
      );
    }
  }
);

// Start a conversation
export const startConversation = createAsyncThunk(
  "chat/startConversation",
  async (otherUserId, { rejectWithValue }) => {
    try {
      const response = await axios.post("/api/v1/chat/conversations/start", {
        otherUserId,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start conversation"
      );
    }
  }
);

// Update online status
export const updateOnlineStatus = createAsyncThunk(
  "chat/updateOnlineStatus",
  async (isOnline, { rejectWithValue }) => {
    try {
      await axios.put("/api/v1/chat/status", { isOnline });
      return isOnline;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update status"
      );
    }
  }
);
