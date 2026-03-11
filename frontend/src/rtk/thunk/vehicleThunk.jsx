import { createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorToast, SucessToast } from "../../components/common/toast";
import { main_uri, photo_url } from "../../service";

export const createVehicle = createAsyncThunk(
  "vehicle/create",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await photo_url.post(`/api/v1/vehicles`, data);
      SucessToast({ message: resp?.data?.message });
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUserVehicles = createAsyncThunk(
  "vehicle/getUserVehicles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/vehicles`, { params });
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getPublicVehicles = createAsyncThunk(
  "vehicle/getPublicVehicles",
  async (params = {}, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/vehicles/public/all`, { params });
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
      // ErrorToast({ message: error.response?.data?.message }); // Don't toast on load
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getPublicVehicleById = createAsyncThunk(
  "vehicle/getPublicById",
  async (id, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/vehicles/public/${id}`);
      return resp.data?.data;
    } catch (error) {
      console.error(error);
      // Fail silently or handle in UI
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getVehicleById = createAsyncThunk(
  "vehicle/getById",
  async (id, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/vehicles/${id}`);
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateVehicle = createAsyncThunk(
  "vehicle/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const resp = await photo_url.put(`/api/v1/vehicles/${id}`, data);
      SucessToast({ message: resp?.data?.message });
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  "vehicle/delete",
  async (id, { rejectWithValue }) => {
    try {
      const resp = await main_uri.delete(`/api/v1/vehicles/${id}`);
      SucessToast({ message: resp?.data?.message });
      return id; // Return the deleted vehicle ID
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);