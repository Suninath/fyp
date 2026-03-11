import { createSlice } from "@reduxjs/toolkit";
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  startConversation,
  updateOnlineStatus,
} from "../thunk/chatThunk";

const initialState = {
  conversations: [],
  messages: [],
  messagesLoading: false,
  conversationsLoading: false,
  error: null,
  currentConversation: null,
  totalUnreadCount: 0,
  currentChatUserId: null, // Track which user's chat is open
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversation = null;
      state.currentChatUserId = null;
    },
    setCurrentChatUser: (state, action) => {
      state.currentChatUserId = action.payload;
    },
    addMessage: (state, action) => {
      const newMessage = action.payload;
      if (!newMessage || !newMessage.id) {
        console.warn("addMessage: Invalid message received", newMessage);
        return;
      }
      
      // Prevent duplicate messages
      const exists = state.messages.some((msg) => msg.id == newMessage.id);
      if (!exists) {
        console.log("✅ addMessage: Adding message", newMessage.id, "to current chat");
        state.messages.push(newMessage);
      } else {
        console.log("⚠️ addMessage: Message already exists", newMessage.id);
      }
    },
    // Update conversation when a new message is received
    updateConversationWithMessage: (state, action) => {
      const { message, isIncoming } = action.payload;
      const otherUserId = isIncoming ? message.sender.id : message.receiver.id;
      
      const convIndex = state.conversations.findIndex(
        (conv) => conv.otherUser.id == otherUserId
      );
      
      if (convIndex !== -1) {
        // Update existing conversation
        state.conversations[convIndex].lastMessageText = message.content;
        state.conversations[convIndex].lastMessageAt = message.createdAt;
        
        // Only increment unread count for incoming messages
        if (isIncoming) {
          state.conversations[convIndex].unreadCount = 
            (state.conversations[convIndex].unreadCount || 0) + 1;
        }
        
        // Move conversation to top
        const [conv] = state.conversations.splice(convIndex, 1);
        state.conversations.unshift(conv);
      }
      
      // Recalculate total unread count
      state.totalUnreadCount = state.conversations.reduce(
        (total, conv) => total + (conv.unreadCount || 0), 0
      );
    },
    // Reset unread count for a conversation
    resetUnreadCount: (state, action) => {
      const otherUserId = action.payload;
      const conv = state.conversations.find(
        (c) => c.otherUser.id == otherUserId
      );
      if (conv) {
        conv.unreadCount = 0;
      }
      // Recalculate total unread count
      state.totalUnreadCount = state.conversations.reduce(
        (total, c) => total + (c.unreadCount || 0), 0
      );
    },
    // Update user online status in conversations
    updateUserOnlineStatus: (state, action) => {
      const { userId, isOnline } = action.payload;
      const conv = state.conversations.find(
        (c) => c.otherUser.id == userId
      );
      if (conv) {
        conv.otherUser.isOnline = isOnline;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Conversations
      .addCase(getConversations.pending, (state) => {
        state.conversationsLoading = true;
        state.error = null;
      })
      .addCase(getConversations.fulfilled, (state, action) => {
        state.conversationsLoading = false;
        state.conversations = action.payload || [];
        // Calculate total unread count
        state.totalUnreadCount = (action.payload || []).reduce(
          (total, conv) => total + (conv.unreadCount || 0), 0
        );
      })
      .addCase(getConversations.rejected, (state, action) => {
        state.conversationsLoading = false;
        state.error = action.payload;
      })

      // Get Messages
      .addCase(getMessages.pending, (state) => {
        state.messagesLoading = true;
        state.error = null;
      })
      .addCase(getMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        // Handle both { messages: [...] } and direct array responses
        const fetchedMessages = action.payload?.messages || action.payload || [];
        state.messages = fetchedMessages;
      })
      .addCase(getMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
        state.messages = [];
      })

      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })

      // Mark as Read
      .addCase(markMessagesAsRead.fulfilled, (state) => {
        state.messages = state.messages.map((msg) => ({
          ...msg,
          isRead: true,
        }));
      })

      // Start Conversation
      .addCase(startConversation.fulfilled, (state, action) => {
        state.currentConversation = action.payload;
      })

      // Update Online Status
      .addCase(updateOnlineStatus.fulfilled, (state) => {
        // Status updated
      });
  },
});

export const { 
  clearMessages, 
  addMessage, 
  updateConversationWithMessage, 
  resetUnreadCount,
  updateUserOnlineStatus,
  setCurrentChatUser
} = chatSlice.actions;
export default chatSlice.reducer;
