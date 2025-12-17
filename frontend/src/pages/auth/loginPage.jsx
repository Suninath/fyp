import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { userLogin } from "../../rtk/thunk/authThunk";
function Login() {
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
    <div className="container mx-auto :bg--bg">
      <div className="flex items-center justify-center h-screen ">
        <div className="relative p-3 w-80 lg:w-[400px]  md:w-[400px] shadow-[0px_1px_3px_3px_#00000024] :shadow-sm :shadow-white">
          <form onSubmit={handleSubmit(onSumit)} autoComplete="off">
            <div className="flex flex-col gap-5 pt-10 mt-4 text-white">
              <div className="w-full">
                <input
                  id="email"
                  type="text"
                  autoComplete="off"
                  className={`w-full pl-2 text-black bg-transparent ${
                    errors.email?.message ? "border-red" : "border-gray-500"
                  } border border-gray-500 rounded-sm shadow-[0px_1px_2px_1px_#00000024]  h-14`}
                  placeholder="Email"
                  {...register("email")}
                />
                <small className="text-xs text-red">
                  {errors.email?.message}
                </small>
              </div>

              <div className="relative w-full">
                <input
                  id="password"
                  type={showpassword ? "text" : "password"}
                  className={`w-full pl-2 text-black bg-transparent ${
                    errors.password?.message ? "border-red" : "border-gray-500"
                  } border border-gray-500 rounded-sm shadow-[0px_1px_2px_1px_#00000024]  h-14`}
                  placeholder="Password"
                  {...register("password")}
                />
                <small className="text-xs text-red">
                  {errors.password?.message}
                </small>
                <span
                  className="absolute top-5 right-3"
                  onClick={() => setShowPassword(!showpassword)}
                >
                  {showpassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="text-gray-300"
                    >
                      <path
                        fill="black"
                        d="M12 16q1.875 0 3.188-1.313T16.5 11.5q0-1.875-1.313-3.188T12 7q-1.875 0-3.188 1.313T7.5 11.5q0 1.875 1.313 3.188T12 16Zm0-1.8q-1.125 0-1.913-.788T9.3 11.5q0-1.125.788-1.913T12 8.8q1.125 0 1.913.788T14.7 11.5q0 1.125-.787 1.913T12 14.2Zm0 4.8q-3.65 0-6.65-2.038T1 11.5q1.35-3.425 4.35-5.463T12 4q3.65 0 6.65 2.038T23 11.5q-1.35 3.425-4.35 5.463T12 19Zm0-7.5Zm0 5.5q2.825 0 5.188-1.488T20.8 11.5q-1.25-2.525-3.613-4.013T12 6Q9.175 6 6.812 7.488T3.2 11.5q1.25 2.525 3.613 4.013T12 17Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      className="text-gray-300"
                    >
                      <path
                        fill="black"
                        d="m16.1 13.3l-1.45-1.45q.225-1.175-.675-2.2t-2.325-.8L10.2 7.4q.425-.2.863-.3T12 7q1.875 0 3.188 1.313T16.5 11.5q0 .5-.1.938t-.3.862Zm3.2 3.15l-1.45-1.4q.95-.725 1.688-1.587T20.8 11.5q-1.25-2.525-3.588-4.013T12 6q-.725 0-1.425.1T9.2 6.4L7.65 4.85q1.025-.425 2.1-.638T12 4q3.575 0 6.425 1.887T22.7 10.8q.075.125.1.313t.025.387q0 .2-.037.388t-.088.312q-.575 1.275-1.437 2.35t-1.963 1.9Zm-.2 5.45l-3.5-3.45q-.875.275-1.762.413T12 19q-3.575 0-6.425-1.888T1.3 12.2q-.075-.125-.1-.312t-.025-.388q0-.2.025-.375t.1-.3Q1.825 9.7 2.55 8.75T4.15 7L2.075 4.9Q1.8 4.625 1.8 4.212t.3-.712q.275-.275.7-.275t.7.275l17 17q.275.275.288.688t-.288.712q-.275.275-.7.275t-.7-.275ZM5.55 8.4q-.725.65-1.325 1.425T3.2 11.5q1.25 2.525 3.588 4.013T12 17q.5 0 .975-.063t.975-.137l-.9-.95q-.275.075-.525.113T12 16q-1.875 0-3.188-1.312T7.5 11.5q0-.275.038-.525t.112-.525L5.55 8.4Zm7.975 2.325ZM9.75 12.6Z"
                      />
                    </svg>
                  )}
                </span>
              </div>
              <div className="flex flex-col gap-5">
                {isSubmitting ? (
                  <button
                    type="submit"
                    className="text-3xl flex justify-center items-center border-gray-500 rounded-sm shadow-[0px_1px_2px_1px_#00000024] h-14 bg-purple"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z"
                      >
                        <animateTransform
                          attributeName="transform"
                          dur="0.75s"
                          repeatCount="indefinite"
                          type="rotate"
                          values="0 12 12;360 12 12"
                        />
                      </path>
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="text-3xl border-gray-500 rounded-sm shadow-[0px_1px_2px_1px_#00000024] h-14 bg-purple"
                  >
                    Sign In
                  </button>
                )}
                <div className="flex items-center justify-between text-center text-black">
                  <div className="text-sm">
                    Don't have an account?{" "}
                    <NavLink
                      to="/signup"
                      className="font-medium underline text-purple"
                    >
                      Signup
                    </NavLink>
                  </div>
                  <Link
                    to="/forgetpassword"
                    className="text-xs underline text-purple"
                  >
                    Forgetpassword?
                  </Link>
                </div>
              </div>
            </div>
          </form>
          <h1 className="absolute p-1 text-lg font-medium text-white border border-gray-500 rounded top-3 -left-7 bg-purple">
            Welcome Back
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Login;
