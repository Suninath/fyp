"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_config_1 = __importDefault(require("../config/db.config"));
const tokenGen_1 = require("../utils/tokenGen");
const passwordHelper_1 = require("../helper/passwordHelper");
const otpGeneration_1 = require("../helper/otpGeneration");
const sendmail_1 = __importDefault(require("../helper/sendmail"));
const user_entity_1 = require("../entities/user.entity");
const auth_entity_1 = require("../entities/auth.entity");
const otp_entity_1 = require("../entities/otp.entity");
const enums_1 = require("../constant/enums");
const userRepository = db_config_1.default.getRepository(user_entity_1.UserEntity);
const authRepository = db_config_1.default.getRepository(auth_entity_1.AuthEntity);
const otpRepository = db_config_1.default.getRepository(otp_entity_1.UserOtpEntity);
const authService = {
    /* ===================== LOGIN ===================== */
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                if (!email || !password) {
                    return {
                        status: false,
                        code: 400,
                        message: "Email and password required",
                    };
                }
                const auth = yield authRepository.findOne({
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
                const isPasswordValid = yield (0, passwordHelper_1.comparePassword)(password, auth.password);
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
                const accessToken = (0, tokenGen_1.genAccessToken)(payload);
                const refreshToken = (0, tokenGen_1.genRefreshToken)(payload);
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
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
    /* ===================== REGISTER USER ===================== */
    register(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, phoneNumber, password } = req.body;
                if (!name || !email || !phoneNumber || !password) {
                    return { status: false, code: 400, message: "All fields required" };
                }
                const existingEmail = yield authRepository.findOneBy({ email });
                if (existingEmail) {
                    return { status: false, code: 400, message: "Email already exists" };
                }
                const existingPhone = yield userRepository.findOneBy({ phoneNumber });
                if (existingPhone) {
                    return {
                        status: false,
                        code: 400,
                        message: "Phone number already exists",
                    };
                }
                const hashedPassword = yield (0, passwordHelper_1.hashPassword)(password);
                /* SAVE USER FIRST */
                const user = userRepository.create({ name, phoneNumber });
                yield userRepository.save(user);
                /* THEN SAVE AUTH */
                const auth = authRepository.create({
                    email,
                    password: hashedPassword,
                    role: enums_1.USER_ROLE.USER,
                    verified: false,
                    user,
                });
                yield authRepository.save(auth);
                /* OTP */
                const otp = (0, otpGeneration_1.generateOtp)();
                const hashedOtp = yield (0, passwordHelper_1.hashPassword)(otp);
                const userOtp = otpRepository.create({
                    otp: hashedOtp,
                    expiresAt: (0, otpGeneration_1.otpExpiry)(),
                    user,
                });
                yield otpRepository.save(userOtp);
                (0, sendmail_1.default)([email], "Account Verification OTP", generateOtpEmailHTML({ firstname: name, otp }));
                console.log("OTP (dev):", otp);
                return {
                    status: true,
                    code: 201,
                    message: "OTP sent. Please verify your account",
                };
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
    /* ===================== VERIFY OTP ===================== */
    verifyOtp(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const auth = yield authRepository.findOne({
                    where: { email },
                    relations: ["user"],
                });
                if (!auth || !auth.user) {
                    return { status: false, code: 404, message: "User not found" };
                }
                if (auth.verified) {
                    return { status: false, code: 400, message: "Already verified" };
                }
                const otpRecord = yield otpRepository.findOne({
                    where: { user: { id: auth.user.id } },
                    relations: ["user"],
                });
                if (!otpRecord || otpRecord.expiresAt < new Date()) {
                    return { status: false, code: 400, message: "OTP invalid or expired" };
                }
                const isValid = yield (0, passwordHelper_1.comparePassword)(otp, otpRecord.otp);
                if (!isValid) {
                    return { status: false, code: 400, message: "Invalid OTP" };
                }
                auth.verified = true;
                yield authRepository.save(auth);
                yield otpRepository.remove(otpRecord);
                return { status: true, code: 200, message: "Account verified" };
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
    /* ===================== FORGOT PASSWORD ===================== */
    forgotPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                if (!email) {
                    return { status: false, code: 400, message: "Email is required" };
                }
                const auth = yield authRepository.findOne({
                    where: { email },
                    relations: ["user"],
                });
                if (!auth || !auth.user) {
                    return { status: false, code: 404, message: "User not found" };
                }
                const otp = (0, otpGeneration_1.generateOtp)();
                const hashedOtp = yield (0, passwordHelper_1.hashPassword)(otp);
                // remove old OTPs
                yield otpRepository.delete({ user: { id: auth.user.id } });
                const userOtp = otpRepository.create({
                    otp: hashedOtp,
                    expiresAt: (0, otpGeneration_1.otpExpiry)(),
                    user: auth.user,
                });
                yield otpRepository.save(userOtp);
                (0, sendmail_1.default)([email], "Password Reset OTP", generateOtpEmailHTML({
                    firstname: auth.user.name || "User",
                    otp,
                }));
                console.log("RESET OTP (dev):", otp);
                return { status: true, code: 200, message: "OTP sent to email" };
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
    /* ===================== RESET PASSWORD ===================== */
    resetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp, newPassword } = req.body;
                if (!email || !otp || !newPassword) {
                    return { status: false, code: 400, message: "All fields required" };
                }
                const auth = yield authRepository.findOne({
                    where: { email },
                    relations: ["user"],
                });
                if (!auth || !auth.user) {
                    return { status: false, code: 404, message: "User not found" };
                }
                const otpRecord = yield otpRepository.findOne({
                    where: { user: { id: auth.user.id } },
                    relations: ["user"],
                });
                if (!otpRecord || otpRecord.expiresAt < new Date()) {
                    return { status: false, code: 400, message: "OTP expired or invalid" };
                }
                const isValidOtp = yield (0, passwordHelper_1.comparePassword)(otp, otpRecord.otp);
                if (!isValidOtp) {
                    return { status: false, code: 400, message: "Invalid OTP" };
                }
                auth.password = yield (0, passwordHelper_1.hashPassword)(newPassword);
                yield authRepository.save(auth);
                yield otpRepository.remove(otpRecord);
                return {
                    status: true,
                    code: 200,
                    message: "Password reset successfully",
                };
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
    /* ===================== ME ===================== */
    me(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    return { status: false, code: 401, message: "Unauthorized" };
                }
                const userDetails = yield userRepository.findOne({
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
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
    /* ===================== AUTHORIZE ===================== */
    authorize(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    return { status: false, code: 401, message: "Unauthorized" };
                }
                const userDetails = yield userRepository.findOne({
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
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
    registerStore(req) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, phoneNumber, password, panNumber, companyRegistrationDoc, } = req.body;
                if (!name ||
                    !email ||
                    !phoneNumber ||
                    !password ||
                    !panNumber ||
                    !companyRegistrationDoc) {
                    return { status: false, code: 400, message: "All fields are required" };
                }
                const existingEmail = yield authRepository.findOneBy({ email });
                if (existingEmail) {
                    return { status: false, code: 400, message: "Email already exists" };
                }
                const existingPhone = yield userRepository.findOneBy({ phoneNumber });
                if (existingPhone) {
                    return {
                        status: false,
                        code: 400,
                        message: "Phone number already exists",
                    };
                }
                const hashedPassword = yield (0, passwordHelper_1.hashPassword)(password);
                /* SAVE STORE USER */
                const storeUser = userRepository.create({
                    name,
                    phoneNumber,
                    panNumber,
                    companyRegistrationDoc,
                    paymentStatus: true, // assuming stores are paid
                });
                yield userRepository.save(storeUser);
                /* SAVE AUTH */
                const storeAuth = authRepository.create({
                    email,
                    password: hashedPassword,
                    role: enums_1.USER_ROLE.STORE,
                    verified: true, // can also keep false if you want OTP verification
                    user: storeUser,
                });
                yield authRepository.save(storeAuth);
                return {
                    status: true,
                    code: 201,
                    message: "Store registered successfully",
                };
            }
            catch (error) {
                console.error(error);
                return { status: false, code: 500, message: "Internal Server Error" };
            }
        });
    },
};
/* ===================== REGISTER STORE ===================== */
exports.default = authService;
/* ===================== HELPER ===================== */
function generateOtpEmailHTML({ firstname, otp, }) {
    return `
    <h3>Hello ${firstname}</h3>
    <p>Your OTP is <b>${otp}</b></p>
    <p>This OTP will expire in 5 minutes.</p>
  `;
}
