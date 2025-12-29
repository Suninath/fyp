import { createAsyncThunk } from "@reduxjs/toolkit";
import { ErrorToast, SucessToast } from "../../components/common/toast";
import { main_uri } from "../../service";

export const userLogin = createAsyncThunk(
  "user/login",
  async (data, { rejectWithValue }) => {
    try {
      const resp = await main_uri.post(`/api/v1/auth/login`, data);
      SucessToast({ message: resp?.data?.message });
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
