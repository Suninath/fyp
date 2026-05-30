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
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuthenticationMiddeware = exports.authorizationMiddleware = exports.authenticationMiddeware = void 0;
const tokenGen_1 = require("../utils/tokenGen");
const extractAccessToken = (req) => {
    var _a;
    let accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
    if (!accessToken) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7);
        }
    }
    return accessToken;
};
const authenticationMiddeware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    // Get token from cookies or Authorization header
    let accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
    let refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refresh_token;
    let isHeaderAuth = false;
    // If not in cookies, check Authorization header
    if (!accessToken) {
        const authHeader = req.headers.authorization;
        console.log("🔍 Authorization header:", authHeader ? "Present" : "Missing");
        if (authHeader && authHeader.startsWith("Bearer ")) {
            accessToken = authHeader.substring(7); // Remove "Bearer " prefix
            isHeaderAuth = true; // Using header-based auth (stateless)
            console.log("✅ Token extracted from Authorization header");
        }
    }
    else {
        console.log("✅ Token found in cookies");
    }
    if (!accessToken) {
        console.log("❌ No token found in cookies or Authorization header");
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Only require refresh token for cookie-based auth, not header-based
    if (!isHeaderAuth && !refreshToken) {
        console.log("❌ No refresh token found (cookie-based auth)");
        return res
            .status(401)
            .json({ message: "Session expired please login again" });
    }
    try {
        const decoded = (0, tokenGen_1.verifyToken)(accessToken, process.env.ACCESS_TOKEN_SECRET);
        console.log("✅ Token verified successfully for user:", decoded.email);
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error("❌ Token verification failed:", error instanceof Error ? error.message : error);
        // If using header-based auth, don't try to refresh
        if (isHeaderAuth) {
            return res.status(401).json({ message: "Invalid token" });
        }
        // Try to refresh token only if we have a refresh token (cookie-based auth)
        if (!refreshToken) {
            return res.status(401).json({ message: "Invalid token" });
        }
        try {
            const decodedRefresh = (0, tokenGen_1.verifyToken)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const newAccessToken = (0, tokenGen_1.genAccessToken)(decodedRefresh);
            const isProd = process.env.NODE_ENV === "production";
            res.cookie("access_token", newAccessToken, {
                httpOnly: true,
                secure: isProd,
                sameSite: "lax",
            });
            req.user = decodedRefresh;
            console.log("✅ Token refreshed successfully");
            next();
        }
        catch (refreshError) {
            console.error("❌ Refresh token failed:", refreshError instanceof Error ? refreshError.message : refreshError);
            return res.status(401).json({ message: "Invalid token" });
        }
    }
});
exports.authenticationMiddeware = authenticationMiddeware;
const authorizationMiddleware = (roles) => {
    return (req, res, next) => {
        var _a;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        if (!userRole || !roles.includes(userRole)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    };
};
exports.authorizationMiddleware = authorizationMiddleware;
const optionalAuthenticationMiddeware = (req, _res, next) => {
    const accessToken = extractAccessToken(req);
    if (!accessToken) {
        return next();
    }
    try {
        const decoded = (0, tokenGen_1.verifyToken)(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
    }
    catch (_a) {
        // Ignore invalid token for optional auth routes.
    }
    return next();
};
exports.optionalAuthenticationMiddeware = optionalAuthenticationMiddeware;
