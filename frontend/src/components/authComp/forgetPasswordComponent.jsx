import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { forgetPassword } from "../../rtk/thunk/authThunk";

function ForgetPasswordComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const forgetSchema = yup.object({
    email: yup
      .string()
      .required("Enter your email")
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid Email"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(forgetSchema),
  });

  const onSubmit = async (data) => {
    const result = await dispatch(forgetPassword(data));
    if (forgetPassword.fulfilled.match(result)) {
      navigate("/resetPassword", { state: { email: data.email } });
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">
      {/* Left – Vehicle Image & Branding */}
      <div className="relative hidden lg:flex">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1170&q=80"
          alt="Second Auto Gear"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/50" />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <h1 className="text-4xl font-semibold tracking-tight">
            Reset Your Password
          </h1>
          <p className="mt-4 text-lg text-gray-300 max-w-sm leading-relaxed">
            Enter your email to receive a password reset code.
          </p>
        </div>
      </div>

      {/* Right – Forget Password Form */}
      <div className="flex items-center justify-center px-6 lg:px-10">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md py-6">
          {/* Header */}
          <div className="px-6 pb-4 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Forgot Password</h2>
            <p className="mt-1 text-sm text-gray-600">Enter your email to reset your password</p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            className="px-6 py-4 space-y-3"
          >
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 rounded-lg bg-purple hover:opacity-90 text-white text-sm font-bold tracking-wide shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition-all hover:scale-[1.02] active:scale-95"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </span>
              ) : (
                "Send Reset Code"
              )}
            </button>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-gray-600">
                Remember your password?{" "}
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

export default ForgetPasswordComponent;