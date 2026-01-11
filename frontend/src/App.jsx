import { Route, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import React, { useEffect, useState } from "react";
import "./App.css";

import Login from "./pages/auth/loginPage";
import Signup from "./pages/auth/signupPage";
import OtpValidationPage from "./pages/auth/veryfyOtp.";
import HomePage from "./pages/user/home";
import ForgetPasswordPage from "./pages/auth/forgetPasswordPage";
import ResetPasswordPage from "./pages/auth/resetPasswordPage";
import StoreSignupPage from "./pages/auth/storeSignupPage";
import DashboardOverview from "./pages/admin/components/DashboardOverview";
import UserManagement from "./pages/admin/components/UserManagement";
import StoreManagement from "./pages/admin/components/StoreManagement";
import VehicleManagement from "./pages/admin/components/VehicleManagement";
import Loading from "./components/common/loading";

import { store } from "./rtk/store/store";
import ProtectedRoute from "./components/common/ProtectedRoute";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate splash/loading screen
    setTimeout(() => setLoading(false), 2000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <Provider store={store}>
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
        <Route
          path="/storeSignup"
          element={
            <ProtectedRoute>
              <StoreSignupPage />
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
          path="/admin/stores"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <StoreManagement />
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

        {/* User/Store routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute allowedRoles={["user", "store"]}>
              <HomePage />
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
    </Provider>
  );
}

export default App;
