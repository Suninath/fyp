import { createSlice } from "@reduxjs/toolkit";
import { userLogin, userSignup, verifyOtp } from "../thunk/authThunk";

const initialState = {
  loading: false,
  login: null,
  authenticate: false,
  role: null,

  // otp validation
  otpValidationLoading: false,
};

const authSlice = createSlice({
  name: "login",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(userLogin.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(userLogin.fulfilled, (state, action) => {
      state.loading = false;
      state.authenticate = true;
      state.login = action.payload;
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
  },
});

export default authSlice.reducer;
