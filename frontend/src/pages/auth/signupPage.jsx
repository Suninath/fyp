import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useDispatch } from "react-redux";
import { userSignup } from "../../rtk/thunk/authThunk";
yupResolver;
function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isShow, setShow] = useState(false);
  const [password, setpassword] = useState(false);
  const SigninSchema = yup.object({
    firstName: yup.string().required("Enter your  First Name"),
    lastName: yup.string().required("Enter your Last Name"),
    email: yup
      .string()
      .required("Enter your Email")
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email"),
    phoneNumber: yup.string().required("Enter Phone Number"),
    // role: yup.string().required("Select  Your Role"),
    password: yup.string().required("Enter Your Password"),
    confirmpassword: yup
      .string()
      .required("Re-Type Your Password")
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(SigninSchema),
  });

  const OnSubmit = async (data) => {
    const result = await dispatch(userSignup(data));

    if (userSignup.fulfilled.match(result)) {
      navigate("/verifyOtp");
    }
  };

  return (
    <div className="container mx-auto ">
      <div className="flex items-center justify-center h-screen ">
        <div className="relative p-3 w-[350px] lg:w-[500px] md:w-[500px] shadow-[0px_1px_3px_3px_#00000024] ">
          <form onSubmit={handleSubmit(OnSubmit)}>
            <div className="flex flex-col gap-5 mt-12 md:mt-14">
              <div className="flex flex-wrap gap-5 lg:flex-nowrap md:flex-nowrap ">
                <div className="flex flex-col w-full gap-1">
                  <input
                    id="firstName"
                    type="text"
                    className={`w-full h-10 pl-2 text-black  :text-white placeholder-gray-500 bg-transparent border ${
                      errors.firstName ? "border-red" : "border-gray-500"
                    }  rounded-sm shadow-[0px_1px_2px_1px_#00000024] `}
                    placeholder="First name"
                    {...register("firstName", { required: true })}
                    autoComplete="off"
                    autoFocus="on"
                  />
                  <small className="tracking-wider text-red">
                    {errors.firstName?.message}
                  </small>
                </div>
                <div className="flex flex-col w-full gap-1">
                  <input
                    id="lastName"
                    type="text"
                    className={`w-full h-10 pl-2 text-black  :text-white placeholder-gray-500 bg-transparent border ${
                      errors.lastName ? "border-red" : "border-gray-500"
                    }  rounded-sm shadow-[0px_1px_2px_1px_#00000024] `}
                    placeholder="Last name"
                    {...register("lastName", { required: true })}
                    autoComplete="off"
                  />
                  <small className="tracking-wider text-red">
                    {errors.lastName?.message}
                  </small>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <input
                  id="email"
                  type="text"
                  className={`w-full h-10 pl-2 text-black  :text-white placeholder-gray-500 bg-transparent border ${
                    errors.email ? "border-red" : "border-gray-500"
                  }  rounded-sm shadow-[0px_1px_2px_1px_#00000024] `}
                  placeholder="Email"
                  {...register("email")}
                  autoComplete="off"
                />
                <small className="tracking-wider text-red">
                  {errors.email?.message}
                </small>
              </div>
              <div className="flex flex-col gap-5 ">
                <div className="flex flex-col gap-1.5 relative">
                  <input
                    type={password ? "text" : "password"}
                    autoComplete="off"
                    className={`w-full h-10 pl-2 text-black  :text-white placeholder-gray-500 bg-transparent border ${
                      errors.password ? "border-red" : "border-gray-500"
                    }  rounded-sm shadow-[0px_1px_2px_1px_#00000024] `}
                    id="password"
                    placeholder="Create Password"
                    {...register("password")}
                  />
                  <small className="tracking-wider text-red">
                    {errors.password?.message}
                  </small>
                  <span
                    onClick={() => setpassword(!password)}
                    className="absolute cursor-pointer right-5 top-2.5"
                  >
                    {password ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        className="text-gray-500"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7" />
                          <circle cx="12" cy="12" r="3" />
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        className="text-gray-500"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24m-3.39-9.04A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
                        </g>
                      </svg>
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <input
                    type={isShow ? "text" : "password"}
                    autoComplete="off"
                    className={`w-full h-10 pl-2 text-black  :text-white placeholder-gray-500 bg-transparent border ${
                      errors.confirmpassword ? "border-red" : "border-gray-500"
                    }  rounded-sm shadow-[0px_1px_2px_1px_#00000024] `}
                    id="confirmpassword"
                    placeholder="Re-type  your password"
                    {...register("confirmpassword", {
                      required: true,
                    })}
                  />
                  <span
                    onClick={() => setShow(!isShow)}
                    className="absolute cursor-pointer right-5 top-2.5"
                  >
                    {isShow ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        className="text-gray-500"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7" />
                          <circle cx="12" cy="12" r="3" />
                        </g>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        className="text-gray-500"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        >
                          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24m-3.39-9.04A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20" />
                        </g>
                      </svg>
                    )}
                  </span>
                  <small className="tracking-wider text-red">
                    {errors?.confirmpassword?.message}
                  </small>
                </div>
              </div>
              <div className="flex flex-wrap gap-5 lg:flex-nowrap md:flex-nowrap">
                <div className="flex flex-col w-full">
                  <input
                    id="phoneNumber"
                    type="text"
                    className={`w-full h-10 pl-2 text-black  :text-white placeholder-gray-500 bg-transparent border ${
                      errors.phoneNumber ? "border-red" : "border-gray-500"
                    }  rounded-sm shadow-[0px_1px_2px_1px_#00000024] `}
                    placeholder="Phone number"
                    {...register("phoneNumber", { required: true })}
                    autoComplete="off"
                  />
                  <small className="tracking-wider text-red">
                    {errors.phoneNumber?.message}
                  </small>
                </div>
                {/* <div className="flex flex-col w-full gap-1">
                  <select
                    className={`w-full bg-white h-10 text-gray-500 pl-2  bg-transparent border ${
                      errors.role ? "border-red" : "border-gray-500"
                    }  rounded-sm shadow-[0px_1px_2px_1px_#00000024] `}
                    {...register("role")}
                    defaultValue="" // Set the default value to an empty string
                  >
                    <option value="" disabled selected hidden>
                      Select Category
                    </option>
                    <option value="dealer">Dealer</option>
                    <option value="user">User</option>
                  </select>
                  <small className="tracking-wider text-red">
                    {errors.role?.message}
                  </small>
                </div> */}
              </div>

              <div className="flex flex-col gap-5 text-white">
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
                    className="text-xl border-gray-500 rounded-sm shadow-[0px_1px_2px_1px_#00000024] h-10  bg-purple"
                  >
                    Sign Up
                  </button>
                )}
                <span className="text-center text-black">
                  Already have an account?&nbsp;
                  <NavLink
                    to="/login"
                    className="font-medium underline text-purple"
                  >
                    Signin
                  </NavLink>
                </span>
              </div>
            </div>
          </form>
          <h1 className="absolute p-1 text-lg font-medium text-white border border-gray-500 rounded top-3 -left-7 bg-purple">
            Nice to meet you
          </h1>
        </div>
      </div>
    </div>
  );
}

export default Signup;
