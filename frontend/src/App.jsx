import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import React, { useEffect, useState } from "react";
// import Header from "./components/common/header";
// import Home from "./pages/page/home";
// import Footer from "./components/common/footer";
import Login from "./pages/auth/loginPage";
import Loading from "./components/common/loading";
import Signup from "./pages/auth/signupPage";
// import Dashboard from "./pages/Admin/Dashboard";
import { Provider } from "react-redux";
import HomePage from "./pages/user/home";
import { store } from "./rtk/store/store";
import OtpValidationPage from "./pages/auth/veryfyOtp.";
// import User from "./pages/Admin/user";
// import UpdateUser from "./pages/Admin/updateUser";
// import Vehicle from "./pages/Admin/vehicle";
// import Contact from "./pages/page/contact";
// import Noroute from "./pages/auth/noroute";
// import About from "./pages/page/about";
// import Vehicles from "./pages/page/vehicles";
// import Category from "./pages/page/category";
// import SingleVehicle from "./pages/page/singleVehicle";
// import PrivateRoutes from "./pages/auth/protectedroute";
// import AdminRoute from "./pages/auth/adminroute";
// import Userprofile from "./pages/User/userprofile/userprofile";
// import { persist, store } from "./redux/store/store";
// import UserPost from "./pages/User/userpost/usepost";
// import UserPostUpdate from "./pages/User/userpost/userPostUpdate";
// import Loading from "./components/common/loading";
// import Booking from "./pages/page/booking";
// import CreatePost from "./pages/User/userpost/createPost";
// import UserBooking from "./pages/User/userpost/usersBooking";
// import VehicleBooking from "./pages/page/vehicleBooking";
// import Inbox from "./pages/page/inbox";
import ForgetPasswordPage from "./pages/auth/forgetPasswordPage";
import ResetPasswordPage from "./pages/auth/resetPasswordPage";
// import AllBooking from "./pages/Admin/allBooking";
// import BookingDetails from "./pages/Admin/bookingDetails";
// import VehicleDetail from "./pages/Admin/vehicleDetail";
function App() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <Loading />
        </div>
      ) : (
        <Provider store={store}>
          <Routes>
            <Route
              path="/login"
              element={
                <>
                  {/* <Header /> */}
                  <Login />
                  {/* <Footer /> */}
                </>
              }
            />

            <Route
              path="/signup"
              element={
                <>
                  {/* <Header /> */}
                  <Signup />
                  {/* <Footer /> */}
                </>
              }
            />

            <Route
              path="/verifyOtp"
              element={
                <>
                  {/* <Header /> */}
                  <OtpValidationPage />
                  {/* <Footer /> */}
                </>
              }
            />

            <Route
              path="/forgetPassword"
              element={
                <>
                  {/* <Header /> */}
                  <ForgetPasswordPage />
                  {/* <Footer /> */}
                </>
              }
            />

            <Route
              path="/resetPassword"
              element={
                <>
                  {/* <Header /> */}
                  <ResetPasswordPage />
                  {/* <Footer /> */}
                </>
              }
            />

            <Route
              path="/home"
              element={
                <>
                  {/* <Header /> */}
                  <HomePage />
                  {/* <Footer /> */}
                </>
              }
            />
          </Routes>
        </Provider>
      )}
    </>
  );
}

export default App;
