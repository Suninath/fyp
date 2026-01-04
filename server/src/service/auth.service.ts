import { Request, Response } from "express";

import { genAccessToken, genRefreshToken } from "../utils/tokenGen";
import { comparePassword, hashPassword } from "../helper/passwordHelper";
import AppDataSource from "../config/db.config";
import { UserEntity } from "../entities/user.entity";
import { generateOtp, otpExpiry } from "../helper/otpGeneration";
import { UserOtpEntity } from "../entities/otp.entity";
import sendMail from "../helper/sendmail";
import { OtpEmailParams } from "../interface/otpInterface";

const userRepository = AppDataSource.getRepository(UserEntity);
const otpRepository = AppDataSource.getRepository(UserOtpEntity);

const authService = {
  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    console.log(email, password);

    try {
      if (!email || !password) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      const existingUser = await userRepository.findOne({
        where: { email },
      });

      if (!existingUser) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      if (!existingUser.verified) {
        return {
          status: false,
          code: 400,
          message: "Please, verify your account",
        };
      }

      // Here you can add password verification (e.g., bcrypt.compare)
      const matchPassword = comparePassword(password, existingUser?.password);
      if (!matchPassword) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      const accessToken = genAccessToken({
        email: existingUser?.email,
        id: existingUser?.id,
        role: existingUser?.role,
      });

      const refreshToken = genRefreshToken({
        email: existingUser?.email,
        id: existingUser?.id,
        role: existingUser?.role,
      });

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      return {
        status: false,
        code: 200,
        message: "Login successful",
        data: existingUser.role,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async register(req: Request) {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return { status: false, code: 400, message: "All fields are required" };
    }

    // Local part: letters/numbers with optional single dots between segments (no leading/trailing/consecutive dots)
    // Domain: letters/numbers separated by dots, ending with a TLD of at least 2 letters
    const emailRegex =
      /^[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*@[A-Za-z0-9]+(?:\.[A-Za-z0-9]+)*\.[A-Za-z]{2,}$/;

    if (!emailRegex.test(email)) {
      return {
        status: false,
        code: 400,
        message: "Email can only contain letters, numbers, dots, and '@'",
      };
    }

    // Phone must be 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return {
        status: false,
        code: 400,
        message: "Phone number must be exactly 10 digits",
      };
    }

    const existingByEmail = await userRepository.findOneBy({ email });
    if (existingByEmail) {
      return {
        status: false,
        code: 400,
        message: "User with this email already exists",
      };
    }

    const existingByPhone = await userRepository.findOneBy({ phoneNumber });
    if (existingByPhone) {
      return {
        status: false,
        code: 400,
        message: "User with this phone number already exists",
      };
    }

    const hashedPassword = await hashPassword(password);

    const user = userRepository.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      password: hashedPassword,
      verified: false,
    });

    await userRepository.save(user);

    // 🔐 OTP logic
    const otp = generateOtp();
    const hashedOtp = await hashPassword(otp);

    const userOtp = otpRepository.create({
      otp: hashedOtp,
      expiresAt: otpExpiry(),
      user,
    });

    await otpRepository.save(userOtp);

    try {
      const recipientEmails = [email];
      const emailHTML = generateOtpEmailHTML({
        firstname: firstName,
        lastname: lastName,
        otp,
      });
      const emailText = "Please verify your account to access the system";
      sendMail(recipientEmails, emailText, emailHTML);

      console.log("OTP (dev only):", otp);
    } catch (error) {
      console.log(error);
      console.log("Could not send the OTP");
    }

    return {
      status: true,
      code: 201,
      message: "OTP sent. Please verify your account.",
    };
  },

  async verifyOtp(req: Request) {
    const { email, otp } = req.body;
    console.log("🚀 ~ email, otp:", email, otp);

    const user = await userRepository.findOneBy({ email });

    if (!user) {
      return { status: false, code: 404, message: "User not found" };
    }

    if (user.verified) {
      return { status: false, code: 400, message: "User already verified" };
    }

    const otpRecord = await otpRepository.findOne({
      where: { user: { id: user.id } },
      relations: ["user"],
    });

    if (!otpRecord) {
      return { status: false, code: 400, message: "OTP not found" };
    }

    if (otpRecord.expiresAt < new Date()) {
      return { status: false, code: 400, message: "OTP expired" };
    }

    const isValid = await comparePassword(otp, otpRecord.otp);

    if (!isValid) {
      return { status: false, code: 400, message: "Invalid OTP" };
    }

    user.verified = true;
    await userRepository.save(user);

    await otpRepository.remove(otpRecord);

    return {
      status: true,
      code: 200,
      message: "Account verified successfully",
    };
  },

  async forgetPasswword(req: Request) {
    try {
      const { email } = req.body;
      const user = await userRepository.findOneBy({ email });
      if (!user) {
        return { status: false, code: 404, message: "User not found" };
      }

      // Generate and send OTP logic here
      const otp = generateOtp();
      const hashedOtp = await hashPassword(otp);

      const userOtp = otpRepository.create({
        otp: hashedOtp,
        expiresAt: otpExpiry(),
        user,
      });
      await otpRepository.save(userOtp);

      try {
        const recipientEmails = [email];
        const emailHTML = generateResetOtpEmailHTML({
          firstname: user.firstName,
          lastname: user.lastName,
          otp,
        });
        const emailText = "Password reset OTP";
        sendMail(recipientEmails, emailText, emailHTML);
        console.log("OTP (dev only):", otp);

        return {
          status: true,
          code: 200,
          message: "OTP sent to your email",
        };
      } catch (error) {
        console.log("Could not send the OTP");
        return {
          status: false,
          code: 500,
          message: "Could not send the OTP",
        };
      }
    } catch (error) {
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async resetPassword(req: Request) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return {
        status: false,
        code: 400,
        message: "Email, OTP, and new password are required",
      };
    }

    const user = await userRepository.findOneBy({ email });
    if (!user) {
      return { status: false, code: 404, message: "User not found" };
    }

    const otpRecord = await otpRepository.findOne({
      where: { user: { id: user.id } },
      relations: ["user"],
    });

    if (!otpRecord) {
      return { status: false, code: 400, message: "OTP not found" };
    }

    if (otpRecord.expiresAt < new Date()) {
      return { status: false, code: 400, message: "OTP expired" };
    }

    const isValid = await comparePassword(otp, otpRecord.otp);
    if (!isValid) {
      return { status: false, code: 400, message: "Invalid OTP" };
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    user.password = hashedPassword;
    await userRepository.save(user);

    // Remove OTP
    await otpRepository.remove(otpRecord);

    return {
      status: true,
      code: 200,
      message: "Password reset successfully",
    };
  },
};

export const generateOtpEmailHTML = ({
  firstname,
  lastname,
  otp,
  expiryMinutes = 5,
}: OtpEmailParams) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Account</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif; color:#333;">
  <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background-color:#4CAF50; padding:20px; text-align:center; color:#ffffff;">
      <h1 style="margin:0; font-size:22px;">Account Verification</h1>
    </div>

    <!-- Content -->
    <div style="padding:25px; text-align:center;">
      <p style="font-size:16px; margin-bottom:10px;">
        Hello <strong>${firstname} ${lastname}</strong>,
      </p>

      <p style="font-size:15px; line-height:1.6;">
        Use the verification code below to complete your signup.
      </p>

      <div style="margin:30px 0;">
        <span style="
          display:inline-block;
          font-size:32px;
          letter-spacing:6px;
          font-weight:bold;
          background:#f0f0f0;
          padding:15px 25px;
          border-radius:6px;
          color:#333;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size:14px; color:#555;">
        This code will expire in <strong>${expiryMinutes} minutes</strong>.
      </p>

      <p style="font-size:14px; color:#777; margin-top:25px;">
        If you did not request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f9; padding:15px; text-align:center; font-size:13px; color:#666;">
      <p style="margin:0;">© 2025 Your Company. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
`;
};

export const generateResetOtpEmailHTML = ({
  firstname,
  lastname,
  otp,
  expiryMinutes = 5,
}: OtpEmailParams) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif; color:#333;">
  <div style="max-width:600px; margin:30px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 6px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background-color:#FF5722; padding:20px; text-align:center; color:#ffffff;">
      <h1 style="margin:0; font-size:22px;">Password Reset</h1>
    </div>

    <!-- Content -->
    <div style="padding:25px; text-align:center;">
      <p style="font-size:16px; margin-bottom:10px;">
        Hello <strong>${firstname} ${lastname}</strong>,
      </p>

      <p style="font-size:15px; line-height:1.6;">
        Use the verification code below to reset your password.
      </p>

      <div style="margin:30px 0;">
        <span style="
          display:inline-block;
          font-size:32px;
          letter-spacing:6px;
          font-weight:bold;
          background:#f0f0f0;
          padding:15px 25px;
          border-radius:6px;
          color:#333;
        ">
          ${otp}
        </span>
      </div>

      <p style="font-size:14px; color:#555;">
        This code will expire in <strong>${expiryMinutes} minutes</strong>.
      </p>

      <p style="font-size:14px; color:#777; margin-top:25px;">
        If you did not request this, please ignore this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#f9f9f9; padding:15px; text-align:center; font-size:13px; color:#666;">
      <p style="margin:0;">© 2025 Your Company. All rights reserved.</p>
    </div>

  </div>
</body>
</html>
`;
};

export default authService;
