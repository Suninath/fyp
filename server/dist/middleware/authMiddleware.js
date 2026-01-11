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
exports.authorizationMiddleware = exports.authenticationMiddeware = void 0;
const tokenGen_1 = require("../utils/tokenGen");
const authenticationMiddeware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
    const refreshToken = (_b = req.cookies) === null || _b === void 0 ? void 0 : _b.refresh_token;
    if (!accessToken) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    if (!refreshToken) {
        return res
            .status(401)
            .json({ message: "Session expired please login again" });
    }
    try {
        const decoded = (0, tokenGen_1.verifyToken)(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        // Try to refresh token
        try {
            const decodedRefresh = (0, tokenGen_1.verifyToken)(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const newAccessToken = (0, tokenGen_1.genAccessToken)(decodedRefresh);
            res.cookie("access_token", newAccessToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
            });
            req.user = decodedRefresh;
            next();
        }
        catch (refreshError) {
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
