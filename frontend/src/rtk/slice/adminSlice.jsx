import { createSlice } from "@reduxjs/toolkit";
import {
  getDashboardStats,
  getAllUsers,
  getAllStores,
  verifyStore,
  blockUser,
  unblockUser,
  blockStore,
  unblockStore,
  getAllVehicles,
  blockVehicle,
  unblockVehicle,
  deleteVehicle,
  updateUser,
  deleteUser
} from "../thunk/adminThunk";

const initialState = {
  dashboardStats: {
    totalUsers: 0,
    totalStores: 0,
    totalVehicles: 0,
    totalRevenue: 0,
  },
  users: [],
  userPagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  stores: [],
  storePagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  vehicles: [],
  vehiclePagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(getDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        console.log("action.payload",action.payload);
        state.users = action.payload || [];
        state.userPagination = {
          page: action.payload?.pagination?.currentPage || 1,
          limit: action.payload?.pagination?.perpage || 10,
          total: action.payload?.pagination?.count || 0,
          totalPages: action.payload?.pagination?.totalPages || 1
        };
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Stores
      .addCase(getAllStores.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload?.data || [];
        state.storePagination = {
          page: action.payload?.pagination?.currentPage || 1,
          limit: action.payload?.pagination?.perpage || 10,
          total: action.payload?.pagination?.count || 0,
          totalPages: action.payload?.pagination?.totalPages || 1
        };
      })
      .addCase(getAllStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify Store
      .addCase(verifyStore.fulfilled, (state, action) => {
        const { storeId } = action.payload;
        const store = state.stores.find(s => s.id === storeId);
        if (store) {
          store.verified = true;
          store.isBlocked = false;
        }
      })

      // Block User
      .addCase(blockUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.isBlocked = true;
        }
      })

      // Unblock User
      .addCase(unblockUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.isBlocked = false;
        }
      })

      // Block Store
      .addCase(blockStore.fulfilled, (state, action) => {
        const { storeId } = action.payload;
        const store = state.stores.find(s => s.id === storeId);
        if (store) {
          store.isBlocked = true;
        }
      })

      // Unblock Store
      .addCase(unblockStore.fulfilled, (state, action) => {
        const { storeId } = action.payload;
        const store = state.stores.find(s => s.id === storeId);
        if (store) {
          store.isBlocked = false;
        }
      })

      // Get All Vehicles
      .addCase(getAllVehicles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.vehicles = action.payload?.data || [];
        state.vehiclePagination = {
          page: action.payload?.pagination?.currentPage || 1,
          limit: action.payload?.pagination?.perpage || 10,
          total: action.payload?.pagination?.count || 0,
          totalPages: action.payload?.pagination?.totalPages || 1
        };
      })
      .addCase(getAllVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Block Vehicle
      .addCase(blockVehicle.fulfilled, (state, action) => {
        const { vehicleId } = action.payload;
        const vehicle = state.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
          vehicle.isBlocked = true;
        }
      })

      // Unblock Vehicle
      .addCase(unblockVehicle.fulfilled, (state, action) => {
        const { vehicleId } = action.payload;
        const vehicle = state.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
          vehicle.isBlocked = false;
        }
      })

      // Delete Vehicle
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        const { vehicleId } = action.payload;
        state.vehicles = state.vehicles.filter(v => v.id !== vehicleId);
      })

      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const { userId, data } = action.payload;
        const userIndex = state.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          state.users[userIndex] = { ...state.users[userIndex], ...data };
        }
      })

      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.users = state.users.filter(u => u.id !== userId);
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;