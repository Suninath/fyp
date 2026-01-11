import { Request, Response } from "express";
import AppDataSource from "../config/db.config";

import { genAccessToken, genRefreshToken } from "../utils/tokenGen";
import { comparePassword, hashPassword } from "../helper/passwordHelper";
import { generateOtp, otpExpiry } from "../helper/otpGeneration";
import sendMail from "../helper/sendmail";

import { UserEntity } from "../entities/user.entity";
import { AuthEntity } from "../entities/auth.entity";
import { UserOtpEntity } from "../entities/otp.entity";
import { USER_ROLE } from "../constant/enums";
import { OtpEmailParams } from "../interface/otpInterface";

const userRepository = AppDataSource.getRepository(UserEntity);
const authRepository = AppDataSource.getRepository(AuthEntity);
const otpRepository = AppDataSource.getRepository(UserOtpEntity);

const authService = {
  /* ===================== LOGIN ===================== */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return {
          status: false,
          code: 400,
          message: "Email and password required",
        };
      }

      const auth = await authRepository.findOne({
        where: { email },
        relations: ["user"],
      });

      if (!auth || !auth.user) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      if (!auth.verified) {
        return {
          status: false,
          code: 400,
          message: "Please verify your account",
        };
      }

      const isPasswordValid = await comparePassword(password, auth.password);
      if (!isPasswordValid) {
        return {
          status: false,
          code: 400,
          message: "Invalid email or password",
        };
      }

      const payload = {
        id: auth.user.id,
        email: auth.email,
        role: auth.role,
      };

      const accessToken = genAccessToken(payload);
      const refreshToken = genRefreshToken(payload);

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
        status: true,
        code: 200,
        message: "Login successful",
        data: { role: auth.role },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== REGISTER USER ===================== */
  async register(req: Request) {
    try {
      const { name, email, phoneNumber, password } = req.body;

      if (!name || !email || !phoneNumber || !password) {
        return { status: false, code: 400, message: "All fields required" };
      }

      const existingEmail = await authRepository.findOneBy({ email });
      if (existingEmail) {
        return { status: false, code: 400, message: "Email already exists" };
      }

      const existingPhone = await userRepository.findOneBy({ phoneNumber });
      if (existingPhone) {
        return {
          status: false,
          code: 400,
          message: "Phone number already exists",
        };
      }

      const hashedPassword = await hashPassword(password);

      /* SAVE USER FIRST */
      const user = userRepository.create({ name, phoneNumber });
      await userRepository.save(user);

      /* THEN SAVE AUTH */
      const auth = authRepository.create({
        email,
        password: hashedPassword,
        role: USER_ROLE.USER,
        verified: false,
        user,
      });
      await authRepository.save(auth);

      /* OTP */
      const otp = generateOtp();
      const hashedOtp = await hashPassword(otp);

      const userOtp = otpRepository.create({
        otp: hashedOtp,
        expiresAt: otpExpiry(),
        user,
      });
      await otpRepository.save(userOtp);

      sendMail(
        [email],
        "Account Verification OTP",
        generateOtpEmailHTML({ firstname: name, otp })
      );

      console.log("OTP (dev):", otp);

      return {
        status: true,
        code: 201,
        message: "OTP sent. Please verify your account",
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== VERIFY OTP ===================== */
  async verifyOtp(req: Request) {
    try {
      const { email, otp } = req.body;

      const auth = await authRepository.findOne({
        where: { email },
        relations: ["user"],
      });

      if (!auth || !auth.user) {
        return { status: false, code: 404, message: "User not found" };
      }

      if (auth.verified) {
        return { status: false, code: 400, message: "Already verified" };
      }

      const otpRecord = await otpRepository.findOne({
        where: { user: { id: auth.user.id } },
        relations: ["user"],
      });

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return { status: false, code: 400, message: "OTP invalid or expired" };
      }

      const isValid = await comparePassword(otp, otpRecord.otp);
      if (!isValid) {
        return { status: false, code: 400, message: "Invalid OTP" };
      }

      auth.verified = true;
      await authRepository.save(auth);
      await otpRepository.remove(otpRecord);

      return { status: true, code: 200, message: "Account verified" };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== FORGOT PASSWORD ===================== */
  async forgotPassword(req: Request) {
    try {
      const { email } = req.body;

      if (!email) {
        return { status: false, code: 400, message: "Email is required" };
      }

      const auth = await authRepository.findOne({
        where: { email },
        relations: ["user"],
      });

      if (!auth || !auth.user) {
        return { status: false, code: 404, message: "User not found" };
      }

      const otp = generateOtp();
      const hashedOtp = await hashPassword(otp);

      // remove old OTPs
      await otpRepository.delete({ user: { id: auth.user.id } });

      const userOtp = otpRepository.create({
        otp: hashedOtp,
        expiresAt: otpExpiry(),
        user: auth.user,
      });

      await otpRepository.save(userOtp);

      sendMail(
        [email],
        "Password Reset OTP",
        generateOtpEmailHTML({
          firstname: auth.user.name || "User",
          otp,
        })
      );

      console.log("RESET OTP (dev):", otp);

      return { status: true, code: 200, message: "OTP sent to email" };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== RESET PASSWORD ===================== */
  async resetPassword(req: Request) {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return { status: false, code: 400, message: "All fields required" };
      }

      const auth = await authRepository.findOne({
        where: { email },
        relations: ["user"],
      });

      if (!auth || !auth.user) {
        return { status: false, code: 404, message: "User not found" };
      }

      const otpRecord = await otpRepository.findOne({
        where: { user: { id: auth.user.id } },
        relations: ["user"],
      });

      if (!otpRecord || otpRecord.expiresAt < new Date()) {
        return { status: false, code: 400, message: "OTP expired or invalid" };
      }

      const isValidOtp = await comparePassword(otp, otpRecord.otp);
      if (!isValidOtp) {
        return { status: false, code: 400, message: "Invalid OTP" };
      }

      auth.password = await hashPassword(newPassword);
      await authRepository.save(auth);

      await otpRepository.remove(otpRecord);

      return {
        status: true,
        code: 200,
        message: "Password reset successfully",
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== ME ===================== */
  async me(req: Request) {
    try {
      const user = (req as any).user;

      if (!user?.id) {
        return { status: false, code: 401, message: "Unauthorized" };
      }

      const userDetails = await userRepository.findOne({
        where: { id: user.id },
        relations: ["auth"],
      });

      if (!userDetails || !userDetails.auth) {
        return { status: false, code: 404, message: "User not found" };
      }

      return {
        status: true,
        code: 200,
        message: "User retrieved",
        data: {
          id: userDetails.id,
          name: userDetails.name,
          email: userDetails.auth.email,
          role: userDetails.auth.role,
          verified: userDetails.auth.verified,
          phoneNumber: userDetails.phoneNumber,
          createdAt: userDetails.createdAt,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== AUTHORIZE ===================== */
  async authorize(req: Request) {
    try {
      const user = (req as any).user;

      if (!user?.id) {
        return { status: false, code: 401, message: "Unauthorized" };
      }

      const userDetails = await userRepository.findOne({
        where: { id: user.id },
        relations: ["auth"],
      });

      if (!userDetails || !userDetails.auth) {
        return { status: false, code: 404, message: "User not found" };
      }

      return {
        status: true,
        code: 200,
        message: "Authorized",
        data: {
          role: userDetails.auth.role,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  async registerStore(req: Request) {
    try {
      const {
        storeName,
        name,
        email,
        phoneNumber,
        password,
        panNumber,
        companyRegistrationDoc,
      } = req.body;

      const storeNameValue = storeName || name;

      if (
        !storeNameValue ||
        !email ||
        !phoneNumber ||
        !password ||
        !panNumber ||
        !companyRegistrationDoc
      ) {
        return { status: false, code: 400, message: "All fields are required" };
      }

      const existingEmail = await authRepository.findOneBy({ email });
      if (existingEmail) {
        return { status: false, code: 400, message: "Email already exists" };
      }

      const existingPhone = await userRepository.findOneBy({ phoneNumber });
      if (existingPhone) {
        return {
          status: false,
          code: 400,
          message: "Phone number already exists",
        };
      }

      const hashedPassword = await hashPassword(password);

      /* SAVE STORE USER */
      const storeUser = userRepository.create({
        name: storeNameValue,
        phoneNumber,
        panNumber,
        companyRegistrationDoc,
        paymentStatus: true, // assuming stores are paid
      });
      await userRepository.save(storeUser);

      /* SAVE AUTH */
      const storeAuth = authRepository.create({
        email,
        password: hashedPassword,
        role: USER_ROLE.STORE,
        verified: true, // can also keep false if you want OTP verification
        user: storeUser,
      });
      await authRepository.save(storeAuth);

      return {
        status: true,
        code: 201,
        message: "Store registered successfully",
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },
};

/* ===================== REGISTER STORE ===================== */

export default authService;

/* ===================== HELPER ===================== */
function generateOtpEmailHTML({
  firstname,
  otp,
}: {
  firstname: string;
  otp: string;
}) {
  return `
    <h3>Hello ${firstname}</h3>
    <p>Your OTP is <b>${otp}</b></p>
    <p>This OTP will expire in 5 minutes.</p>
  `;
}
