"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpExpiry = exports.generateOtp = void 0;
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
};
exports.generateOtp = generateOtp;
const otpExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000);
};
exports.otpExpiry = otpExpiry;
