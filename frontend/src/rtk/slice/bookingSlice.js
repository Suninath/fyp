import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { main_uri } from "../../service";

export const createBooking = createAsyncThunk(
  "booking/createBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.post(`/api/v1/bookings`, bookingData, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserBookings = createAsyncThunk(
  "booking/getUserBookings",
  async ({ page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        params: { page, limit },
      };
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.get(`/api/v1/bookings`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingById = createAsyncThunk(
  "booking/getBookingById",
  async (bookingId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.get(`/api/v1/bookings/${bookingId}`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancelBooking",
  async (bookingId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.patch(
        `/api/v1/bookings/${bookingId}/cancel`,
        {},
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getVehicleBookings = createAsyncThunk(
  "booking/getVehicleBookings",
  async (vehicleId, { rejectWithValue }) => {
    try {
      const response = await main_uri.get(`/api/v1/bookings/vehicle/${vehicleId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const initiatePayment = createAsyncThunk(
  "booking/initiatePayment",
  async ({ bookingId, method }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.post(
        `/api/v1/bookings/${bookingId}/payment`,
        { method },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getPaymentStatus = createAsyncThunk(
  "booking/getPaymentStatus",
  async (bookingId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.get(
        `/api/v1/bookings/${bookingId}/payment/status`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  bookings: [],
  currentBooking: null,
  vehicleBookings: [],
  paymentData: null,
  loading: false,
  error: null,
  pagination: null,
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBooking: (state) => {
      state.currentBooking = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Create Booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure vehicle object exists for payment modal
        const bookingData = action.payload.data;
        state.currentBooking = {
          ...bookingData,
          vehicle: bookingData.vehicle || { name: `Vehicle #${bookingData.vehicleId}`, id: bookingData.vehicleId },
        };
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create booking";
      });

    // Get User Bookings
    builder
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.data || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch bookings";
      });

    // Get Booking By ID
    builder
      .addCase(getBookingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingById.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure vehicle object exists for payment modal
        const bookingData = action.payload.data;
        state.currentBooking = {
          ...bookingData,
          vehicle: bookingData.vehicle || { name: `Vehicle #${bookingData.vehicleId}`, id: bookingData.vehicleId },
        };
      })
      .addCase(getBookingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch booking";
      });

    // Cancel Booking
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        if (state.currentBooking) {
          state.currentBooking.status = "Cancelled";
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to cancel booking";
      });

    // Get Vehicle Bookings
    builder
      .addCase(getVehicleBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getVehicleBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleBookings = action.payload.data || [];
      })
      .addCase(getVehicleBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch vehicle bookings";
      });

    // Initiate Payment
    builder
      .addCase(initiatePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initiatePayment.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentData = action.payload.data;
      })
      .addCase(initiatePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to initiate payment";
      });

    // Get Payment Status
    builder
      .addCase(getPaymentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBooking = {
          ...state.currentBooking,
          ...action.payload.data,
        };
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch payment status";
      });
  },
});

export const { clearError, resetBooking } = bookingSlice.actions;
export default bookingSlice.reducer;
