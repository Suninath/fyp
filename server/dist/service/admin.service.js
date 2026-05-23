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
const typeorm_1 = require("typeorm");
const db_config_1 = __importDefault(require("../config/db.config"));
const user_entity_1 = require("../entities/user.entity");
const auth_entity_1 = require("../entities/auth.entity");
const vehicle_entity_1 = require("../entities/vehicle.entity");
const document_entity_1 = require("../entities/document.entity");
const booking_entity_1 = require("../entities/booking.entity");
const payment_entity_1 = require("../entities/payment.entity");
const buy_sell_entity_1 = require("../entities/buy_sell.entity");
const vehicle_view_entity_1 = require("../entities/vehicle_view.entity");
const enums_1 = require("../constant/enums");
const notification_service_1 = require("./notification.service");
const notification_entity_1 = require("../entities/notification.entity");
const userRepository = db_config_1.default.getRepository(user_entity_1.UserEntity);
const authRepository = db_config_1.default.getRepository(auth_entity_1.AuthEntity);
const vehicleRepository = db_config_1.default.getRepository(vehicle_entity_1.VehicleEntity);
const documentRepository = db_config_1.default.getRepository(document_entity_1.DocumentEntity);
const bookingRepository = db_config_1.default.getRepository(booking_entity_1.BookingEntity);
const paymentRepository = db_config_1.default.getRepository(payment_entity_1.PaymentEntity);
const buySellRepository = db_config_1.default.getRepository(buy_sell_entity_1.BuySellEntity);
const vehicleViewRepository = db_config_1.default.getRepository(vehicle_view_entity_1.VehicleViewEntity);
const notificationRepository = db_config_1.default.getRepository(notification_entity_1.NotificationEntity);
const getVehicleInterestInsights = (...args_1) => __awaiter(void 0, [...args_1], void 0, function* (limit = 10, insightsDays) {
    const hasDateFilter = Number.isInteger(insightsDays) && insightsDays > 0;
    const sinceDate = hasDateFilter
        ? new Date(Date.now() - insightsDays * 24 * 60 * 60 * 1000)
        : null;
    const vehicleViewsWhere = {};
    if (sinceDate) {
        vehicleViewsWhere.lastViewedAt = (0, typeorm_1.MoreThanOrEqual)(sinceDate);
    }
    const vehicleViews = yield vehicleViewRepository.find({
        where: vehicleViewsWhere,
        relations: ["vehicle", "viewer", "viewer.auth"],
    });
    const interestPairs = yield notificationRepository
        .createQueryBuilder("notification")
        .select("(notification.data->>'vehicleId')::int", "vehicleId")
        .addSelect("(notification.data->>'interestedUserId')::int", "interestedUserId")
        .where("notification.type = :type", { type: notification_entity_1.NOTIFICATION_TYPE.SYSTEM })
        .andWhere("notification.title = :title", { title: "New Vehicle Interest" })
        .andWhere("notification.data ? 'vehicleId'")
        .andWhere("notification.data ? 'interestedUserId'")
        .andWhere(sinceDate ? "notification.createdAt >= :sinceDate" : "1=1", {
        sinceDate,
    })
        .distinct(true)
        .getRawMany();
    const interestedUserIdsByVehicle = new Map();
    interestPairs.forEach((pair) => {
        var _a;
        const vehicleId = Number(pair.vehicleId);
        const interestedUserId = Number(pair.interestedUserId);
        if (!Number.isInteger(vehicleId) || vehicleId <= 0)
            return;
        if (!Number.isInteger(interestedUserId) || interestedUserId <= 0)
            return;
        if (!interestedUserIdsByVehicle.has(vehicleId)) {
            interestedUserIdsByVehicle.set(vehicleId, new Set());
        }
        (_a = interestedUserIdsByVehicle.get(vehicleId)) === null || _a === void 0 ? void 0 : _a.add(interestedUserId);
    });
    const viewersByVehicle = new Map();
    vehicleViews.forEach((vehicleView) => {
        var _a, _b, _c, _d;
        const vehicleId = ((_a = vehicleView.vehicle) === null || _a === void 0 ? void 0 : _a.id) || vehicleView.vehicleId;
        const viewerId = ((_b = vehicleView.viewer) === null || _b === void 0 ? void 0 : _b.id) || vehicleView.viewerId;
        const viewer = vehicleView.viewer;
        if (!vehicleId || !viewerId || !viewer)
            return;
        const resolvedViewerId = viewer.id;
        if (resolvedViewerId == null)
            return;
        const viewerName = viewer.name || "Unknown";
        const viewerAuthEmail = ((_c = viewer.auth) === null || _c === void 0 ? void 0 : _c.email) || null;
        if (!viewersByVehicle.has(vehicleId)) {
            viewersByVehicle.set(vehicleId, new Map());
        }
        (_d = viewersByVehicle.get(vehicleId)) === null || _d === void 0 ? void 0 : _d.set(viewerId, {
            id: resolvedViewerId,
            name: viewerName,
            email: viewerAuthEmail,
            viewCount: Number(vehicleView.viewCount || 0),
        });
    });
    const vehicleIds = Array.from(new Set([
        ...Array.from(interestedUserIdsByVehicle.keys()),
        ...Array.from(viewersByVehicle.keys()),
    ]));
    if (!vehicleIds.length) {
        return {
            totalVehicleViews: 0,
            vehiclesWithViews: 0,
            totalVehicleInterests: 0,
            vehiclesWithInterest: 0,
            vehicleInterestInsights: [],
        };
    }
    const vehicles = yield vehicleRepository.find({
        where: { id: (0, typeorm_1.In)(vehicleIds) },
        select: ["id", "name", "make", "model", "year"],
    });
    const interestedUserIds = Array.from(new Set(Array.from(interestedUserIdsByVehicle.values()).flatMap((userSet) => Array.from(userSet))));
    const interestedUsers = interestedUserIds.length
        ? yield userRepository.find({
            where: { id: (0, typeorm_1.In)(interestedUserIds) },
            relations: ["auth"],
        })
        : [];
    const interestedUserById = new Map(interestedUsers.map((user) => {
        var _a;
        return [
            user.id,
            {
                id: user.id,
                name: user.name,
                email: ((_a = user.auth) === null || _a === void 0 ? void 0 : _a.email) || null,
            },
        ];
    }));
    const completedBookingsWhere = {
        status: booking_entity_1.BOOKING_STATUS.COMPLETED,
        vehicle: { id: (0, typeorm_1.In)(vehicleIds) },
    };
    if (sinceDate) {
        completedBookingsWhere.createdAt = (0, typeorm_1.MoreThanOrEqual)(sinceDate);
    }
    const completedBookings = yield bookingRepository.find({
        where: completedBookingsWhere,
        relations: ["vehicle", "user", "user.auth"],
    });
    const buySellWhere = {
        vehicle: { id: (0, typeorm_1.In)(vehicleIds) },
    };
    if (sinceDate) {
        buySellWhere.createdAt = (0, typeorm_1.MoreThanOrEqual)(sinceDate);
    }
    const buySellTransactions = yield buySellRepository.find({
        where: buySellWhere,
        relations: ["vehicle", "buyer", "buyer.auth"],
    });
    const buyersByVehicle = new Map();
    completedBookings.forEach((booking) => {
        var _a, _b, _c, _d;
        const vehicleId = (_a = booking.vehicle) === null || _a === void 0 ? void 0 : _a.id;
        const buyerId = (_b = booking.user) === null || _b === void 0 ? void 0 : _b.id;
        if (!vehicleId || !buyerId || !booking.user)
            return;
        const resolvedBookingUserId = booking.user.id;
        if (resolvedBookingUserId == null)
            return;
        const buyerName = booking.user.name || "Unknown";
        const buyerEmail = ((_c = booking.user.auth) === null || _c === void 0 ? void 0 : _c.email) || null;
        if (!buyersByVehicle.has(vehicleId)) {
            buyersByVehicle.set(vehicleId, new Map());
        }
        (_d = buyersByVehicle.get(vehicleId)) === null || _d === void 0 ? void 0 : _d.set(buyerId, {
            id: resolvedBookingUserId,
            name: buyerName,
            email: buyerEmail,
        });
    });
    buySellTransactions.forEach((transaction) => {
        var _a, _b, _c, _d;
        const vehicleId = ((_a = transaction.vehicle) === null || _a === void 0 ? void 0 : _a.id) || transaction.vehicleId;
        const buyerId = ((_b = transaction.buyer) === null || _b === void 0 ? void 0 : _b.id) || transaction.buyerId;
        if (!vehicleId || !buyerId || !transaction.buyer)
            return;
        const resolvedTransactionBuyerId = transaction.buyer.id;
        if (resolvedTransactionBuyerId == null)
            return;
        const buyerName = transaction.buyer.name || "Unknown";
        const buyerEmail = ((_c = transaction.buyer.auth) === null || _c === void 0 ? void 0 : _c.email) || null;
        if (!buyersByVehicle.has(vehicleId)) {
            buyersByVehicle.set(vehicleId, new Map());
        }
        (_d = buyersByVehicle.get(vehicleId)) === null || _d === void 0 ? void 0 : _d.set(buyerId, {
            id: resolvedTransactionBuyerId,
            name: buyerName,
            email: buyerEmail,
        });
    });
    const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));
    const vehicleInterestInsights = vehicleIds
        .map((vehicleId) => {
        var _a, _b;
        const vehicle = vehicleById.get(vehicleId);
        if (!vehicle)
            return null;
        const interestedIds = Array.from(interestedUserIdsByVehicle.get(vehicleId) || []);
        const interestedUsersList = interestedIds
            .map((id) => interestedUserById.get(id))
            .filter(Boolean);
        const buyersList = Array.from(((_a = buyersByVehicle.get(vehicleId)) === null || _a === void 0 ? void 0 : _a.values()) || []);
        const viewersList = Array.from(((_b = viewersByVehicle.get(vehicleId)) === null || _b === void 0 ? void 0 : _b.values()) || []);
        const totalViews = viewersList.reduce((sum, viewer) => sum + Number(viewer.viewCount || 0), 0);
        return {
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            totalViews,
            viewedUsersCount: viewersList.length,
            viewedUsers: viewersList,
            interestedUsersCount: interestedIds.length,
            interestedUsers: interestedUsersList,
            buyersCount: buyersList.length,
            buyers: buyersList,
        };
    })
        .filter(Boolean)
        .sort((a, b) => {
        if (b.interestedUsersCount !== a.interestedUsersCount) {
            return b.interestedUsersCount - a.interestedUsersCount;
        }
        return (b.totalViews || 0) - (a.totalViews || 0);
    })
        .slice(0, limit);
    const totalVehicleInterests = Array.from(interestedUserIdsByVehicle.values()).reduce((sum, set) => sum + set.size, 0);
    const totalVehicleViews = vehicleViews.reduce((sum, vehicleView) => sum + Number(vehicleView.viewCount || 0), 0);
    const vehiclesWithViews = viewersByVehicle.size;
    return {
        totalVehicleViews,
        vehiclesWithViews,
        totalVehicleInterests,
        vehiclesWithInterest: interestedUserIdsByVehicle.size,
        vehicleInterestInsights,
    };
});
const safeNotify = (callback) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield callback();
    }
    catch (error) {
        console.error("Notification dispatch failed:", error);
    }
});
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
                        verified: user.auth.emailVerified,
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
                yield safeNotify(() => notification_service_1.notificationService.createNotification({
                    recipientId: user.id,
                    recipientRole: enums_1.USER_ROLE.USER,
                    type: notification_entity_1.NOTIFICATION_TYPE.ACCOUNT_STATUS_CHANGED,
                    title: "Account blocked",
                    message: "Your account has been blocked by an administrator.",
                    data: {
                        userId: user.id,
                        route: "/profile",
                    },
                }));
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
                yield safeNotify(() => notification_service_1.notificationService.createNotification({
                    recipientId: user.id,
                    recipientRole: enums_1.USER_ROLE.USER,
                    type: notification_entity_1.NOTIFICATION_TYPE.ACCOUNT_STATUS_CHANGED,
                    title: "Account unblocked",
                    message: "Your account has been unblocked. You can continue using AutoGear.",
                    data: {
                        userId: user.id,
                        route: "/profile",
                    },
                }));
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
    getDashboardStats() {
        return __awaiter(this, arguments, void 0, function* ({ insightsDays } = {}) {
            try {
                const normalizedInsightsDays = Number.isInteger(insightsDays) && Number(insightsDays) > 0
                    ? Number(insightsDays)
                    : undefined;
                const vehicleInterestStats = yield getVehicleInterestInsights(10, normalizedInsightsDays);
                const totalUsers = yield userRepository.count({
                    where: {
                        auth: {
                            role: enums_1.USER_ROLE.USER
                        }
                    }
                });
                // User verification stats
                const verifiedUsers = yield authRepository.count({
                    where: {
                        role: enums_1.USER_ROLE.USER,
                        accountVerified: true
                    }
                });
                const pendingVerificationUsers = yield authRepository.count({
                    where: {
                        role: enums_1.USER_ROLE.USER,
                        accountVerified: false,
                        verificationRejected: false
                    }
                });
                const rejectedVerificationUsers = yield authRepository.count({
                    where: {
                        role: enums_1.USER_ROLE.USER,
                        verificationRejected: true
                    }
                });
                // Document stats
                const pendingDocuments = yield documentRepository
                    .createQueryBuilder("document")
                    .innerJoin("document.user", "user")
                    .innerJoin("user.auth", "auth")
                    .where("document.verificationStatus = :status", {
                    status: document_entity_1.VERIFICATION_STATUS.PENDING,
                })
                    .getCount();
                const approvedDocuments = yield documentRepository
                    .createQueryBuilder("document")
                    .innerJoin("document.user", "user")
                    .innerJoin("user.auth", "auth")
                    .where("document.verificationStatus = :status", {
                    status: document_entity_1.VERIFICATION_STATUS.APPROVED,
                })
                    .getCount();
                const rejectedDocuments = yield documentRepository
                    .createQueryBuilder("document")
                    .innerJoin("document.user", "user")
                    .innerJoin("user.auth", "auth")
                    .where("document.verificationStatus = :status", {
                    status: document_entity_1.VERIFICATION_STATUS.REJECTED,
                })
                    .getCount();
                const totalVehicles = yield vehicleRepository.count();
                // Booking stats
                const totalBookings = yield bookingRepository.count();
                const pendingBookings = yield bookingRepository.count({
                    where: {
                        status: booking_entity_1.BOOKING_STATUS.PENDING
                    }
                });
                const confirmedBookings = yield bookingRepository.count({
                    where: {
                        status: booking_entity_1.BOOKING_STATUS.CONFIRMED
                    }
                });
                const cancelledBookings = yield bookingRepository.count({
                    where: {
                        status: booking_entity_1.BOOKING_STATUS.CANCELLED
                    }
                });
                const completedBookings = yield bookingRepository.count({
                    where: {
                        status: booking_entity_1.BOOKING_STATUS.COMPLETED
                    }
                });
                // Payment amount stats for dashboard cards
                const successfulPayments = yield paymentRepository.find({
                    where: { status: payment_entity_1.PAYMENT_STATUS.SUCCESS },
                    select: ["amount"],
                });
                const pendingPayments = yield paymentRepository.find({
                    where: { status: payment_entity_1.PAYMENT_STATUS.PENDING },
                    select: ["amount"],
                });
                const totalRevenue = successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
                const pendingPaymentAmount = pendingPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
                return {
                    status: true,
                    code: 200,
                    data: {
                        totalUsers,
                        verifiedUsers,
                        pendingVerificationUsers,
                        rejectedVerificationUsers,
                        pendingDocuments,
                        approvedDocuments,
                        rejectedDocuments,
                        totalVehicles,
                        totalBookings,
                        pendingBookings,
                        confirmedBookings,
                        cancelledBookings,
                        completedBookings,
                        totalRevenue,
                        pendingPaymentAmount,
                        totalVehicleViews: vehicleInterestStats.totalVehicleViews,
                        vehiclesWithViews: vehicleInterestStats.vehiclesWithViews,
                        totalVehicleInterests: vehicleInterestStats.totalVehicleInterests,
                        vehiclesWithInterest: vehicleInterestStats.vehiclesWithInterest,
                        vehicleInterestInsights: vehicleInterestStats.vehicleInterestInsights,
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
                const parsedVehicleId = parseInt(vehicleId, 10);
                if (!Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
                    return {
                        status: false,
                        code: 400,
                        message: "Invalid vehicle id"
                    };
                }
                const vehicle = yield vehicleRepository.findOne({
                    where: { id: parsedVehicleId }
                });
                if (!vehicle) {
                    return {
                        status: false,
                        code: 404,
                        message: "Vehicle not found"
                    };
                }
                const bookingCount = yield bookingRepository.count({
                    where: { vehicle: { id: parsedVehicleId } },
                });
                if (bookingCount > 0) {
                    return {
                        status: false,
                        code: 409,
                        message: "Cannot delete vehicle because it has related bookings. Cancel or remove those bookings first.",
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
                // Clean dependent records first in case DB constraints/migrations differ across environments.
                yield documentRepository.delete({ userId: user.id });
                // Remove auth first when available (legacy/orphan rows might already miss auth).
                if (user.auth) {
                    yield authRepository.remove(user.auth);
                }
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
    },
    // Get users pending verification (with their documents)
    getPendingVerificationUsers() {
        return __awaiter(this, arguments, void 0, function* ({ page = 1, limit = 10 } = {}) {
            try {
                const queryBuilder = userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.auth", "auth")
                    .leftJoinAndSelect("user.documents", "documents")
                    .where("auth.role = :role", { role: enums_1.USER_ROLE.USER })
                    .andWhere("auth.accountVerified = :verified", { verified: false });
                // Get total count for pagination
                const total = yield queryBuilder.getCount();
                // Apply pagination
                const users = yield queryBuilder
                    .skip((page - 1) * limit)
                    .take(limit)
                    .orderBy("user.createdAt", "DESC")
                    .getMany();
                return {
                    status: true,
                    code: 200,
                    data: users.map(user => {
                        var _a;
                        return ({
                            id: user.id,
                            name: user.name,
                            email: user.auth.email,
                            phoneNumber: user.phoneNumber,
                            accountVerified: user.auth.accountVerified,
                            verificationRejected: user.auth.verificationRejected,
                            rejectionReason: user.auth.rejectionReason,
                            createdAt: user.createdAt,
                            documents: ((_a = user.documents) === null || _a === void 0 ? void 0 : _a.map(doc => ({
                                id: doc.id,
                                documentType: doc.documentType,
                                documentUrl: doc.documentUrl,
                                verificationStatus: doc.verificationStatus,
                                rejectionReason: doc.rejectionReason
                            }))) || []
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
    // Get users by verification status
    getUsersByVerificationStatus(_a) {
        return __awaiter(this, arguments, void 0, function* ({ status, search, page = 1, limit = 10 }) {
            try {
                const queryBuilder = userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.auth", "auth")
                    .leftJoinAndSelect("user.documents", "documents")
                    .where("auth.role = :role", { role: enums_1.USER_ROLE.USER });
                // Apply verification status filter
                switch (status) {
                    case 'verified':
                        queryBuilder.andWhere("auth.accountVerified = :verified", { verified: true });
                        break;
                    case 'pending':
                        queryBuilder.andWhere("auth.accountVerified = :verified", { verified: false })
                            .andWhere("auth.verificationRejected = :rejected", { rejected: false });
                        break;
                    case 'rejected':
                        queryBuilder.andWhere("auth.verificationRejected = :rejected", { rejected: true });
                        break;
                }
                // Apply search filter
                if (search) {
                    queryBuilder.andWhere("(user.name ILIKE :search OR auth.email ILIKE :search OR user.phoneNumber ILIKE :search)", { search: `%${search}%` });
                }
                // Get total count for pagination
                const total = yield queryBuilder.getCount();
                // Apply pagination
                const users = yield queryBuilder
                    .skip((page - 1) * limit)
                    .take(limit)
                    .orderBy("user.createdAt", "DESC")
                    .getMany();
                return {
                    status: true,
                    code: 200,
                    data: users.map(user => {
                        var _a;
                        return ({
                            id: user.id,
                            name: user.name,
                            email: user.auth.email,
                            phoneNumber: user.phoneNumber,
                            accountVerified: user.auth.accountVerified,
                            verificationRejected: user.auth.verificationRejected,
                            rejectionReason: user.auth.rejectionReason,
                            createdAt: user.createdAt,
                            documents: ((_a = user.documents) === null || _a === void 0 ? void 0 : _a.map(doc => ({
                                id: doc.id,
                                documentType: doc.documentType,
                                documentUrl: doc.documentUrl,
                                verificationStatus: doc.verificationStatus,
                                rejectionReason: doc.rejectionReason
                            }))) || []
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
    // Manually verify user account
    verifyUserAccount(userId, approved, rejectionReason) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield userRepository.findOne({
                    where: { id: parseInt(userId) },
                    relations: ["auth", "documents"]
                });
                if (!user) {
                    return {
                        status: false,
                        code: 404,
                        message: "User not found"
                    };
                }
                if (!user.auth) {
                    return {
                        status: false,
                        code: 404,
                        message: "User auth record not found"
                    };
                }
                if (approved) {
                    user.auth.accountVerified = true;
                    user.auth.verificationRejected = false;
                    user.auth.rejectionReason = null;
                    // Also approve any pending documents when account is verified
                    if (user.documents && user.documents.length > 0) {
                        const pendingDocs = user.documents.filter(doc => doc.verificationStatus === document_entity_1.VERIFICATION_STATUS.PENDING);
                        for (const doc of pendingDocs) {
                            doc.verificationStatus = document_entity_1.VERIFICATION_STATUS.APPROVED;
                            doc.verifiedAt = new Date();
                            yield documentRepository.save(doc);
                        }
                        console.log(`✅ Approved ${pendingDocs.length} pending documents for user ${userId}`);
                    }
                }
                else {
                    user.auth.accountVerified = false;
                    user.auth.verificationRejected = true;
                    user.auth.rejectionReason = rejectionReason || "Verification rejected by admin";
                    // Also reject any pending documents when account is rejected
                    if (user.documents && user.documents.length > 0) {
                        const pendingDocs = user.documents.filter(doc => doc.verificationStatus === document_entity_1.VERIFICATION_STATUS.PENDING);
                        for (const doc of pendingDocs) {
                            doc.verificationStatus = document_entity_1.VERIFICATION_STATUS.REJECTED;
                            doc.rejectionReason = rejectionReason || "Account verification rejected";
                            doc.verifiedAt = new Date();
                            yield documentRepository.save(doc);
                        }
                        console.log(`❌ Rejected ${pendingDocs.length} pending documents for user ${userId}`);
                    }
                }
                yield authRepository.save(user.auth);
                console.log(`✅ User ${userId} verification updated: accountVerified=${user.auth.accountVerified}`);
                yield safeNotify(() => notification_service_1.notificationService.createNotification({
                    recipientId: user.id,
                    recipientRole: enums_1.USER_ROLE.USER,
                    type: notification_entity_1.NOTIFICATION_TYPE.ACCOUNT_STATUS_CHANGED,
                    title: approved ? "Account verified" : "Account verification rejected",
                    message: approved
                        ? "Your account has been verified successfully."
                        : `Your account verification was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ""}`,
                    data: {
                        userId: user.id,
                        accountVerified: approved,
                        route: "/profile",
                    },
                }));
                return {
                    status: true,
                    code: 200,
                    message: approved ? "User verified successfully" : "User verification rejected",
                    data: {
                        id: user.id,
                        name: user.name,
                        accountVerified: user.auth.accountVerified,
                        verificationRejected: user.auth.verificationRejected
                    }
                };
            }
            catch (error) {
                console.error("Error in verifyUserAccount:", error);
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
