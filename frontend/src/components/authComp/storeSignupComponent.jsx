import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { storeSignup } from "../../rtk/thunk/authThunk";

function StoreSignupComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const storeSignupSchema = yup.object({
    storeName: yup.string().required("Enter your store name"),
    email: yup
      .string()
      .required("Enter your email")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),
    phoneNumber: yup
      .string()
      .required("Enter phone number")
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    panNumber: yup.string().required("Enter PAN number"),
    companyRegistrationDoc: yup.string().required("Enter company registration document URL"),
    password: yup.string().required("Enter your password"),
    confirmpassword: yup
      .string()
      .required("Re-type your password")
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(storeSignupSchema),
  });

  const onSubmit = async (data) => {
    const result = await dispatch(storeSignup(data));
    if (storeSignup.fulfilled.match(result)) {
      navigate("/verifyOtp");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">
      {/* Left – Vehicle Image & Branding */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-8">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Join as a Store</h1>
          <p className="text-lg">Sell and buy vehicles on our platform</p>
        </div>
      </div>

      {/* Right – Signup Form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Store Registration
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Store Name
              </label>
              <input
                type="text"
                {...register("storeName")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your store name"
              />
              {errors.storeName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.storeName.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                {...register("phoneNumber")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your phone number"
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PAN Number
              </label>
              <input
                type="text"
                {...register("panNumber")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter PAN number"
              />
              {errors.panNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.panNumber.message}
                </p>
              )}
            </div>

            {/* Company Registration Document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Registration Document URL
              </label>
              <input
                type="text"
                {...register("companyRegistrationDoc")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter document URL"
              />
              {errors.companyRegistrationDoc && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.companyRegistrationDoc.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  {...register("confirmpassword")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmpassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmpassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Registering..." : "Register Store"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <NavLink to="/login" className="text-blue-600 hover:underline">
                Login
              </NavLink>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Register as User?{" "}
              <NavLink to="/signup" className="text-blue-600 hover:underline">
                User Signup
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoreSignupComponent;