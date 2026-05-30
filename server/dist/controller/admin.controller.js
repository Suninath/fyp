"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const admin_service_1 = __importDefault(require("../service/admin.service"));
const adminController = {
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, page = 1, limit = 10 } = req.query;
            const result = yield admin_service_1.default.getAllUsers({ search: search, page: Number(page), limit: Number(limit) });
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Users retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination,
            });
        });
    },
    blockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const result = yield admin_service_1.default.blockUser(userId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    unblockUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const result = yield admin_service_1.default.unblockUser(userId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            // Prevent stale dashboard stats in browsers/proxies.
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            const insightsDaysParam = Number((_a = req.query) === null || _a === void 0 ? void 0 : _a.insightsDays);
            const insightsDays = Number.isInteger(insightsDaysParam) && insightsDaysParam > 0
                ? insightsDaysParam
                : undefined;
            const result = yield admin_service_1.default.getDashboardStats({ insightsDays });
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Dashboard stats retrieved successfully",
                httpCode: result.code,
                data: result.data,
            });
        });
    },
    getAllVehicles(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, brand, color, page = 1, limit = 10 } = req.query;
            const result = yield admin_service_1.default.getAllVehicles({
                search: search,
                brand: brand,
                color: color,
                page: Number(page),
                limit: Number(limit)
            });
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Vehicles retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination,
            });
        });
    },
    blockVehicle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { vehicleId } = req.params;
            const result = yield admin_service_1.default.blockVehicle(vehicleId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    unblockVehicle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { vehicleId } = req.params;
            const result = yield admin_service_1.default.unblockVehicle(vehicleId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    deleteVehicle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { vehicleId } = req.params;
            const result = yield admin_service_1.default.deleteVehicle(vehicleId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const updateData = req.body;
            const result = yield admin_service_1.default.updateUser(userId, updateData);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
                data: result.data,
            });
        });
    },
    deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const result = yield admin_service_1.default.deleteUser(userId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    getPendingVerificationUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10 } = req.query;
            const result = yield admin_service_1.default.getPendingVerificationUsers({
                page: Number(page),
                limit: Number(limit)
            });
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Pending verification users retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination,
            });
        });
    },
    verifyUserAccount(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId } = req.params;
            const { approved, rejectionReason } = req.body;
            const result = yield admin_service_1.default.verifyUserAccount(userId, approved, rejectionReason);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
                data: result.data,
            });
        });
    },
    getUsersByVerificationStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { status, search, page = 1, limit = 10 } = req.query;
            const result = yield admin_service_1.default.getUsersByVerificationStatus({
                status: status,
                search: search,
                page: Number(page),
                limit: Number(limit)
            });
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Users retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination,
            });
        });
    },
    getAllBookings(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, status } = req.query;
            const { bookingService } = yield Promise.resolve().then(() => __importStar(require("../service/booking.service")));
            const result = yield bookingService.getAllBookings(Number(page), Number(limit), status);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Bookings retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination ? {
                    currentPage: result.pagination.currentPage,
                    perpage: result.pagination.perPage,
                    totalPages: result.pagination.totalPages,
                    count: result.pagination.total,
                } : undefined,
            });
        });
    },
    updateBookingStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookingId } = req.params;
            const { status, adminRemarks } = req.body;
            const { bookingService } = yield Promise.resolve().then(() => __importStar(require("../service/booking.service")));
            const result = yield bookingService.updateBookingStatus(Number(bookingId), status, adminRemarks);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
                data: result.data,
            });
        });
    },
    getBookingStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bookingService } = yield Promise.resolve().then(() => __importStar(require("../service/booking.service")));
            const result = yield bookingService.getBookingStats();
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Booking stats retrieved successfully",
                httpCode: result.code,
                data: result.data,
            });
        });
    },
    getAllPayments(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, status, method } = req.query;
            const { bookingService } = yield Promise.resolve().then(() => __importStar(require("../service/booking.service")));
            const result = yield bookingService.getAllPayments(Number(page), Number(limit), status, method);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Payments retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination ? {
                    currentPage: result.pagination.currentPage,
                    perpage: result.pagination.perPage,
                    totalPages: result.pagination.totalPages,
                    count: result.pagination.total,
                } : undefined,
            });
        });
    },
    getPaymentStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Prevent stale payment stats cards in browser/proxy caches.
            res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
            res.setHeader("Pragma", "no-cache");
            res.setHeader("Expires", "0");
            const { bookingService } = yield Promise.resolve().then(() => __importStar(require("../service/booking.service")));
            const result = yield bookingService.getPaymentStats();
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Payment stats retrieved successfully",
                httpCode: result.code,
                data: result.data,
            });
        });
    },
    getRefundRequests(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { page = 1, limit = 10, status } = req.query;
            const { bookingService } = yield Promise.resolve().then(() => __importStar(require("../service/booking.service")));
            const result = yield bookingService.getRefundRequests(Number(page), Number(limit), status);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Refund requests retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination ? {
                    currentPage: result.pagination.currentPage,
                    perpage: result.pagination.perPage,
                    totalPages: result.pagination.totalPages,
                    count: result.pagination.total,
                } : undefined,
            });
        });
    },
    reviewRefundRequest(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const { action, adminNotes } = req.body;
            const adminId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const { bookingService } = yield Promise.resolve().then(() => __importStar(require("../service/booking.service")));
            const result = yield bookingService.reviewRefundRequest(Number(id), action, Number(adminId), adminNotes);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
                data: result.data,
            });
        });
    }
};
exports.default = adminController;
