import { createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorToast, SucessToast } from "../../components/common/toast";
import { main_uri } from "../../service";

export const getDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.insightsDays !== undefined && params.insightsDays !== null) {
        queryParams.append("insightsDays", String(params.insightsDays));
      }
      queryParams.append("_ts", String(Date.now()));

      const url = queryParams.toString()
        ? `/api/v1/admin/dashboard/stats?${queryParams.toString()}`
        : `/api/v1/admin/dashboard/stats`;

      const resp = await main_uri.get(url);
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "admin/getAllUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const resp = await main_uri.get(`/api/v1/admin/users?${queryParams}`);
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      console.error('API Error:', error.response?.data);
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllStores = createAsyncThunk(
  "admin/getAllStores",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const resp = await main_uri.get(`/api/v1/admin/stores?${queryParams}`);
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const verifyStore = createAsyncThunk(
  "admin/verifyStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/stores/${storeId}/verify`);
      SucessToast({ message: resp.data?.message });
      return { storeId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const blockUser = createAsyncThunk(
  "admin/blockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/users/${userId}/block`);
      SucessToast({ message: resp.data?.message });
      return { userId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const unblockUser = createAsyncThunk(
  "admin/unblockUser",
  async (userId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/users/${userId}/unblock`);
      SucessToast({ message: resp.data?.message });
      return { userId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getPendingVerificationUsers = createAsyncThunk(
  "admin/getPendingVerificationUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const resp = await main_uri.get(`/api/v1/admin/users/pending-verification?${queryParams}`);
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const verifyUserAccount = createAsyncThunk(
  "admin/verifyUserAccount",
  async ({ userId, approved, rejectionReason }, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/users/${userId}/verify`, { 
        approved, 
        rejectionReason 
      });
      SucessToast({ message: resp.data?.message });
      return { userId, approved };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUsersByVerificationStatus = createAsyncThunk(
  "admin/getUsersByVerificationStatus",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.status) queryParams.append('status', params.status);
      if (params.search) queryParams.append('search', params.search);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const resp = await main_uri.get(`/api/v1/admin/users/verification-status?${queryParams}`);
      return { 
        data: resp.data?.data, 
        pagination: resp.data?.pagination,
        status: params.status 
      };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const blockStore = createAsyncThunk(
  "admin/blockStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/stores/${storeId}/block`);
      SucessToast({ message: resp.data?.message });
      return { storeId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const unblockStore = createAsyncThunk(
  "admin/unblockStore",
  async (storeId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/stores/${storeId}/unblock`);
      SucessToast({ message: resp.data?.message });
      return { storeId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllVehicles = createAsyncThunk(
  "admin/getAllVehicles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.brand) queryParams.append('brand', params.brand);
      if (params.color) queryParams.append('color', params.color);
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      const url = `/api/v1/admin/vehicles${queryParams.toString() ? `?${queryParams}` : ''}`;
      const resp = await main_uri.get(url);
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const blockVehicle = createAsyncThunk(
  "admin/blockVehicle",
  async (vehicleId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/vehicles/${vehicleId}/block`);
      SucessToast({ message: resp.data?.message });
      return { vehicleId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const unblockVehicle = createAsyncThunk(
  "admin/unblockVehicle",
  async (vehicleId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/vehicles/${vehicleId}/unblock`);
      SucessToast({ message: resp.data?.message });
      return { vehicleId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "admin/deleteVehicle",
  async (vehicleId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.delete(`/api/v1/admin/vehicles/${vehicleId}`);
      SucessToast({ message: resp.data?.message });
      return { vehicleId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const resp = await main_uri.put(`/api/v1/admin/users/${userId}`, data);
      SucessToast({ message: resp.data?.message });
      return { userId, data: resp.data?.data };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/deleteUser",
  async (userId, { rejectWithValue }) => {
    try {
      const resp = await main_uri.delete(`/api/v1/admin/users/${userId}`);
      SucessToast({ message: resp.data?.message });
      return { userId };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllBookings = createAsyncThunk(
  "admin/getAllBookings",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);

      const resp = await main_uri.get(`/api/v1/admin/bookings?${queryParams}`);
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateBookingStatus = createAsyncThunk(
  "admin/updateBookingStatus",
  async ({ bookingId, status, adminRemarks }, { rejectWithValue }) => {
    try {
      const resp = await main_uri.patch(`/api/v1/admin/bookings/${bookingId}/status`, {
        status,
        adminRemarks,
      });
      SucessToast({ message: resp.data?.message });
      return { bookingId, status, adminRemarks };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getBookingStats = createAsyncThunk(
  "admin/getBookingStats",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/admin/bookings/stats`);
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllPayments = createAsyncThunk(
  "admin/getAllPayments",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.method) queryParams.append('method', params.method);

      const resp = await main_uri.get(`/api/v1/admin/payments?${queryParams}`);
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getPaymentStats = createAsyncThunk(
  "admin/getPaymentStats",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/admin/payments/stats`);
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);