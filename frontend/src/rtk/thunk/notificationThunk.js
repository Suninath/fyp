import { createAsyncThunk } from "@reduxjs/toolkit";
import { main_uri } from "../../service";

const getAuthConfig = () => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await main_uri.get("/api/v1/notifications", {
        ...getAuthConfig(),
        params: { page, limit },
      });

      return {
        items: response.data?.data || [],
        pagination: response.data?.pagination,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load notifications");
    }
  }
);

export const fetchUnreadNotificationCount = createAsyncThunk(
  "notification/fetchUnreadNotificationCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await main_uri.get(
        "/api/v1/notifications/unread-count",
        getAuthConfig()
      );
      return response.data?.data?.unreadCount || 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load unread count");
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  "notification/markNotificationRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await main_uri.patch(
        `/api/v1/notifications/${notificationId}/read`,
        {},
        getAuthConfig()
      );
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark notification as read");
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  "notification/markAllNotificationsRead",
  async (_, { rejectWithValue }) => {
    try {
      await main_uri.patch("/api/v1/notifications/read-all", {}, getAuthConfig());
      return true;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to mark all notifications as read");
    }
  }
);
