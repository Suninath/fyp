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
const admin_service_1 = __importDefault(require("../service/admin.service"));
const adminController = {
    getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search, page = 1, limit = 10 } = req.query;
            const result = yield admin_service_1.default.getAllUsers({ search, page: Number(page), limit: Number(limit) });
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Users retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination,
            });
        });
    },
    getAllStores(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { search } = req.query;
            const result = yield admin_service_1.default.getAllStores({ search, page: Number(page), limit: Number(limit) });
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message || "Stores retrieved successfully",
                httpCode: result.code,
                data: result.data,
                pagination: result.pagination,
            });
        });
    },
    verifyStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId } = req.params;
            const result = yield admin_service_1.default.verifyStore(storeId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
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
    blockStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId } = req.params;
            const result = yield admin_service_1.default.blockStore(storeId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    unblockStore(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { storeId } = req.params;
            const result = yield admin_service_1.default.unblockStore(storeId);
            (0, responseHandler_1.sendResponse)(res, {
                status: result.status,
                message: result.message,
                httpCode: result.code,
            });
        });
    },
    getDashboardStats(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield admin_service_1.default.getDashboardStats();
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
            const result = yield admin_service_1.default.getAllVehicles({ search, brand, color, page: Number(page), limit: Number(limit) });
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
    }
};
exports.default = adminController;
