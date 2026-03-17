import { Route, Routes } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import React, { useEffect, useState } from "react";
import "./App.css";

import Login from "./pages/auth/loginPage";
import Signup from "./pages/auth/signupPage";
import OtpValidationPage from "./pages/auth/veryfyOtp.";
import HomePage from "./pages/user/home";
import UserProfilePage from "./pages/user/userProfile";
import UserVehiclesPage from "./pages/user/userVehicles";
import CreateVehiclePage from "./pages/user/createVehicle";
import UserBookingsPage from "./pages/user/bookings";
import PaymentSuccess from "./pages/user/PaymentSuccess";
import PaymentFailure from "./pages/user/PaymentFailure";
import MessagesPage from "./pages/user/MessagesPage";
import ForgetPasswordPage from "./pages/auth/forgetPasswordPage";
import ResetPasswordPage from "./pages/auth/resetPasswordPage";
import DashboardOverview from "./pages/admin/components/DashboardOverview";
import UserManagement from "./pages/admin/components/UserManagement";
import VehicleManagement from "./pages/admin/components/VehicleManagement";
import UserVerification from "./pages/admin/components/UserVerification";
import BookingManagement from "./pages/admin/components/BookingManagement";
import PaymentManagement from "./pages/admin/components/PaymentManagement";
import DocumentManagement from "./pages/admin/components/DocumentManagement";
import Loading from "./components/common/loading";
import Home from "./pages/public/Home";
import About from "./pages/public/About";
import Contact from "./pages/public/Contact";
import VehicleCatalog from "./pages/public/VehicleCatalog";
import VehicleDetails from "./pages/public/VehicleDetails";

import { store } from "./rtk/store/store";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { SocketProvider } from "./contexts/SocketContext";
import { restoreAuthFromStorage } from "./rtk/slice/authSlice";

function AppContent() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore authentication state from localStorage on app startup
    dispatch(restoreAuthFromStorage());
    
    // Simulate splash/loading screen
    setTimeout(() => setLoading(false), 2000);
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <Routes>
        {/* Auth routes (redirect if already logged in) */}
        <Route
          path="/login"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute>
              <Signup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verifyOtp"
          element={
            <ProtectedRoute>
              <OtpValidationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/forgetPassword"
          element={
            <ProtectedRoute>
              <ForgetPasswordPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resetPassword"
          element={
            <ProtectedRoute>
              <ResetPasswordPage />
            </ProtectedRoute>
          }
        />

        {/* Public routes - accessible to everyone except admins */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/browse"
          element={
            <ProtectedRoute>
              <VehicleCatalog />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles/public/:id"
          element={
            <ProtectedRoute>
              <VehicleDetails />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardOverview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vehicles"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <VehicleManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verification"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <UserVerification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <BookingManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <PaymentManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/documents"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DocumentManagement />
            </ProtectedRoute>
          }
        />

        {/* User routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <UserVehiclesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/create-vehicle"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <CreateVehiclePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <UserBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/payment/success"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/payment/failure"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <PaymentFailure />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <MessagesPage />
            </ProtectedRoute>
          }
        />

        {/* Catch-all route */}
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />
      </Routes>
    );
}

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </Provider>
  );
}

export default App;
