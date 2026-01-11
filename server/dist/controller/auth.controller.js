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
const responseHandler_1 = require("../utils/responseHandler");
const auth_service_1 = __importDefault(require("../service/auth.service"));
const authController = {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.login(req, res);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
                data: result === null || result === void 0 ? void 0 : result.data,
            });
        });
    },
    register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.register(req);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
            });
        });
    },
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.verifyOtp(req);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
            });
        });
    },
    forgetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.forgotPassword(req);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
            });
        });
    },
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.resetPassword(req);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
            });
        });
    },
    registerStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.registerStore(req);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
            });
        });
    },
    authorize(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.authorize(req);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
                data: result === null || result === void 0 ? void 0 : result.data,
            });
        });
    },
    me(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield auth_service_1.default.me(req);
            (0, responseHandler_1.sendResponse)(res, {
                status: result === null || result === void 0 ? void 0 : result.status,
                message: result === null || result === void 0 ? void 0 : result.message,
                httpCode: result === null || result === void 0 ? void 0 : result.code,
                data: result === null || result === void 0 ? void 0 : result.data,
            });
        });
    },
};
exports.default = authController;
