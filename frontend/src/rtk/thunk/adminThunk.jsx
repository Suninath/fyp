import { createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorToast, SucessToast } from "../../components/common/toast";
import { main_uri } from "../../service";

export const getDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/admin/dashboard/stats`);
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
      console.log('API Response:', resp.data?.data);
      console.log('Users data:', resp.data?.data);
      return resp.data?.data;
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
      return resp.data?.data;
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
      const queryParams = new URLSearchParams(params).toString();
      const url = `/api/v1/admin/vehicles${queryParams ? `?${queryParams}` : ''}`;
      const resp = await main_uri.get(url);
      return resp.data?.data;
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