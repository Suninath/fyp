import { createAsyncThunk } from "@reduxjs/toolkit";
import { main_uri } from "../../service";
import { ErrorToast, SucessToast } from "../../components/common/toast";

export const addComment = createAsyncThunk(
  "comment/add",
  async ({ vehicleId, content }, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post("/api/v1/comments", { vehicleId, content });
      SucessToast({ message: resp?.data?.message });
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getCommentsByVehicleId = createAsyncThunk(
  "comment/getByVehicle",
  async ({ vehicleId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page);
      queryParams.append('limit', limit);
      
      const resp = await main_uri.get(`/api/v1/comments/${vehicleId}?${queryParams}`);
      return { data: resp.data?.data, pagination: resp.data?.pagination };
    } catch (error) {
       // Ideally don't show toast on load unless critical
      // ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const replyToComment = createAsyncThunk(
  "comment/reply",
  async ({ commentId, reply }, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/comments/${commentId}/reply`, { reply });
      SucessToast({ message: resp?.data?.message });
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
