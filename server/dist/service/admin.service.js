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
const user_entity_1 = require("../entities/user.entity");
const auth_entity_1 = require("../entities/auth.entity");
const vehicle_entity_1 = require("../entities/vehicle.entity");
const enums_1 = require("../constant/enums");
const userRepository = db_config_1.default.getRepository(user_entity_1.UserEntity);
const authRepository = db_config_1.default.getRepository(auth_entity_1.AuthEntity);
const vehicleRepository = db_config_1.default.getRepository(vehicle_entity_1.VehicleEntity);
const adminService = {
    getAllUsers() {
        return __awaiter(this, arguments, void 0, function* ({ search, page = 1, limit = 10 } = {}) {
            try {
                const queryBuilder = userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.auth", "auth")
                    .where("auth.role = :role", { role: enums_1.USER_ROLE.USER });
                // Apply search filter
                if (search) {
                    queryBuilder.andWhere("(user.name ILIKE :search OR auth.email ILIKE :search)", { search: `%${search}%` });
                }
                // Get total count for pagination
                const total = yield queryBuilder.getCount();
                // Apply pagination
                const users = yield queryBuilder
                    .skip((page - 1) * limit)
                    .take(limit)
                    .getMany();
                return {
                    status: true,
                    code: 200,
                    data: users.map(user => ({
                        id: user.id,
                        name: user.name,
                        email: user.auth.email,
                        phoneNumber: user.phoneNumber,
                        role: user.auth.role,
                        verified: user.auth.verified,
                        isBlocked: user.auth.isBlocked,
                        createdAt: user.createdAt
                    })),
                    pagination: {
                        currentPage: page,
                        perpage: limit,
                        totalPages: Math.ceil(total / limit),
                        count: total
                    }
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    getAllStores() {
        return __awaiter(this, arguments, void 0, function* ({ search, page = 1, limit = 10 } = {}) {
            try {
                const queryBuilder = userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.auth", "auth")
                    .where("auth.role = :role", { role: enums_1.USER_ROLE.STORE });
                // Apply search filter
                if (search) {
                    queryBuilder.andWhere("(user.name ILIKE :search OR auth.email ILIKE :search)", { search: `%${search}%` });
                }
                // Get total count for pagination
                const total = yield queryBuilder.getCount();
                // Apply pagination
                const stores = yield queryBuilder
                    .skip((page - 1) * limit)
                    .take(limit)
                    .getMany();
                return {
                    status: true,
                    code: 200,
                    data: stores.map(store => ({
                        id: store.id,
                        storeName: store.name,
                        ownerName: store.name, // For now, using name as both store and owner name since we don't have separate fields
                        email: store.auth.email,
                        phoneNumber: store.phoneNumber,
                        role: store.auth.role,
                        verified: store.auth.verified,
                        panNumber: store.panNumber,
                        companyRegistrationDoc: store.companyRegistrationDoc,
                        paymentStatus: store.paymentStatus,
                        isVerified: store.auth.verified,
                        isBlocked: store.auth.isBlocked,
                        createdAt: store.createdAt
                    })),
                    pagination: {
                        currentPage: page,
                        perpage: limit,
                        totalPages: Math.ceil(total / limit),
                        count: total
                    }
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    verifyStore(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const store = yield userRepository.findOne({
                    where: { id: parseInt(storeId) },
                    relations: ["auth"]
                });
                if (!store) {
                    return {
                        status: false,
                        code: 404,
                        message: "Store not found"
                    };
                }
                if (store.auth.role !== enums_1.USER_ROLE.STORE) {
                    return {
                        status: false,
                        code: 400,
                        message: "User is not a store"
                    };
                }
                store.auth.verified = true;
                yield authRepository.save(store.auth);
                return {
                    status: true,
                    code: 200,
                    message: "Store verified successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    blockUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository.findOne({
                    where: { id: parseInt(userId) },
                    relations: ["auth"]
                });
                if (!user) {
                    return {
                        status: false,
                        code: 404,
                        message: "User not found"
                    };
                }
                // Block the user by setting isBlocked to true
                user.auth.isBlocked = true;
                yield authRepository.save(user.auth);
                return {
                    status: true,
                    code: 200,
                    message: "User blocked successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    unblockUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository.findOne({
                    where: { id: parseInt(userId) },
                    relations: ["auth"]
                });
                if (!user) {
                    return {
                        status: false,
                        code: 404,
                        message: "User not found"
                    };
                }
                user.auth.isBlocked = false;
                yield authRepository.save(user.auth);
                return {
                    status: true,
                    code: 200,
                    message: "User unblocked successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    blockStore(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const store = yield userRepository.findOne({
                    where: { id: parseInt(storeId) },
                    relations: ["auth"]
                });
                if (!store) {
                    return {
                        status: false,
                        code: 404,
                        message: "Store not found"
                    };
                }
                if (store.auth.role !== enums_1.USER_ROLE.STORE) {
                    return {
                        status: false,
                        code: 400,
                        message: "User is not a store"
                    };
                }
                store.auth.isBlocked = true;
                yield authRepository.save(store.auth);
                return {
                    status: true,
                    code: 200,
                    message: "Store blocked successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    unblockStore(storeId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const store = yield userRepository.findOne({
                    where: { id: parseInt(storeId) },
                    relations: ["auth"]
                });
                if (!store) {
                    return {
                        status: false,
                        code: 404,
                        message: "Store not found"
                    };
                }
                if (store.auth.role !== enums_1.USER_ROLE.STORE) {
                    return {
                        status: false,
                        code: 400,
                        message: "User is not a store"
                    };
                }
                store.auth.isBlocked = false;
                yield authRepository.save(store.auth);
                return {
                    status: true,
                    code: 200,
                    message: "Store unblocked successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    getDashboardStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalUsers = yield userRepository.count({
                    where: {
                        auth: {
                            role: enums_1.USER_ROLE.USER
                        }
                    }
                });
                const totalStores = yield userRepository.count({
                    where: {
                        auth: {
                            role: enums_1.USER_ROLE.STORE
                        }
                    }
                });
                const totalVehicles = yield vehicleRepository.count();
                // For revenue, we'd need to implement actual transaction tracking
                const totalRevenue = 0; // Placeholder
                return {
                    status: true,
                    code: 200,
                    data: {
                        totalUsers,
                        totalStores,
                        totalVehicles,
                        totalRevenue
                    }
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    getAllVehicles(_a) {
        return __awaiter(this, arguments, void 0, function* ({ search, brand, color, page = 1, limit = 10 }) {
            try {
                const queryBuilder = vehicleRepository.createQueryBuilder("vehicle")
                    .leftJoinAndSelect("vehicle.uploader", "uploader")
                    .leftJoin("uploader.auth", "uploaderAuth")
                    .addSelect(["uploaderAuth.email"]);
                // Apply filters
                if (search) {
                    queryBuilder.andWhere("(vehicle.name ILIKE :search OR vehicle.make ILIKE :search OR vehicle.model ILIKE :search)", { search: `%${search}%` });
                }
                if (brand) {
                    queryBuilder.andWhere("vehicle.make ILIKE :brand", { brand: `%${brand}%` });
                }
                if (color) {
                    queryBuilder.andWhere("vehicle.color ILIKE :color", { color: `%${color}%` });
                }
                // Get total count for pagination
                const total = yield queryBuilder.getCount();
                // Apply pagination
                const vehicles = yield queryBuilder
                    .skip((page - 1) * limit)
                    .take(limit)
                    .getMany();
                return {
                    status: true,
                    code: 200,
                    data: vehicles.map(vehicle => {
                        var _a;
                        return ({
                            id: vehicle.id,
                            name: vehicle.name,
                            make: vehicle.make,
                            model: vehicle.model,
                            year: vehicle.year,
                            price: vehicle.price,
                            mileage: vehicle.mileage,
                            fuelType: vehicle.fuelType,
                            transmission: vehicle.transmission,
                            color: vehicle.color,
                            location: vehicle.location,
                            condition: vehicle.condition,
                            description: vehicle.description,
                            images: vehicle.images,
                            category: vehicle.category,
                            isBlocked: vehicle.isBlocked,
                            createdAt: vehicle.createdAt,
                            uploader: vehicle.uploader ? {
                                id: vehicle.uploader.id,
                                name: vehicle.uploader.name,
                                email: (_a = vehicle.uploader.auth) === null || _a === void 0 ? void 0 : _a.email
                            } : null
                        });
                    }),
                    pagination: {
                        currentPage: page,
                        perpage: limit,
                        totalPages: Math.ceil(total / limit),
                        count: total
                    }
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    blockVehicle(vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vehicle = yield vehicleRepository.findOne({
                    where: { id: parseInt(vehicleId) }
                });
                if (!vehicle) {
                    return {
                        status: false,
                        code: 404,
                        message: "Vehicle not found"
                    };
                }
                vehicle.isBlocked = true;
                yield vehicleRepository.save(vehicle);
                return {
                    status: true,
                    code: 200,
                    message: "Vehicle blocked successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    unblockVehicle(vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vehicle = yield vehicleRepository.findOne({
                    where: { id: parseInt(vehicleId) }
                });
                if (!vehicle) {
                    return {
                        status: false,
                        code: 404,
                        message: "Vehicle not found"
                    };
                }
                vehicle.isBlocked = false;
                yield vehicleRepository.save(vehicle);
                return {
                    status: true,
                    code: 200,
                    message: "Vehicle unblocked successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    deleteVehicle(vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const vehicle = yield vehicleRepository.findOne({
                    where: { id: parseInt(vehicleId) }
                });
                if (!vehicle) {
                    return {
                        status: false,
                        code: 404,
                        message: "Vehicle not found"
                    };
                }
                yield vehicleRepository.remove(vehicle);
                return {
                    status: true,
                    code: 200,
                    message: "Vehicle deleted successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    updateUser(userId, updateData) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository.findOne({
                    where: { id: parseInt(userId) },
                    relations: ["auth"]
                });
                if (!user) {
                    return {
                        status: false,
                        code: 404,
                        message: "User not found"
                    };
                }
                // Update user fields
                if (updateData.name)
                    user.name = updateData.name;
                if (updateData.phoneNumber)
                    user.phoneNumber = updateData.phoneNumber;
                if (updateData.email)
                    user.auth.email = updateData.email;
                yield userRepository.save(user);
                yield authRepository.save(user.auth);
                return {
                    status: true,
                    code: 200,
                    message: "User updated successfully",
                    data: {
                        id: user.id,
                        name: user.name,
                        email: user.auth.email,
                        phoneNumber: user.phoneNumber
                    }
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    },
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository.findOne({
                    where: { id: parseInt(userId) },
                    relations: ["auth"]
                });
                if (!user) {
                    return {
                        status: false,
                        code: 404,
                        message: "User not found"
                    };
                }
                // Remove auth first (due to foreign key constraint)
                yield authRepository.remove(user.auth);
                yield userRepository.remove(user);
                return {
                    status: true,
                    code: 200,
                    message: "User deleted successfully"
                };
            }
            catch (error) {
                console.error(error);
                return {
                    status: false,
                    code: 500,
                    message: "Internal Server Error"
                };
            }
        });
    }
};
exports.default = adminService;
