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
  const [timeLeft, setTimeLeft] = useState(300); // ✅ 5 minutes

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isComplete = otp.length === 6 && email;

  // ✅ Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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
      navigate("/login");
    } else {
      setError("Invalid OTP");
      setOtp("");
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-background p-6 shadow-sm space-y-6">
        <h1 className="text-xl font-semibold text-center">Verify OTP</h1>

        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-black rounded-md px-3 py-2 text-sm"
        />

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
                  className="border border-black"
                  key={i}
                  index={i}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* ✅ Timer display */}
        <p className="text-xs text-center text-muted-foreground">
          OTP valid for{" "}
          <span className="font-medium">
            {minutes}:{seconds.toString().padStart(2, "0")}
          </span>
        </p>

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

        <Button
          className="w-full bg-purple text-white"
          onClick={submitOtp}
          disabled={!isComplete || loading || timeLeft <= 0}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify OTP
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Didn’t receive the code? Resend OTP
        </p>
      </div>
    </div>
  );
}

export default OtpValidationPage;
