"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.genRefreshToken = exports.genAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
if (!accessTokenSecret || !refreshTokenSecret) {
    throw new Error("Token environment variables not set");
}
const genAccessToken = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, accessTokenSecret, {
        expiresIn: "1h",
    });
    return token;
};
exports.genAccessToken = genAccessToken;
const genRefreshToken = (payload) => {
    const token = jsonwebtoken_1.default.sign(payload, refreshTokenSecret, {
        expiresIn: "7d",
    });
    return token;
};
exports.genRefreshToken = genRefreshToken;
const verifyToken = (token, secret) => {
    if (!secret) {
        throw new Error("SECRET_KEY is not defined in the environment");
    }
    return jsonwebtoken_1.default.verify(token, secret);
};
exports.verifyToken = verifyToken;
