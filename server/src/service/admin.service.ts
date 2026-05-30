import { In, MoreThanOrEqual } from "typeorm";
import AppDataSource from "../config/db.config";
import { UserEntity } from "../entities/user.entity";
import { AuthEntity } from "../entities/auth.entity";
import { VehicleEntity } from "../entities/vehicle.entity";
import { DocumentEntity, VERIFICATION_STATUS } from "../entities/document.entity";
import { BookingEntity, BOOKING_STATUS } from "../entities/booking.entity";
import { PaymentEntity, PAYMENT_STATUS } from "../entities/payment.entity";
import { BuySellEntity } from "../entities/buy_sell.entity";
import { VehicleViewEntity } from "../entities/vehicle_view.entity";
import { USER_ROLE } from "../constant/enums";
import { notificationService } from "./notification.service";
import { NOTIFICATION_TYPE, NotificationEntity } from "../entities/notification.entity";
import {
  getInvalidPhoneMessage,
  isValidNepaliPhoneNumber,
} from "../utils/phone";

const userRepository = AppDataSource.getRepository(UserEntity);
const authRepository = AppDataSource.getRepository(AuthEntity);
const vehicleRepository = AppDataSource.getRepository(VehicleEntity);
const documentRepository = AppDataSource.getRepository(DocumentEntity);
const bookingRepository = AppDataSource.getRepository(BookingEntity);
const paymentRepository = AppDataSource.getRepository(PaymentEntity);
const buySellRepository = AppDataSource.getRepository(BuySellEntity);
const vehicleViewRepository = AppDataSource.getRepository(VehicleViewEntity);
const notificationRepository = AppDataSource.getRepository(NotificationEntity);

const getVehicleInterestInsights = async (
  limit = 10,
  insightsDays?: number,
) => {
  const hasDateFilter = Number.isInteger(insightsDays) && (insightsDays as number) > 0;
  const sinceDate = hasDateFilter
    ? new Date(Date.now() - (insightsDays as number) * 24 * 60 * 60 * 1000)
    : null;

  const vehicleViewsWhere: any = {};
  if (sinceDate) {
    vehicleViewsWhere.lastViewedAt = MoreThanOrEqual(sinceDate);
  }

  const vehicleViews = await vehicleViewRepository.find({
    where: vehicleViewsWhere,
    relations: ["vehicle", "viewer", "viewer.auth"],
  });

  const interestPairs = await notificationRepository
    .createQueryBuilder("notification")
    .select("(notification.data->>'vehicleId')::int", "vehicleId")
    .addSelect("(notification.data->>'interestedUserId')::int", "interestedUserId")
    .where("notification.type = :type", { type: NOTIFICATION_TYPE.SYSTEM })
    .andWhere("notification.title = :title", { title: "New Vehicle Interest" })
    .andWhere("notification.data ? 'vehicleId'")
    .andWhere("notification.data ? 'interestedUserId'")
    .andWhere(sinceDate ? "notification.createdAt >= :sinceDate" : "1=1", {
      sinceDate,
    })
    .distinct(true)
    .getRawMany<{ vehicleId: string; interestedUserId: string }>();

  const interestedUserIdsByVehicle = new Map<number, Set<number>>();

  interestPairs.forEach((pair) => {
    const vehicleId = Number(pair.vehicleId);
    const interestedUserId = Number(pair.interestedUserId);

    if (!Number.isInteger(vehicleId) || vehicleId <= 0) return;
    if (!Number.isInteger(interestedUserId) || interestedUserId <= 0) return;

    if (!interestedUserIdsByVehicle.has(vehicleId)) {
      interestedUserIdsByVehicle.set(vehicleId, new Set<number>());
    }

    interestedUserIdsByVehicle.get(vehicleId)?.add(interestedUserId);
  });

  const viewersByVehicle = new Map<
    number,
    Map<number, { id: number; name: string; email: string | null; viewCount: number }>
  >();

  vehicleViews.forEach((vehicleView) => {
    const vehicleId = vehicleView.vehicle?.id || vehicleView.vehicleId;
    const viewerId = vehicleView.viewer?.id || vehicleView.viewerId;
    const viewer = vehicleView.viewer;

    if (!vehicleId || !viewerId || !viewer) return;
    const resolvedViewerId = viewer.id;
    if (resolvedViewerId == null) return;

    const viewerName = viewer.name || "Unknown";
    const viewerAuthEmail = viewer.auth?.email || null;

    if (!viewersByVehicle.has(vehicleId)) {
      viewersByVehicle.set(vehicleId, new Map());
    }

    viewersByVehicle.get(vehicleId)?.set(viewerId, {
      id: resolvedViewerId,
      name: viewerName,
      email: viewerAuthEmail,
      viewCount: Number(vehicleView.viewCount || 0),
    });
  });

  const vehicleIds = Array.from(
    new Set<number>([
      ...Array.from(interestedUserIdsByVehicle.keys()),
      ...Array.from(viewersByVehicle.keys()),
    ]),
  );

  if (!vehicleIds.length) {
    return {
      totalVehicleViews: 0,
      vehiclesWithViews: 0,
      totalVehicleInterests: 0,
      vehiclesWithInterest: 0,
      vehicleInterestInsights: [],
    };
  }

  const vehicles = await vehicleRepository.find({
    where: { id: In(vehicleIds) },
    select: ["id", "name", "make", "model", "year"],
  });

  const interestedUserIds = Array.from(
    new Set(
      Array.from(interestedUserIdsByVehicle.values()).flatMap((userSet) =>
        Array.from(userSet),
      ),
    ),
  );

  const interestedUsers = interestedUserIds.length
    ? await userRepository.find({
        where: { id: In(interestedUserIds) },
        relations: ["auth"],
      })
    : [];

  const interestedUserById = new Map(
    interestedUsers.map((user) => [
      user.id,
      {
        id: user.id,
        name: user.name,
        email: user.auth?.email || null,
      },
    ]),
  );

  const completedBookingsWhere: any = {
    status: BOOKING_STATUS.COMPLETED,
    vehicle: { id: In(vehicleIds) },
  };
  if (sinceDate) {
    completedBookingsWhere.createdAt = MoreThanOrEqual(sinceDate);
  }

  const completedBookings = await bookingRepository.find({
    where: completedBookingsWhere,
    relations: ["vehicle", "user", "user.auth"],
  });

  const buySellWhere: any = {
    vehicle: { id: In(vehicleIds) },
  };
  if (sinceDate) {
    buySellWhere.createdAt = MoreThanOrEqual(sinceDate);
  }

  const buySellTransactions = await buySellRepository.find({
    where: buySellWhere,
    relations: ["vehicle", "buyer", "buyer.auth"],
  });

  // Separate renters (from completed bookings) and purchasers (from buy/sell transactions)
  const rentersByVehicle = new Map<
    number,
    Map<number, { id: number; name: string; email: string | null }>
  >();

  const purchasersByVehicle = new Map<
    number,
    Map<number, { id: number; name: string; email: string | null }>
  >();

  completedBookings.forEach((booking) => {
    const vehicleId = booking.vehicle?.id;
    const renterId = booking.user?.id;

    if (!vehicleId || !renterId || !booking.user) return;
    const resolvedBookingUserId = booking.user.id;
    if (resolvedBookingUserId == null) return;

    const renterName = booking.user.name || "Unknown";
    const renterEmail = booking.user.auth?.email || null;

    if (!rentersByVehicle.has(vehicleId)) {
      rentersByVehicle.set(vehicleId, new Map());
    }

    rentersByVehicle.get(vehicleId)?.set(renterId, {
      id: resolvedBookingUserId,
      name: renterName,
      email: renterEmail,
    });
  });

  buySellTransactions.forEach((transaction) => {
    const vehicleId = transaction.vehicle?.id || transaction.vehicleId;
    const purchaserId = transaction.buyer?.id || transaction.buyerId;

    if (!vehicleId || !purchaserId || !transaction.buyer) return;
    const resolvedTransactionBuyerId = transaction.buyer.id;
    if (resolvedTransactionBuyerId == null) return;

    const purchaserName = transaction.buyer.name || "Unknown";
    const purchaserEmail = transaction.buyer.auth?.email || null;

    if (!purchasersByVehicle.has(vehicleId)) {
      purchasersByVehicle.set(vehicleId, new Map());
    }

    purchasersByVehicle.get(vehicleId)?.set(purchaserId, {
      id: resolvedTransactionBuyerId,
      name: purchaserName,
      email: purchaserEmail,
    });
  });

  const vehicleById = new Map(vehicles.map((vehicle) => [vehicle.id, vehicle]));

  const vehicleInterestInsights = vehicleIds
    .map((vehicleId) => {
      const vehicle = vehicleById.get(vehicleId);
      if (!vehicle) return null;

      const interestedIds = Array.from(
        interestedUserIdsByVehicle.get(vehicleId) || [],
      );

      const interestedUsersList = interestedIds
        .map((id) => interestedUserById.get(id))
        .filter(Boolean);

      const rentersList = Array.from(
        rentersByVehicle.get(vehicleId)?.values() || [],
      );

      const purchasersList = Array.from(
        purchasersByVehicle.get(vehicleId)?.values() || [],
      );

      const viewersList = Array.from(
        viewersByVehicle.get(vehicleId)?.values() || [],
      );

      const totalViews = viewersList.reduce(
        (sum, viewer) => sum + Number(viewer.viewCount || 0),
        0,
      );

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
        rentalsCount: rentersList.length,
        renters: rentersList,
        purchasesCount: purchasersList.length,
        purchasers: purchasersList,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (b.interestedUsersCount !== a.interestedUsersCount) {
        return b.interestedUsersCount - a.interestedUsersCount;
      }

      return (b.totalViews || 0) - (a.totalViews || 0);
    })
    .slice(0, limit);

  const totalVehicleInterests = Array.from(interestedUserIdsByVehicle.values()).reduce(
    (sum, set) => sum + set.size,
    0,
  );

  const totalVehicleViews = vehicleViews.reduce(
    (sum, vehicleView) => sum + Number(vehicleView.viewCount || 0),
    0,
  );

  const vehiclesWithViews = viewersByVehicle.size;

  const totalRentals = Array.from(rentersByVehicle.values()).reduce(
    (sum, m) => sum + (m?.size || 0),
    0,
  );

  const totalPurchases = Array.from(purchasersByVehicle.values()).reduce(
    (sum, m) => sum + (m?.size || 0),
    0,
  );

  return {
    totalVehicleViews,
    vehiclesWithViews,
    totalVehicleInterests,
    vehiclesWithInterest: interestedUserIdsByVehicle.size,
    totalRentals,
    totalPurchases,
    vehicleInterestInsights,
  };
};

const safeNotify = async (callback: () => Promise<unknown>) => {
  try {
    await callback();
  } catch (error) {
    console.error("Notification dispatch failed:", error);
  }
};

const adminService = {
  async getAllUsers({ search, page = 1, limit = 10 }: { search?: string; page?: number; limit?: number } = {}) {
    try {
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.auth", "auth")
        .where("auth.role = :role", { role: USER_ROLE.USER });

      // Apply search filter
      if (search) {
        queryBuilder.andWhere("(user.name ILIKE :search OR auth.email ILIKE :search)", 
          { search: `%${search}%` });
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const users = await queryBuilder
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
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async blockUser(userId: string) {
    try {
      const user = await userRepository.findOne({
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
      await authRepository.save(user.auth);

      await safeNotify(() =>
        notificationService.createNotification({
          recipientId: user.id as number,
          recipientRole: USER_ROLE.USER,
          type: NOTIFICATION_TYPE.ACCOUNT_STATUS_CHANGED,
          title: "Account blocked",
          message: "Your account has been blocked by an administrator.",
          data: {
            userId: user.id,
            route: "/profile",
          },
        })
      );

      return {
        status: true,
        code: 200,
        message: "User blocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async unblockUser(userId: string) {
    try {
      const user = await userRepository.findOne({
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
      await authRepository.save(user.auth);

      await safeNotify(() =>
        notificationService.createNotification({
          recipientId: user.id as number,
          recipientRole: USER_ROLE.USER,
          type: NOTIFICATION_TYPE.ACCOUNT_STATUS_CHANGED,
          title: "Account unblocked",
          message: "Your account has been unblocked. You can continue using AutoGear.",
          data: {
            userId: user.id,
            route: "/profile",
          },
        })
      );

      return {
        status: true,
        code: 200,
        message: "User unblocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async getDashboardStats({ insightsDays }: { insightsDays?: number } = {}) {
    try {
      const normalizedInsightsDays =
        Number.isInteger(insightsDays) && Number(insightsDays) > 0
          ? Number(insightsDays)
          : undefined;

      const vehicleInterestStats = await getVehicleInterestInsights(
        10,
        normalizedInsightsDays,
      );

      const totalUsers = await userRepository.count({
        where: {
          auth: {
            role: USER_ROLE.USER
          }
        }
      });

      // User verification stats
      const verifiedUsers = await authRepository.count({
        where: {
          role: USER_ROLE.USER,
          accountVerified: true
        }
      });

      const pendingVerificationUsers = await authRepository.count({
        where: {
          role: USER_ROLE.USER,
          accountVerified: false,
          verificationRejected: false
        }
      });

      const rejectedVerificationUsers = await authRepository.count({
        where: {
          role: USER_ROLE.USER,
          verificationRejected: true
        }
      });

      // Document stats
      const pendingDocuments = await documentRepository
        .createQueryBuilder("document")
        .innerJoin("document.user", "user")
        .innerJoin("user.auth", "auth")
        .where("document.verificationStatus = :status", {
          status: VERIFICATION_STATUS.PENDING,
        })
        .getCount();

      const approvedDocuments = await documentRepository
        .createQueryBuilder("document")
        .innerJoin("document.user", "user")
        .innerJoin("user.auth", "auth")
        .where("document.verificationStatus = :status", {
          status: VERIFICATION_STATUS.APPROVED,
        })
        .getCount();

      const rejectedDocuments = await documentRepository
        .createQueryBuilder("document")
        .innerJoin("document.user", "user")
        .innerJoin("user.auth", "auth")
        .where("document.verificationStatus = :status", {
          status: VERIFICATION_STATUS.REJECTED,
        })
        .getCount();

      const totalVehicles = await vehicleRepository.count();

      // Booking stats
      const totalBookings = await bookingRepository.count();
      
      const pendingBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.PENDING
        }
      });

      const confirmedBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.CONFIRMED
        }
      });

      const cancelledBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.CANCELLED
        }
      });

      const completedBookings = await bookingRepository.count({
        where: {
          status: BOOKING_STATUS.COMPLETED
        }
      });

      // Payment amount stats for dashboard cards
      // Use explicit aggregates that only count exact statuses.
      const successfulRow = await paymentRepository
        .createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.amount), 0)", "total")
        .where("payment.status = :status", { status: PAYMENT_STATUS.SUCCESS })
        .getRawOne<{ total: string }>();

      const pendingRow = await paymentRepository
        .createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.amount), 0)", "total")
        .where("payment.status = :status", { status: PAYMENT_STATUS.PENDING })
        .getRawOne<{ total: string }>();

      const cancelledRow = await paymentRepository
        .createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.amount), 0)", "total")
        .where("payment.status = :status", { status: PAYMENT_STATUS.CANCELLED })
        .getRawOne<{ total: string }>();

      const failedRow = await paymentRepository
        .createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.amount), 0)", "total")
        .where("payment.status = :status", { status: PAYMENT_STATUS.FAILED })
        .getRawOne<{ total: string }>();

      // Some refunds are recorded in refundAmount; sum those too.
      const refundedRow = await paymentRepository
        .createQueryBuilder("payment")
        .select("COALESCE(SUM(payment.refundAmount), 0)", "total")
        .where("payment.refundAmount IS NOT NULL")
        .getRawOne<{ total: string }>();

      const totalRevenue = Number((successfulRow && successfulRow.total) || 0);
      const pendingPaymentAmount = Number((pendingRow && pendingRow.total) || 0);
      const cancelledAmount = Number((cancelledRow && cancelledRow.total) || 0);
      const failedAmount = Number((failedRow && failedRow.total) || 0);
      const refundedAmount = Number((refundedRow && refundedRow.total) || 0);

      if (process.env.DEBUG_DASHBOARD_STATS === "true") {
        console.log("[Dashboard Stats Debug]", {
          successfulRevenue: totalRevenue,
          pendingRevenue: pendingPaymentAmount,
          failedAmount,
          cancelledAmount,
          refundedAmount,
        });
      }

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
          successfulRevenue: totalRevenue,
          pendingPaymentAmount,
          pendingRevenue: pendingPaymentAmount,
          cancelledAmount,
          failedAmount,
          refundedAmount,
          totalVehicleViews: vehicleInterestStats.totalVehicleViews,
          vehiclesWithViews: vehicleInterestStats.vehiclesWithViews,
          totalVehicleInterests: vehicleInterestStats.totalVehicleInterests,
          vehiclesWithInterest: vehicleInterestStats.vehiclesWithInterest,
          vehicleInterestInsights: vehicleInterestStats.vehicleInterestInsights,
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async getAllVehicles({ search, brand, color, page = 1, limit = 10 }: { search?: string; brand?: string; color?: string; page?: number; limit?: number }) {
    try {
      const queryBuilder = vehicleRepository.createQueryBuilder("vehicle")
        .leftJoinAndSelect("vehicle.uploader", "uploader")
        .leftJoin("uploader.auth", "uploaderAuth")
        .addSelect(["uploaderAuth.email"]);

      // Apply filters
      if (search) {
        queryBuilder.andWhere("(vehicle.name ILIKE :search OR vehicle.make ILIKE :search OR vehicle.model ILIKE :search)", 
          { search: `%${search}%` });
      }
      if (brand) {
        queryBuilder.andWhere("vehicle.make ILIKE :brand", { brand: `%${brand}%` });
      }
      if (color) {
        queryBuilder.andWhere("vehicle.color ILIKE :color", { color: `%${color}%` });
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const vehicles = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();

      return {
        status: true,
        code: 200,
        data: vehicles.map(vehicle => ({
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
            email: (vehicle.uploader as any).auth?.email
          } : null
        })),
        pagination: {
          currentPage: page,
          perpage: limit,
          totalPages: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async blockVehicle(vehicleId: string) {
    try {
      const vehicle = await vehicleRepository.findOne({
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
      await vehicleRepository.save(vehicle);

      return {
        status: true,
        code: 200,
        message: "Vehicle blocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async unblockVehicle(vehicleId: string) {
    try {
      const vehicle = await vehicleRepository.findOne({
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
      await vehicleRepository.save(vehicle);

      return {
        status: true,
        code: 200,
        message: "Vehicle unblocked successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async deleteVehicle(vehicleId: string) {
    try {
      const parsedVehicleId = parseInt(vehicleId, 10);

      if (!Number.isInteger(parsedVehicleId) || parsedVehicleId <= 0) {
        return {
          status: false,
          code: 400,
          message: "Invalid vehicle id"
        };
      }

      const vehicle = await vehicleRepository.findOne({
        where: { id: parsedVehicleId }
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found"
        };
      }

      const bookingCount = await bookingRepository.count({
        where: { vehicle: { id: parsedVehicleId } },
      });

      if (bookingCount > 0) {
        return {
          status: false,
          code: 409,
          message: "Cannot delete vehicle because it has related bookings. Cancel or remove those bookings first.",
        };
      }

      await vehicleRepository.remove(vehicle);

      return {
        status: true,
        code: 200,
        message: "Vehicle deleted successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async updateUser(userId: string, updateData: any) {
    try {
      const user = await userRepository.findOne({
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
      if (updateData.name) user.name = updateData.name;
      if (updateData.phoneNumber) {
        const normalizedPhone = String(updateData.phoneNumber).trim();
        if (!isValidNepaliPhoneNumber(normalizedPhone)) {
          return {
            status: false,
            code: 400,
            errorCode: "INVALID_PHONE",
            message: getInvalidPhoneMessage(),
          };
        }

        const existingPhone = await userRepository.findOne({
          where: { phoneNumber: normalizedPhone },
        });
        if (existingPhone && existingPhone.id !== user.id) {
          return {
            status: false,
            code: 400,
            message: "Phone number already in use",
          };
        }

        user.phoneNumber = normalizedPhone;
      }
      if (updateData.email) user.auth.email = updateData.email;

      await userRepository.save(user);
      await authRepository.save(user.auth);

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
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  async deleteUser(userId: string) {
    try {
      const user = await userRepository.findOne({
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
      await documentRepository.delete({ userId: user.id });

      // Remove auth first when available (legacy/orphan rows might already miss auth).
      if (user.auth) {
        await authRepository.remove(user.auth);
      }
      await userRepository.remove(user);

      return {
        status: true,
        code: 200,
        message: "User deleted successfully"
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  // Get users pending verification (with their documents)
  async getPendingVerificationUsers({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) {
    try {
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.auth", "auth")
        .leftJoinAndSelect("user.documents", "documents")
        .where("auth.role = :role", { role: USER_ROLE.USER })
        .andWhere("auth.accountVerified = :verified", { verified: false });

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("user.createdAt", "DESC")
        .getMany();

      return {
        status: true,
        code: 200,
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.auth.email,
          phoneNumber: user.phoneNumber,
          accountVerified: user.auth.accountVerified,
          verificationRejected: user.auth.verificationRejected,
          rejectionReason: user.auth.rejectionReason,
          createdAt: user.createdAt,
          documents: user.documents?.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            documentUrl: doc.documentUrl,
            verificationStatus: doc.verificationStatus,
            rejectionReason: doc.rejectionReason
          })) || []
        })),
        pagination: {
          currentPage: page,
          perpage: limit,
          totalPages: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  // Get users by verification status
  async getUsersByVerificationStatus({ 
    status, 
    search, 
    page = 1, 
    limit = 10 
  }: { 
    status: 'pending' | 'verified' | 'rejected'; 
    search?: string; 
    page?: number; 
    limit?: number 
  }) {
    try {
      const queryBuilder = userRepository.createQueryBuilder("user")
        .leftJoinAndSelect("user.auth", "auth")
        .leftJoinAndSelect("user.documents", "documents")
        .where("auth.role = :role", { role: USER_ROLE.USER });

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
        queryBuilder.andWhere(
          "(user.name ILIKE :search OR auth.email ILIKE :search OR user.phoneNumber ILIKE :search)",
          { search: `%${search}%` }
        );
      }

      // Get total count for pagination
      const total = await queryBuilder.getCount();

      // Apply pagination
      const users = await queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy("user.createdAt", "DESC")
        .getMany();

      return {
        status: true,
        code: 200,
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.auth.email,
          phoneNumber: user.phoneNumber,
          accountVerified: user.auth.accountVerified,
          verificationRejected: user.auth.verificationRejected,
          rejectionReason: user.auth.rejectionReason,
          createdAt: user.createdAt,
          documents: user.documents?.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            documentUrl: doc.documentUrl,
            verificationStatus: doc.verificationStatus,
            rejectionReason: doc.rejectionReason
          })) || []
        })),
        pagination: {
          currentPage: page,
          perpage: limit,
          totalPages: Math.ceil(total / limit),
          count: total
        }
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  },

  // Manually verify user account
  async verifyUserAccount(userId: string, approved: boolean, rejectionReason?: string) {
    try {
      const user = await userRepository.findOne({
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
        user.auth.rejectionReason = null as any;

        // Also approve any pending documents when account is verified
        if (user.documents && user.documents.length > 0) {
          const pendingDocs = user.documents.filter(
            doc => doc.verificationStatus === VERIFICATION_STATUS.PENDING
          );
          for (const doc of pendingDocs) {
            doc.verificationStatus = VERIFICATION_STATUS.APPROVED;
            doc.verifiedAt = new Date();
            await documentRepository.save(doc);
          }
          console.log(`✅ Approved ${pendingDocs.length} pending documents for user ${userId}`);
        }
      } else {
        user.auth.accountVerified = false;
        user.auth.verificationRejected = true;
        user.auth.rejectionReason = rejectionReason || "Verification rejected by admin";

        // Also reject any pending documents when account is rejected
        if (user.documents && user.documents.length > 0) {
          const pendingDocs = user.documents.filter(
            doc => doc.verificationStatus === VERIFICATION_STATUS.PENDING
          );
          for (const doc of pendingDocs) {
            doc.verificationStatus = VERIFICATION_STATUS.REJECTED;
            doc.rejectionReason = rejectionReason || "Account verification rejected";
            doc.verifiedAt = new Date();
            await documentRepository.save(doc);
          }
          console.log(`❌ Rejected ${pendingDocs.length} pending documents for user ${userId}`);
        }
      }

      await authRepository.save(user.auth);
      console.log(`✅ User ${userId} verification updated: accountVerified=${user.auth.accountVerified}`);

      await safeNotify(() =>
        notificationService.createNotification({
          recipientId: user.id as number,
          recipientRole: USER_ROLE.USER,
          type: NOTIFICATION_TYPE.ACCOUNT_STATUS_CHANGED,
          title: approved ? "Account verified" : "Account verification rejected",
          message: approved
            ? "Your account has been verified successfully."
            : `Your account verification was rejected.${
                rejectionReason ? ` Reason: ${rejectionReason}` : ""
              }`,
          data: {
            userId: user.id,
            accountVerified: approved,
            route: "/profile",
          },
        })
      );

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
    } catch (error) {
      console.error("Error in verifyUserAccount:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error"
      };
    }
  }
};

export default adminService;