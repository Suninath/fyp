import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLogin } from "../../rtk/thunk/authThunk";

function LoginComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showpassword, setShowPassword] = useState(false);
  const { login } = useSelector((state) => state.auth);

  const loginSchema = yup.object({
    email: yup
      .string()
      .required("Enter your email")
      .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, "Invalid Email"),
    password: yup.string().required("Enter your password"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "" },
    resolver: yupResolver(loginSchema),
  });

  const onSumit = async (data) => {
    dispatch(userLogin(data));
  };

  useEffect(() => {
    if (login) {
      if (login?.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [login, navigate]);

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gray-100">

      {/* Left – Image & Branding */}
      <div className="relative hidden lg:flex">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7"
          alt="Car marketplace"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/70" />

        <div className="relative z-10 flex flex-col justify-center px-20 text-white">
          <h1 className="text-4xl font-semibold tracking-tight">
            Vehicle Marketplace
          </h1>
          <p className="mt-5 text-lg text-gray-300 max-w-md leading-relaxed">
            Buy, sell, and rent vehicles through a secure and professionally
            managed platform.
          </p>

          <div className="mt-10 space-y-3 text-sm text-gray-300">
            <p>• Verified vehicles & sellers</p>
            <p>• Rental & purchase management</p>
            <p>• Admin-controlled approvals</p>
          </div>
        </div>
      </div>

      {/* Right – Login Form */}
      <div className="flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md">

          {/* Header */}
          <div className="px-8 py-7 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Access your account to manage vehicles and rentals
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(onSumit)}
            autoComplete="off"
            className="px-8 py-7 space-y-5"
          >
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="text"
                className={`mt-1 w-full h-11 px-3 rounded-md border ${
                  errors.email ? "border-red" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={showpassword ? "text" : "password"}
                  className={`mt-1 w-full h-11 px-3 pr-14 rounded-md border ${
                    errors.password ? "border-red" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-purple focus:border-purple`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showpassword)}
                  className="absolute inset-y-0 right-0 px-4 text-sm text-gray-500 hover:text-gray-700"
                >
                  {showpassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-md bg-purple text-white text-sm font-semibold tracking-wide hover:opacity-90 disabled:opacity-70 transition"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 text-sm">
              <span className="text-gray-600">
                New user?{" "}
                <NavLink
                  to="/signup"
                  className="font-medium text-purple hover:underline"
                >
                  Create account
                </NavLink>
              </span>

              <Link
                to="/forgetPassword"
                className="text-purple hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginComponent;
