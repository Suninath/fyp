import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { resetPassword } from "../../rtk/thunk/authThunk";

function ResetPasswordComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = location.state?.email || "";

  const resetSchema = yup.object({
    otp: yup.string().required("Enter OTP").length(6, "OTP must be 6 digits"),
    newPassword: yup.string().required("Enter new password").min(6, "Password must be at least 6 characters"),
    confirmPassword: yup
      .string()
      .required("Re-type your password")
      .oneOf([yup.ref("newPassword"), null], "Passwords must match"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(resetSchema),
  });

  const onSubmit = async (data) => {
    const payload = {
      email,
      otp: data.otp,
      newPassword: data.newPassword,
    };
    const result = await dispatch(resetPassword(payload));
    if (resetPassword.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">
      {/* Left – Vehicle Image & Branding */}
      <div className="relative hidden lg:flex">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1170&q=80"
          alt="Vehicle marketplace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/50" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-4xl font-semibold tracking-tight">
            Reset Your Password
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-sm leading-relaxed">
            Enter the OTP sent to your email and set a new password.
          </p>
        </div>
      </div>

      {/* Right – Reset Password Form */}
      <div className="flex items-center justify-center px-6 lg:px-10">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md py-6">
          {/* Header */}
          <div className="px-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Reset Password</h2>
            <p className="mt-1 text-sm text-gray-600">Enter OTP and new password</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            className="px-6 py-4 space-y-3"
          >
            {/* OTP */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                {...register("otp")}
                className={`mt-1 w-full h-9 px-3 rounded-md border ${
                  errors.otp ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.otp?.message || " "}</p>
            </div>

            {/* New Password */}
            <div className="flex flex-col relative">
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                {...register("newPassword")}
                className={`mt-1 w-full h-9 px-3 pr-12 rounded-md border ${
                  errors.newPassword ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.newPassword?.message || " "}</p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col relative">
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className={`mt-1 w-full h-9 px-3 pr-12 rounded-md border ${
                  errors.confirmPassword ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 px-2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
              <p className="mt-1 text-xs text-red min-h-[1rem]">{errors.confirmPassword?.message || " "}</p>
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
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-gray-600">
                Back to{" "}
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

export default ResetPasswordComponent;