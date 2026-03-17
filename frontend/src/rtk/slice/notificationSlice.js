import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "../thunk/notificationThunk";

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    perpage: 20,
    count: 0,
    totalPages: 1,
  },
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    prependRealtimeNotification: (state, action) => {
      const incoming = action.payload;
      if (!incoming?.id) {
        return;
      }

      const exists = state.items.some((item) => item.id === incoming.id);
      if (exists) {
        return;
      }

      state.items.unshift(incoming);
      if (!incoming.isRead) {
        state.unreadCount += 1;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload?.items || [];
        state.pagination = action.payload?.pagination || initialState.pagination;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchUnreadNotificationCount.fulfilled, (state, action) => {
        state.unreadCount = Number(action.payload || 0);
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated?.id) {
          return;
        }

        const index = state.items.findIndex((item) => item.id === updated.id);
        if (index !== -1) {
          const wasUnread = !state.items[index].isRead;
          state.items[index] = { ...state.items[index], ...updated };
          if (wasUnread && state.unreadCount > 0) {
            state.unreadCount -= 1;
          }
        }
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items = state.items.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString(),
        }));
        state.unreadCount = 0;
      });
  },
});

export const { prependRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
