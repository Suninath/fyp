import { createSlice } from "@reduxjs/toolkit";
import { userLogin, userSignup } from "../thunk/authThunk";

const initialState = {
  loading: false,
  login: null,
  authenticate: false,
  role: null,
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

    // //for logout
    // builder.addCase(userLogut.pending, (state) => {
    //   state.loading = true;
    // });
    // builder.addCase(userLogut.fulfilled, (state) => {
    //   state.loading = false;
    //   state.login = null;
    //   state.authenticate = false;
    // });
    // builder.addCase(userLogut.rejected, (state) => {
    //   state.loading = false;
    // });

    // //forget password
    // builder.addCase(forgetPassword.pending, (state) => {
    //   state.loading = true;
    // });
    // builder.addCase(forgetPassword.fulfilled, (state) => {
    //   state.loading = false;
    // });
    // builder.addCase(forgetPassword.rejected, (state) => {
    //   state.loading = false;
    // });
    // //reset token validation
    // builder.addCase(resetToken.pending, (state) => {
    //   state.loading = true;
    // });
    // builder.addCase(resetToken.fulfilled, (state) => {
    //   state.loading = false;
    // });
    // builder.addCase(resetToken.rejected, (state) => {
    //   state.loading = false;
    // });
  },
});

export default authSlice.reducer;
