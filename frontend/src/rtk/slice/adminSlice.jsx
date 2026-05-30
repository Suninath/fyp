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
  deleteUser,
  getPendingVerificationUsers,
  verifyUserAccount,
  getUsersByVerificationStatus,
  getAllBookings,
  updateBookingStatus,
  getBookingStats,
  getAllPayments,
  getPaymentStats,
  getRefundRequests,
  reviewRefundRequest
} from "../thunk/adminThunk";

const initialState = {
  dashboardStats: {
    totalUsers: 0,
    totalVehicles: 0,
    totalRevenue: 0,
    pendingPaymentAmount: 0,
    verifiedUsers: 0,
    pendingVerificationUsers: 0,
    rejectedVerificationUsers: 0,
    pendingDocuments: 0,
    approvedDocuments: 0,
    rejectedDocuments: 0,
    totalVehicleViews: 0,
    vehiclesWithViews: 0,
    totalVehicleInterests: 0,
    vehiclesWithInterest: 0,
    vehicleInterestInsights: [],
  },
  users: [],
  userPagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  pendingUsers: [],
  pendingUsersPagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  verificationUsers: [],
  verificationUsersPagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  stores: [],
  storePagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  vehicles: [],
  vehiclePagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  bookings: [],
  bookingPagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  bookingStats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0
  },
  payments: [],
  paymentPagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1
  },
  paymentStats: {
    total: 0,
    pending: 0,
    success: 0,
    failed: 0,
    cancelled: 0,
    totalRevenue: 0,
    pendingRevenue: 0,
    byMethod: {
      esewa: 0,
      khalti: 0
    }
  },
  refundRequests: [],
  refundPagination: {
    currentPage: 1,
    perpage: 10,
    count: 0,
    totalPages: 1,
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
        state.users = action.payload?.data || [];
        state.userPagination = action.payload?.pagination || initialState.userPagination;
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
        state.storePagination = action.payload?.pagination || initialState.storePagination;
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
        state.vehiclePagination = action.payload?.pagination || initialState.vehiclePagination;
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
      })

      // Get Pending Verification Users
      .addCase(getPendingVerificationUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPendingVerificationUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.pendingUsers = action.payload?.data || [];
        state.pendingUsersPagination = action.payload?.pagination || initialState.pendingUsersPagination;
      })
      .addCase(getPendingVerificationUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify User Account
      .addCase(verifyUserAccount.fulfilled, (state, action) => {
        const { userId } = action.payload;
        state.pendingUsers = state.pendingUsers.filter(u => u.id !== userId);
        state.verificationUsers = state.verificationUsers.filter(u => u.id !== userId);
      })

      // Get Users by Verification Status
      .addCase(getUsersByVerificationStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUsersByVerificationStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.verificationUsers = action.payload?.data || [];
        state.verificationUsersPagination = action.payload?.pagination || initialState.verificationUsersPagination;
      })
      .addCase(getUsersByVerificationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Bookings
      .addCase(getAllBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload?.data || [];
        state.bookingPagination = action.payload?.pagination || initialState.bookingPagination;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Booking Status
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const { bookingId, status, adminRemarks } = action.payload;
        const bookingIndex = state.bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex !== -1) {
          state.bookings[bookingIndex].status = status;
          state.bookings[bookingIndex].adminRemarks = adminRemarks;
        }
      })

      // Get Booking Stats
      .addCase(getBookingStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getBookingStats.fulfilled, (state, action) => {
        state.loading = false;
        state.bookingStats = action.payload || initialState.bookingStats;
      })
      .addCase(getBookingStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get All Payments
      .addCase(getAllPayments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload?.data || [];
        state.paymentPagination = action.payload?.pagination || initialState.paymentPagination;
      })
      .addCase(getAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Payment Stats
      .addCase(getPaymentStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPaymentStats.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStats = action.payload || initialState.paymentStats;
      })
      .addCase(getPaymentStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Refund Requests
      .addCase(getRefundRequests.pending, (state) => {
        state.loading = true;
      })
      .addCase(getRefundRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.refundRequests = action.payload?.data || [];
        state.refundPagination = action.payload?.pagination || initialState.refundPagination;
      })
      .addCase(getRefundRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(reviewRefundRequest.fulfilled, (state, action) => {
        const { id, action: reviewAction } = action.payload;
        state.refundRequests = state.refundRequests.map((request) =>
          request.id === id ? { ...request, status: reviewAction === "Processed" ? "Processed" : reviewAction === "Approve" ? "Approved" : "Rejected" } : request
        );
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;