import { createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorToast, SucessToast } from "../../components/common/toast";
import { main_uri } from "../../service";

export const userLogin = createAsyncThunk(
  "user/login",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/auth/login`, data);
      SucessToast({ message: resp?.data?.message });
      
      // Store access token in localStorage for API requests
      if (resp?.data?.data?.accessToken) {
        localStorage.setItem("authToken", resp.data.data.accessToken);
      }
      
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const userSignup = createAsyncThunk(
  "user/signup",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/auth/register`, data);
      SucessToast({ message: resp?.data?.message });
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const storeSignup = createAsyncThunk(
  "store/signup",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/auth/registerStore`, data);
      SucessToast({ message: resp?.data?.message });
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const verifyOtp = createAsyncThunk(
  "verify/otp",
  async (data, { rejectWithValue }) => {
    console.log("🚀 ~ data:", data)
    try {
      const resp = await main_uri.post("/api/v1/auth/verifyOtp", data);
      SucessToast({ message: resp?.data?.message });
    } catch (error) {
      console.log("🚀 ~ error:", error)
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const forgetPassword = createAsyncThunk(
  "user/forgetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/auth/forgetPassword`, data);
      SucessToast({ message: resp?.data?.message });
      return resp.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/auth/resetPassword`, data);
      SucessToast({ message: resp?.data?.message });
      return resp.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUserProfile = createAsyncThunk(
  "user/profile",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/auth/me`);
      return resp.data?.data;
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      return rejectWithValue(error.response?.data?.message || "Failed to fetch user profile");
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  "user/updateProfile",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await main_uri.put(`/api/v1/auth/profile`, data);
      SucessToast({ message: "Profile updated successfully" });
      return resp.data?.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message || "Failed to update profile" });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAuthorize = createAsyncThunk(
  "user/authorize",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await main_uri.get(`/api/v1/auth/authorize`);
      return resp.data?.data;
    } catch (error) {
      console.error("Authorization failed:", error);
      return rejectWithValue(error.response?.data?.message || "Authorization failed");
    }
  }
);

export const userLogout = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/auth/logout`);
      SucessToast({ message: resp?.data?.message });
      
      // Clear token from localStorage on logout
      localStorage.removeItem("authToken");
      
      return resp.data;
    } catch (error) {
      ErrorToast({ message: error.response?.data?.message });
      return rejectWithValue(error.response?.data?.message);
    }
  }
);
