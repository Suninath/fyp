import { createSlice } from "@reduxjs/toolkit";
import { userLogin, userSignup, verifyOtp, getUserProfile, updateUserProfile, getAuthorize, userLogout } from "../thunk/authThunk";

const initialState = {
  loading: false,
  status: "idle",
  login: null,
  authenticate: false,
  role: null,
  user: null,

  // otp validation
  otpValidationLoading: false,
};

const authSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    // Restore auth state from localStorage on app startup
    restoreAuthFromStorage: (state) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        state.authenticate = true;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(userLogin.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(userLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.status = "authenticated";
      state.login = action.payload.role;
      state.role = action.payload.role?.toLowerCase(); // Store role in lowercase
      state.authenticate = true; // Set authenticate to true after successful login
    });
    builder.addCase(userLogin.rejected, (state) => {
      state.loading = false;
      state.authenticate = false;
    });

    builder.addCase(userSignup.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(userSignup.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(userSignup.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(verifyOtp.pending, (state) => {
      state.otpValidationLoading = true;
    });

    builder.addCase(verifyOtp.fulfilled, (state) => {
      state.otpValidationLoading = false;
    });

    builder.addCase(verifyOtp.rejected, (state) => {
      state.otpValidationLoading = false;
    });

    builder.addCase(getUserProfile.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(getUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
      state.role = action.payload.role?.toLowerCase(); // Store role in lowercase
      state.authenticate = true;
    });

    builder.addCase(getUserProfile.rejected, (state) => {
      state.loading = false;
      state.authenticate = false;
      state.user = null;
      state.role = null;
    });

    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });

    builder.addCase(updateUserProfile.rejected, (state) => {
      state.loading = false;
    });

    builder.addCase(getAuthorize.pending, (state) => {
      state.loading = true;
      state.status = "checking";
    });

    builder.addCase(getAuthorize.fulfilled, (state, action) => {
      state.loading = false;
      state.status = "authenticated";
      // authorize API now only returns { role: "..." }
      state.role = action.payload.role?.toLowerCase(); // Store role in lowercase
      // Don't set user here, will be set by getUserProfile
      state.authenticate = true;
    });

    builder.addCase(getAuthorize.rejected, (state) => {
      state.loading = false;
      state.status = "failed";
      state.authenticate = false;
      state.user = null;
      state.role = null;
    });

    builder.addCase(userLogout.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(userLogout.fulfilled, (state) => {
      state.loading = false;
      state.status = "failed";
      state.login = null;
      state.authenticate = false;
      state.role = null;
      state.user = null;
    });

    builder.addCase(userLogout.rejected, (state) => {
      state.loading = false;
      // Even if logout fails on server, clear local state
      state.status = "failed";
      state.login = null;
      state.authenticate = false;
      state.role = null;
      state.user = null;
    });
  },
});

export const { restoreAuthFromStorage } = authSlice.actions;
export default authSlice.reducer;
