import React, { useState, useEffect } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import { verifyOtp } from "../../rtk/thunk/authThunk";
import { useNavigate } from "react-router-dom";

function OtpValidationPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ OTP expiry timestamp (5 minutes from creation)
  const OTP_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const storedExpiry = Number(localStorage.getItem("otpExpiry"));
  const initialExpiry = storedExpiry || Date.now() + OTP_DURATION;
  const [otpExpiry, setOtpExpiry] = useState(initialExpiry);

  const [timeLeft, setTimeLeft] = useState(
    Math.max(Math.floor((initialExpiry - Date.now()) / 1000), 0)
  );

  const isComplete = otp.length === 6 && email;

  // ✅ Countdown timer
  useEffect(() => {
    localStorage.setItem("otpExpiry", otpExpiry);

    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      const remaining = Math.floor((otpExpiry - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [otpExpiry, timeLeft]);

  const submitOtp = async () => {
    if (!email || otp.length !== 6) {
      setError("Email and OTP are required");
      return;
    }

    if (timeLeft <= 0) {
      setError("OTP has expired");
      return;
    }

    setLoading(true);
    setError(null);

    const result = await dispatch(verifyOtp({ email, otp }));

    setLoading(false);

    if (verifyOtp.fulfilled.match(result)) {
      localStorage.removeItem("otpExpiry"); // clear expiry after success
      navigate("/login");
    } else {
      setError("Invalid OTP");
      setOtp("");
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg space-y-6">
        <h1 className="text-2xl font-semibold text-center text-gray-900">
          Verify OTP
        </h1>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 text-center">
            Enter OTP
          </label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
              disabled={loading || timeLeft <= 0}
            >
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="border border-gray-400 rounded-md w-10 h-10 text-center mx-1"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        <p className="text-xs text-center text-gray-500">
          OTP valid for{" "}
          <span className="font-medium">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </p>

        {error && (
          <p className="text-sm text-red text-center">{error}</p>
        )}

        <Button
          className="w-full bg-purple text-white flex justify-center items-center"
          onClick={submitOtp}
          disabled={!isComplete || loading || timeLeft <= 0}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify OTP
        </Button>

        <p className="text-xs text-gray-500 text-center">
          Didn’t receive the code?{" "}
          <span
            onClick={() => {
              // ✅ Reset OTP timer if resend
              const newExpiry = Date.now() + OTP_DURATION;
              setOtpExpiry(newExpiry);
              setTimeLeft(Math.floor(OTP_DURATION / 1000));
            }}
            className="text-purple cursor-pointer hover:underline"
          >
            Resend OTP
          </span>
        </p>
      </div>
    </div>
  );
}

export default OtpValidationPage;
