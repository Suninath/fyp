import { createSlice } from "@reduxjs/toolkit";
import {
  createVehicle,
  getUserVehicles,
  getPublicVehicles,
  getPublicRentalVehicles,
  getVehicleById,
  getPublicVehicleById,
  updateVehicle,
  deleteVehicle,
} from "../thunk/vehicleThunk";

const initialState = {
  loading: false,
  vehicles: [], // Used for user dashboard
  publicVehicles: [], // Used for public browsing
  publicRentalVehicles: [], // Used for home rental section
  currentVehicle: null,
  lastCreatedVehicleId: null,
  pagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 0,
  },
  publicPagination: {
    currentPage: 1,
    perpage: 12,
    count: 0,
    totalPages: 0,
  },
  publicRentalPagination: {
    currentPage: 1,
    perpage: 12,
    count: 0,
    totalPages: 0,
  },
  error: null,
};

const vehicleSlice = createSlice({
  name: "vehicle",
  initialState,
  reducers: {
    clearCurrentVehicle: (state) => {
      state.currentVehicle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearLastCreatedVehicleId: (state) => {
      state.lastCreatedVehicleId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Vehicle
      .addCase(createVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles.unshift(action.payload); // Add to beginning of array
        state.pagination.total += 1;
        state.lastCreatedVehicleId = action.payload?.id || null;
      })
      .addCase(createVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get User Vehicles
      .addCase(getUserVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload?.data || [];
        state.pagination = action.payload?.pagination || initialState.pagination;
      })
      .addCase(getUserVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.vehicles = [];
      })

      // Get Public Vehicles
      .addCase(getPublicVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.publicVehicles = action.payload?.data || [];
        state.publicPagination = action.payload?.pagination || initialState.publicPagination;
      })
      .addCase(getPublicVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.publicVehicles = [];
      })

      // Get Public Rental Vehicles
      .addCase(getPublicRentalVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPublicRentalVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.publicRentalVehicles = action.payload?.data || [];
        state.publicRentalPagination = action.payload?.pagination || initialState.publicRentalPagination;
      })
      .addCase(getPublicRentalVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.publicRentalVehicles = [];
      })

      // Get Vehicle By ID
      .addCase(getVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVehicleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVehicle = action.payload;
      })
      .addCase(getVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentVehicle = null;
      })

      // Update Vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.vehicles.findIndex(
          (vehicle) => vehicle.id === action.payload.id
        );
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
        if (state.currentVehicle?.id === action.payload.id) {
          state.currentVehicle = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Public Vehicle By ID
      .addCase(getPublicVehicleById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentVehicle = null;
      })
      .addCase(getPublicVehicleById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentVehicle = action.payload;
      })
      .addCase(getPublicVehicleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentVehicle = null;
      })

      // Delete Vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = state.vehicles.filter(
          (vehicle) => vehicle.id !== action.payload
        );
        state.pagination.total -= 1;
        if (state.currentVehicle?.id === action.payload) {
          state.currentVehicle = null;
        }
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentVehicle, clearError, clearLastCreatedVehicleId } = vehicleSlice.actions;
export default vehicleSlice.reducer;