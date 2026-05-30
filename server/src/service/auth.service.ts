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
import {
  getInvalidPhoneMessage,
  isValidNepaliPhoneNumber,
} from "../utils/phone";

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

      const isProd = process.env.NODE_ENV === "production";

      res.cookie("access_token", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
      });

      return {
        status: true,
        code: 200,
        message: "Login successful",
        data: { role: auth.role, accessToken },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== REGISTER USER ===================== */
  async register(req: Request) {
    try {
      const {
        name,
        email,
        phoneNumber,
        password,
        termsAccepted,
        privacyAccepted,
        personalDataConsent,
      } = req.body;

      if (!name || !email || !phoneNumber || !password) {
        return { status: false, code: 400, message: "All fields required" };
      }

      if (!termsAccepted || !privacyAccepted || !personalDataConsent) {
        return {
          status: false,
          code: 400,
          message: "You must accept the Terms, Privacy Policy, and personal data consent",
        };
      }

      const normalizedPhone = String(phoneNumber).trim();
      if (!isValidNepaliPhoneNumber(normalizedPhone)) {
        return {
          status: false,
          code: 400,
          errorCode: "INVALID_PHONE",
          message: getInvalidPhoneMessage(),
        };
      }

      const existingEmail = await authRepository.findOneBy({ email });
      if (existingEmail) {
        return { status: false, code: 400, message: "Email already exists" };
      }

      const existingPhone = await userRepository.findOneBy({ phoneNumber: normalizedPhone });
      if (existingPhone) {
        return {
          status: false,
          code: 400,
          message: "Phone number already exists",
        };
      }

      const hashedPassword = await hashPassword(password);

      /* SAVE USER FIRST */
      const consentAt = new Date();
      const user = userRepository.create({
        name,
        phoneNumber: normalizedPhone,
        termsAccepted: Boolean(termsAccepted),
        privacyAccepted: Boolean(privacyAccepted),
        personalDataConsent: Boolean(personalDataConsent),
        consentVersion: "1.0",
        consentAt,
      });
      await userRepository.save(user);

      /* THEN SAVE AUTH */
      const auth = authRepository.create({
        email,
        password: hashedPassword,
        role: USER_ROLE.USER,
        emailVerified: false,
        accountVerified: false,
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

      if (auth.emailVerified) {
        return { status: false, code: 400, message: "Email already verified" };
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

      auth.emailVerified = true;
      await authRepository.save(auth);
      await otpRepository.remove(otpRecord);

      return { 
        status: true, 
        code: 200, 
        message: "Email verified successfully. Please upload required documents for account verification" 
      };
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

      console.log(`📋 User profile requested - ID: ${userDetails.id}, accountVerified: ${userDetails.auth.accountVerified}`);

      return {
        status: true,
        code: 200,
        message: "User retrieved",
        data: {
          id: userDetails.id,
          name: userDetails.name,
          email: userDetails.auth.email,
          role: userDetails.auth.role,
          emailVerified: userDetails.auth.emailVerified,
          accountVerified: userDetails.auth.accountVerified,
          verificationRejected: userDetails.auth.verificationRejected,
          rejectionReason: userDetails.auth.rejectionReason,
          phoneNumber: userDetails.phoneNumber,
          userType: userDetails.userType,
          termsAccepted: userDetails.termsAccepted,
          privacyAccepted: userDetails.privacyAccepted,
          personalDataConsent: userDetails.personalDataConsent,
          consentVersion: userDetails.consentVersion,
          consentAt: userDetails.consentAt,
          createdAt: userDetails.createdAt,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  /* ===================== UPDATE PROFILE ===================== */
  async updateProfile(req: Request) {
    try {
      const currentUser = (req as any).user;

      if (!currentUser?.id) {
        return { status: false, code: 401, message: "Unauthorized" };
      }

      const { name, phoneNumber, email } = req.body as {
        name?: string;
        phoneNumber?: string;
        email?: string;
      };

      if (!name && !phoneNumber && !email) {
        return { status: false, code: 400, message: "No fields to update" };
      }

      const userDetails = await userRepository.findOne({
        where: { id: currentUser.id },
        relations: ["auth"],
      });

      if (!userDetails || !userDetails.auth) {
        return { status: false, code: 404, message: "User not found" };
      }

      // Update name
      if (typeof name === "string") {
        userDetails.name = name.trim();
      }

      // Update phone number with uniqueness check
      if (typeof phoneNumber === "string") {
        const normalizedPhone = phoneNumber.trim();
        if (normalizedPhone && !isValidNepaliPhoneNumber(normalizedPhone)) {
          return {
            status: false,
            code: 400,
            errorCode: "INVALID_PHONE",
            message: getInvalidPhoneMessage(),
          };
        }

        if (normalizedPhone && normalizedPhone !== userDetails.phoneNumber) {
          const existingPhone = await userRepository.findOne({
            where: { phoneNumber: normalizedPhone },
          });
          if (existingPhone && existingPhone.id !== userDetails.id) {
            return {
              status: false,
              code: 400,
              message: "Phone number already in use",
            };
          }
          userDetails.phoneNumber = normalizedPhone;
        }
      }

      let emailChanged = false;
      // Update email with uniqueness + re-verification flow
      if (typeof email === "string") {
        const normalizedEmail = email.trim().toLowerCase();
        if (normalizedEmail && normalizedEmail !== userDetails.auth.email) {
          const existingEmail = await authRepository.findOne({
            where: { email: normalizedEmail },
          });
          if (existingEmail && existingEmail.user?.id !== userDetails.id) {
            return {
              status: false,
              code: 400,
              message: "Email already in use",
            };
          }
          userDetails.auth.email = normalizedEmail;
          userDetails.auth.emailVerified = false; // require re-verification after email change
          emailChanged = true;
        }
      }

      await userRepository.save(userDetails);
      await authRepository.save(userDetails.auth);

      // If email changed, generate a new OTP and email the user
      if (emailChanged) {
        // remove old OTPs
        await otpRepository.delete({ user: { id: userDetails.id } });

        const otp = generateOtp();
        const hashedOtp = await hashPassword(otp);
        const userOtp = otpRepository.create({
          otp: hashedOtp,
          expiresAt: otpExpiry(),
          user: userDetails,
        });
        await otpRepository.save(userOtp);

        const mailParams: OtpEmailParams = {
          firstname: userDetails.name || "User",
          otp,
        };

        sendMail(
          [userDetails.auth.email],
          "Account Verification OTP",
          generateOtpEmailHTML(mailParams)
        );
      }

      return {
        status: true,
        code: 200,
        message: "Profile updated",
        data: {
          id: userDetails.id,
          name: userDetails.name,
          email: userDetails.auth.email,
          role: userDetails.auth.role,
          emailVerified: userDetails.auth.emailVerified,
          accountVerified: userDetails.auth.accountVerified,
          verificationRejected: userDetails.auth.verificationRejected,
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

  /* ===================== LOGOUT ===================== */
  async logout(req: Request, res: Response) {
    try {
      // Clear the cookies
      res.clearCookie("access_token", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });
      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      });

      return {
        status: true,
        code: 200,
        message: "Logout successful",
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

      const normalizedPhone = String(phoneNumber).trim();
      if (!isValidNepaliPhoneNumber(normalizedPhone)) {
        return {
          status: false,
          code: 400,
          errorCode: "INVALID_PHONE",
          message: getInvalidPhoneMessage(),
        };
      }

      const existingEmail = await authRepository.findOneBy({ email });
      if (existingEmail) {
        return { status: false, code: 400, message: "Email already exists" };
      }

      const existingPhone = await userRepository.findOneBy({ phoneNumber: normalizedPhone });
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
        phoneNumber: normalizedPhone,
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
        emailVerified: true, // Store can be email verified directly
        accountVerified: false, // Still needs document verification
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
function generateOtpEmailHTML({ firstname, otp }: OtpEmailParams) {
  return `
    <h3>Hello ${firstname || "User"}</h3>
    <p>Your OTP is <b>${otp}</b></p>
    <p>This OTP will expire in 5 minutes.</p>
  `;
}
