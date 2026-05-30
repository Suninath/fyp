import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { main_uri } from "../../service";

// Create a review for a booking
export const createReview = createAsyncThunk(
  "review/createReview",
  async ({ bookingId, rating, comment, title }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.post(
        `/api/v1/reviews`,
        { bookingId, rating, comment, title },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get reviews for a vehicle
export const getVehicleReviews = createAsyncThunk(
  "review/getVehicleReviews",
  async ({ vehicleId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const response = await main_uri.get(
        `/api/v1/reviews/vehicle/${vehicleId}?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get review for a specific booking
export const getBookingReview = createAsyncThunk(
  "review/getBookingReview",
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
        `/api/v1/reviews/booking/${bookingId}`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Check if user can review a booking
export const canReviewBooking = createAsyncThunk(
  "review/canReviewBooking",
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
        `/api/v1/reviews/booking/${bookingId}/can-review`,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Get user's reviews
export const getUserReviews = createAsyncThunk(
  "review/getUserReviews",
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
      const response = await main_uri.get(`/api/v1/reviews/my-reviews`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update a review
export const updateReview = createAsyncThunk(
  "review/updateReview",
  async ({ reviewId, rating, comment, title }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.put(
        `/api/v1/reviews/${reviewId}`,
        { rating, comment, title },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete a review
export const deleteReview = createAsyncThunk(
  "review/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = {};
      if (token) {
        config.headers = {
          Authorization: `Bearer ${token}`,
        };
      }
      const response = await main_uri.delete(
        `/api/v1/reviews/${reviewId}`,
        config
      );
      return { ...response.data, reviewId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  vehicleReviews: [],
  userReviews: [],
  currentReview: null,
  reviewSummary: null,
  canReview: null,
  loading: false,
  error: null,
  pagination: null,
};

const reviewSlice = createSlice({
  name: "review",
  initialState,
  reducers: {
    clearReviewState: (state) => {
      state.currentReview = null;
      state.canReview = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.data;
        state.canReview = { canReview: false, reason: "Already reviewed" };
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to create review";
      })

      // Get Vehicle Reviews
      .addCase(getVehicleReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehicleReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicleReviews = action.payload.data?.reviews || [];
        state.reviewSummary = action.payload.data?.summary || null;
        state.pagination = action.payload.pagination;
      })
      .addCase(getVehicleReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch reviews";
      })

      // Get Booking Review
      .addCase(getBookingReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.data;
      })
      .addCase(getBookingReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch review";
      })

      // Can Review Booking
      .addCase(canReviewBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(canReviewBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.canReview = action.payload.data;
      })
      .addCase(canReviewBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to check review status";
      })

      // Get User Reviews
      .addCase(getUserReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = action.payload.data || [];
        state.pagination = action.payload.pagination;
      })
      .addCase(getUserReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to fetch user reviews";
      })

      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReview = action.payload.data;
        // Update in userReviews if exists
        const index = state.userReviews.findIndex(
          (r) => r.id === action.payload.data?.id
        );
        if (index !== -1) {
          state.userReviews[index] = action.payload.data;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to update review";
      })

      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.userReviews = state.userReviews.filter(
          (r) => r.id !== action.payload.reviewId
        );
        state.currentReview = null;
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to delete review";
      });
  },
});

export const { clearReviewState } = reviewSlice.actions;
export default reviewSlice.reducer;
