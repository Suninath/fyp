import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { userSignup } from "../../rtk/thunk/authThunk";

function SignupComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signupSchema = yup.object({
    name: yup.string().required("Enter your full name"),
    email: yup
      .string()
      .required("Enter your email")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),
    phoneNumber: yup
      .string()
      .required("Enter phone number")
      .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
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
    resolver: yupResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    const result = await dispatch(userSignup(data));
    if (userSignup.fulfilled.match(result)) {
      navigate("/verifyOtp");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-50">
      {/* Left – Vehicle Image & Branding */}
      <div className="relative hidden lg:flex">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1170&q=80"
          alt="Vehicle marketplace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/50" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 text-white">
          <h1 className="text-3xl xl:text-4xl font-semibold tracking-tight">
            Welcome to Vehicle Marketplace
          </h1>
          <p className="mt-4 text-base xl:text-lg text-gray-300 max-w-sm leading-relaxed">
            Sign up to buy, sell, and rent vehicles easily and securely.
          </p>
          <div className="mt-6 space-y-2 text-sm text-gray-300">
            <p>• Verified vehicles & sellers</p>
            <p>• Easy rental & purchase management</p>
            <p>• Admin-controlled approvals</p>
          </div>
        </div>
      </div>

      {/* Right – Signup Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-10 py-8 sm:py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg py-5 sm:py-6">
          {/* Header */}
          <div className="px-5 sm:px-6 pb-4 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Create Account</h2>
            <p className="mt-1 text-sm text-gray-600">Fill in your details to get started</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            className="px-5 sm:px-6 py-4 space-y-3">
            {/* Name Field */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                {...register("name")}
                className={`mt-1 w-full h-9 px-3 rounded-md border text-sm sm:text-base ${
                  errors.name ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.name?.message || " "}</p>
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="text"
                {...register("email")}
                className={`mt-1 w-full h-9 px-3 rounded-md border ${
                  errors.email ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.email?.message || " "}</p>
            </div>

            {/* Phone */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="text"
                {...register("phoneNumber")}
                className={`mt-1 w-full h-9 px-3 rounded-md border ${
                  errors.phoneNumber ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.phoneNumber?.message || " "}</p>
            </div>

            {/* Password */}
            <div className="flex flex-col relative">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className={`mt-1 w-full h-9 px-3 pr-12 rounded-md border ${
                  errors.password ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.password?.message || " "}</p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col relative">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmpassword")}
                className={`mt-1 w-full h-9 px-3 pr-12 rounded-md border ${
                  errors.confirmpassword ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.confirmpassword?.message || " "}</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-lg bg-purple hover:opacity-90 text-white text-sm font-bold tracking-wide shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing up...
                </span>
              ) : (
                "Sign up"
              )}
            </button>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-gray-600">
                Already have an account?{" "}
                <NavLink
                  to="/login"
                  className="font-medium text-purple hover:underline"
                >
                  Sign in
                </NavLink>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupComponent;
