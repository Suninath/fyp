"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controller/auth.controller"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/login", auth_controller_1.default.login);
router.post("/register", auth_controller_1.default.register);
router.post("/registerStore", auth_controller_1.default.registerStore);
router.post("/verifyOtp", auth_controller_1.default.verifyOtp);
router.post("/forgetPassword", auth_controller_1.default.forgetPassword);
router.post("/resetPassword", auth_controller_1.default.resetPassword);
// Protected routes
router.get("/authorize", authMiddleware_1.authenticationMiddeware, auth_controller_1.default.authorize);
router.get("/me", authMiddleware_1.authenticationMiddeware, auth_controller_1.default.me);
exports.default = router;
