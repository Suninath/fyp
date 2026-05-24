import AppDataSource from "../config/db.config";
import { BookingEntity, BOOKING_STATUS } from "../entities/booking.entity";
import { PaymentEntity, PAYMENT_METHOD, PAYMENT_STATUS } from "../entities/payment.entity";
import { RefundRequestEntity, REFUND_REQUEST_STATUS } from "../entities/refund_request.entity";
import { VehicleEntity } from "../entities/vehicle.entity";
import { UserEntity } from "../entities/user.entity";
import { USER_ROLE } from "../constant/enums";
import { notificationService } from "./notification.service";
import { NOTIFICATION_TYPE } from "../entities/notification.entity";
import axiosInstance from "../utils/axiosInstance";
import { mockPaymentService } from "../utils/mockPaymentService";
import crypto from "crypto";

const bookingRepository = AppDataSource.getRepository(BookingEntity);
const paymentRepository = AppDataSource.getRepository(PaymentEntity);
const refundRequestRepository = AppDataSource.getRepository(RefundRequestEntity);
const vehicleRepository = AppDataSource.getRepository(VehicleEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

const getLatestPaymentStatus = (payments?: PaymentEntity[]) => {
  if (!payments || payments.length === 0) {
    return PAYMENT_STATUS.PENDING;
  }

  const latestPayment = [...payments].sort((left, right) => Number(right.id) - Number(left.id))[0];
  return latestPayment?.status || PAYMENT_STATUS.PENDING;
};

const getLatestRefundRequest = (refundRequests?: RefundRequestEntity[]) => {
  if (!refundRequests || refundRequests.length === 0) return null;
  return [...refundRequests].sort((left, right) => Number(right.id) - Number(left.id))[0] || null;
};

const safeNotify = async (callback: () => Promise<unknown>) => {
  try {
    await callback();
  } catch (error) {
    console.error("Notification dispatch failed:", error);
  }
};

export const bookingService = {
  async createBooking(
    userId: number,
    vehicleId: number,
    startDate: string,
    endDate: string,
    location: string,
    notes?: string
  ) {
    try {
      const user = await userRepository.findOne({ 
        where: { id: userId },
        relations: ["auth"]
      });
      if (!user) {
        return {
          status: false,
          code: 404,
          message: "User not found",
        };
      }

      // Check if user's account is verified
      if (!user.auth?.accountVerified) {
        return {
          status: false,
          code: 403,
          message: "Account verification required. Please submit your verification documents for admin approval before booking vehicles.",
        };
      }

      const vehicle = await vehicleRepository.findOne({
        where: { id: vehicleId },
      });
      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found",
        };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return {
          status: false,
          code: 400,
          message: "End date must be after start date",
        };
      }

      // Check if vehicle is available for the selected dates
      const conflictingBookings = await bookingRepository.find({
        where: {
          vehicle: { id: vehicleId },
          status: BOOKING_STATUS.CONFIRMED,
        },
      });

      const hasConflict = conflictingBookings.some((booking) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        return start < bookingEnd && end > bookingStart;
      });

      if (hasConflict) {
        return {
          status: false,
          code: 409,
          message: "Vehicle is not available for the selected dates. Please choose different dates.",
        };
      }

      const numberOfDays = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const dailyRate = Number(vehicle.price);
      const totalAmount = dailyRate * numberOfDays;
      const discount = 0;
      const finalAmount = totalAmount - discount;

      const booking = bookingRepository.create({
        user,
        vehicle,
        startDate: start,
        endDate: end,
        location,
        dailyRate,
        numberOfDays,
        totalAmount,
        discount,
        finalAmount,
        notes,
        status: BOOKING_STATUS.PENDING,
      });

      const savedBooking = await bookingRepository.save(booking);

      await safeNotify(() =>
        notificationService.createNotification({
          recipientId: userId,
          recipientRole: USER_ROLE.USER,
          type: NOTIFICATION_TYPE.BOOKING_CREATED,
          title: "Booking request submitted",
          message: `Booking #${savedBooking.id} has been created and is waiting for admin confirmation.`,
          data: {
            bookingId: savedBooking.id,
            route: "/bookings",
          },
        })
      );

      await safeNotify(() =>
        notificationService.createForAdmins({
          type: NOTIFICATION_TYPE.BOOKING_CREATED,
          title: "New booking request",
          message: `Booking #${savedBooking.id} was created and needs review.`,
          data: {
            bookingId: savedBooking.id,
            route: "/admin/bookings",
          },
        })
      );

      return {
        status: true,
        code: 201,
        message: "Booking created successfully",
        data: {
          id: savedBooking.id,
          vehicleId: savedBooking.vehicle.id,
          startDate: savedBooking.startDate,
          endDate: savedBooking.endDate,
          location: savedBooking.location,
          numberOfDays: savedBooking.numberOfDays,
          dailyRate: savedBooking.dailyRate,
          totalAmount: savedBooking.totalAmount,
          discount: savedBooking.discount,
          finalAmount: savedBooking.finalAmount,
          status: savedBooking.status,
          adminRemarks: savedBooking.adminRemarks,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async getUserBookings(userId: number, page = 1, limit = 10) {
    try {
      const [bookings, total] = await bookingRepository.findAndCount({
        where: { user: { id: userId } },
        relations: ["vehicle", "payments", "refundRequests"],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" },
      });

      return {
        status: true,
        code: 200,
        data: bookings.map((booking: BookingEntity) => ({
          id: booking.id,
          vehicle: {
            id: booking.vehicle.id,
            name: booking.vehicle.name,
            make: booking.vehicle.make,
            model: booking.vehicle.model,
            year: booking.vehicle.year,
            images: booking.vehicle.images,
            location: booking.vehicle.location,
            color: booking.vehicle.color,
            fuelType: booking.vehicle.fuelType,
            transmission: booking.vehicle.transmission,
            mileage: booking.vehicle.mileage,
            condition: booking.vehicle.condition,
            description: booking.vehicle.description,
            price: booking.vehicle.price,
            category: booking.vehicle.category,
          },
          startDate: booking.startDate,
          endDate: booking.endDate,
          location: booking.location,
          numberOfDays: booking.numberOfDays,
          dailyRate: booking.dailyRate,
          totalAmount: booking.totalAmount,
          discount: booking.discount,
          finalAmount: booking.finalAmount,
          status: booking.status,
          notes: booking.notes,
          adminRemarks: booking.adminRemarks,
          paymentStatus: getLatestPaymentStatus(booking.payments),
          refundRequest: (() => {
            const latestRefund = getLatestRefundRequest(booking.refundRequests);
            return latestRefund
              ? {
                  id: latestRefund.id,
                  status: latestRefund.status,
                  reason: latestRefund.reason,
                  adminNotes: latestRefund.adminNotes,
                  requestedAt: latestRefund.requestedAt,
                  processedAt: latestRefund.processedAt,
                }
              : null;
          })(),
          createdAt: booking.createdAt,
        })),
        pagination: {
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Admin: Get all bookings
  async getAllBookings(page = 1, limit = 10, status?: string) {
    try {
      const whereClause: any = {};
      if (status && status !== 'all') {
        whereClause.status = status;
      }

      const [bookings, total] = await bookingRepository.findAndCount({
        where: whereClause,
        relations: ["vehicle", "user", "user.auth", "payments", "refundRequests"],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" },
      });

      return {
        status: true,
        code: 200,
        data: bookings.map((booking: BookingEntity) => ({
          id: booking.id,
          user: {
            id: booking.user?.id,
            name: booking.user?.name,
            email: booking.user?.auth?.email,
          },
          vehicle: {
            id: booking.vehicle?.id,
            name: booking.vehicle?.name,
            make: booking.vehicle?.make,
            model: booking.vehicle?.model,
            year: booking.vehicle?.year,
            images: booking.vehicle?.images,
          },
          startDate: booking.startDate,
          endDate: booking.endDate,
          location: booking.location,
          numberOfDays: booking.numberOfDays,
          dailyRate: booking.dailyRate,
          totalAmount: booking.totalAmount,
          finalAmount: booking.finalAmount,
          status: booking.status,
          adminRemarks: booking.adminRemarks,
          paymentStatus: getLatestPaymentStatus(booking.payments),
          refundRequest: (() => {
            const latestRefund = getLatestRefundRequest(booking.refundRequests);
            return latestRefund
              ? {
                  id: latestRefund.id,
                  status: latestRefund.status,
                  reason: latestRefund.reason,
                  adminNotes: latestRefund.adminNotes,
                  requestedAt: latestRefund.requestedAt,
                  processedAt: latestRefund.processedAt,
                }
              : null;
          })(),
          createdAt: booking.createdAt,
        })),
        pagination: {
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Admin: Update booking status
  async updateBookingStatus(
    bookingId: number | undefined,
    status: BOOKING_STATUS,
    adminRemarks?: string
  ) {
    try {
      if (!bookingId) {
        return {
          status: false,
          code: 400,
          message: "Invalid booking id",
        };
      }
      const booking = await bookingRepository.findOne({
        where: { id: bookingId },
        relations: ["user", "vehicle"],
      });

      if (!booking) {
        return {
          status: false,
          code: 404,
          message: "Booking not found",
        };
      }

      const normalizedRemarks = adminRemarks?.trim();

      if (status === BOOKING_STATUS.CANCELLED && !normalizedRemarks) {
        return {
          status: false,
          code: 400,
          message: "Cancellation remark is required",
        };
      }

      booking.status = status;
      booking.adminRemarks =
        status === BOOKING_STATUS.CANCELLED ? normalizedRemarks : booking.adminRemarks;
      await bookingRepository.save(booking);

      if (status === BOOKING_STATUS.CANCELLED) {
        const pendingPayments = await paymentRepository.find({
          where: {
            booking: { id: booking.id },
            status: PAYMENT_STATUS.PENDING,
          },
          relations: ["booking"],
        });

        for (const payment of pendingPayments) {
          payment.status = PAYMENT_STATUS.CANCELLED;
          payment.response = JSON.stringify({
            reason: "booking_cancelled",
            cancelledAt: new Date().toISOString(),
          });
          await paymentRepository.save(payment);
        }
      }

      // Update vehicle condition based on booking status
      try {
        if (booking.vehicle && booking.vehicle.id) {
          const vehicle = await vehicleRepository.findOne({ where: { id: booking.vehicle.id } });
          if (vehicle) {
            if (status === BOOKING_STATUS.CONFIRMED) {
              vehicle.condition = "reserved";
              await vehicleRepository.save(vehicle);
            } else if (status === BOOKING_STATUS.CANCELLED || status === BOOKING_STATUS.COMPLETED) {
              // If there are no other confirmed bookings for this vehicle, clear reserved status
              const otherConfirmed = await bookingRepository.count({
                where: { vehicle: { id: vehicle.id }, status: BOOKING_STATUS.CONFIRMED },
              });

              if (otherConfirmed === 0) {
                vehicle.condition = undefined;
                await vehicleRepository.save(vehicle);
              }
            }
          }
        }
      } catch (vehErr) {
        console.error("Vehicle condition update failed:", vehErr);
      }

      if (booking.user?.id) {
        const recipientId = Number(booking.user.id);

        await safeNotify(() =>
          notificationService.createNotification({
            recipientId,
            recipientRole: USER_ROLE.USER,
            type: NOTIFICATION_TYPE.BOOKING_STATUS_UPDATED,
            title: "Booking status updated",
            message:
              status === BOOKING_STATUS.CANCELLED && normalizedRemarks
                ? `Booking #${booking.id} was cancelled. Remark: ${normalizedRemarks}`
                : `Booking #${booking.id} status changed to ${status}.`,
            data: {
              bookingId: booking.id,
              status,
              adminRemarks: booking.adminRemarks,
              route: "/bookings",
            },
          })
        );
      }

      return {
        status: true,
        code: 200,
        message: `Booking status updated to ${status}`,
        data: booking,
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async getBookingById(bookingId: number, userId: number) {
    try {
      const booking = await bookingRepository.findOne({
        where: { id: bookingId, user: { id: userId } },
        relations: ["vehicle", "payments", "refundRequests"],
      });

      if (!booking) {
        return {
          status: false,
          code: 404,
          message: "Booking not found",
        };
      }

      return {
        status: true,
        code: 200,
        data: {
          id: booking.id,
          vehicle: {
            id: booking.vehicle.id,
            name: booking.vehicle.name,
            make: booking.vehicle.make,
            model: booking.vehicle.model,
            year: booking.vehicle.year,
            images: booking.vehicle.images,
            location: booking.vehicle.location,
            description: booking.vehicle.description,
          },
          startDate: booking.startDate,
          endDate: booking.endDate,
          location: booking.location,
          numberOfDays: booking.numberOfDays,
          dailyRate: booking.dailyRate,
          totalAmount: booking.totalAmount,
          discount: booking.discount,
          finalAmount: booking.finalAmount,
          status: booking.status,
          notes: booking.notes,
          adminRemarks: booking.adminRemarks,
          payments: booking.payments?.map((payment: PaymentEntity) => ({
            id: payment.id,
            method: payment.method,
            amount: payment.amount,
            status: payment.status,
            transactionId: payment.transactionId,
            paidAt: payment.paidAt,
          })),
          refundRequest: (() => {
            const latestRefund = getLatestRefundRequest(booking.refundRequests);
            return latestRefund
              ? {
                  id: latestRefund.id,
                  status: latestRefund.status,
                  reason: latestRefund.reason,
                  adminNotes: latestRefund.adminNotes,
                  requestedAt: latestRefund.requestedAt,
                  processedAt: latestRefund.processedAt,
                }
              : null;
          })(),
          createdAt: booking.createdAt,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async cancelBooking(bookingId: number, userId: number) {
    try {
      const booking = await bookingRepository.findOne({
        where: { id: bookingId, user: { id: userId } },
        relations: ["payments", "refundRequests"],
      });

      if (!booking) {
        return {
          status: false,
          code: 404,
          message: "Booking not found",
        };
      }

      if (
        booking.status === BOOKING_STATUS.CANCELLED ||
        booking.status === BOOKING_STATUS.COMPLETED
      ) {
        return {
          status: false,
          code: 400,
          message: "Cannot cancel this booking",
        };
      }

      const hasSuccessfulPayment = booking.payments?.some(
        (payment) => payment.status === PAYMENT_STATUS.SUCCESS
      );

      if (hasSuccessfulPayment) {
        return {
          status: false,
          code: 400,
          message: "This booking has already been paid. Please request a refund instead of cancelling directly.",
        };
      }

      await this.updateBookingStatus(booking.id, BOOKING_STATUS.CANCELLED);

      await safeNotify(() =>
        notificationService.createForAdmins({
          type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
          title: "Booking cancelled by user",
          message: `Booking #${booking.id} was cancelled by user #${userId}.`,
          data: {
            bookingId: booking.id,
            route: "/admin/bookings",
          },
        })
      );

      return {
        status: true,
        code: 200,
        message: "Booking cancelled successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async requestRefund(bookingId: number, userId: number, reason: string) {
    try {
      const booking = await bookingRepository.findOne({
        where: { id: bookingId, user: { id: userId } },
        relations: ["vehicle", "payments", "refundRequests", "user"],
      });

      if (!booking) {
        return { status: false, code: 404, message: "Booking not found" };
      }

      const hasSuccessfulPayment = booking.payments?.some((payment) => payment.status === PAYMENT_STATUS.SUCCESS);
      if (!hasSuccessfulPayment) {
        return { status: false, code: 400, message: "Refund requests are only available for paid bookings." };
      }

      const latestRefund = getLatestRefundRequest(booking.refundRequests);
      if (latestRefund && [REFUND_REQUEST_STATUS.PENDING, REFUND_REQUEST_STATUS.APPROVED].includes(latestRefund.status)) {
        return { status: false, code: 400, message: "A refund request already exists for this booking." };
      }

      const normalizedReason = reason?.trim();
      if (!normalizedReason || normalizedReason.length < 20) {
        return { status: false, code: 400, message: "Please provide a refund reason with at least 20 characters." };
      }

      const refundRequest = refundRequestRepository.create({
        booking: { id: booking.id },
        user: { id: userId },
        reason: normalizedReason,
        status: REFUND_REQUEST_STATUS.PENDING,
        requestedAt: new Date(),
      });

      const savedRefund = await refundRequestRepository.save(refundRequest);

      await safeNotify(() =>
        notificationService.createForAdmins({
          type: NOTIFICATION_TYPE.BOOKING_STATUS_UPDATED,
          title: "Refund request submitted",
          message: `Refund request submitted for booking #${booking.id}.`,
          data: {
            bookingId: booking.id,
            refundRequestId: savedRefund.id,
            route: "/admin/refunds",
          },
        })
      );

      return {
        status: true,
        code: 201,
        message: "Refund request submitted successfully",
        data: {
          id: savedRefund.id,
          bookingId: booking.id,
          status: savedRefund.status,
          reason: savedRefund.reason,
          requestedAt: savedRefund.requestedAt,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  async getRefundRequests(page = 1, limit = 10, status?: string) {
    try {
      const query = refundRequestRepository
        .createQueryBuilder("refundRequest")
        .leftJoinAndSelect("refundRequest.booking", "booking")
        .leftJoinAndSelect("booking.vehicle", "vehicle")
        .leftJoinAndSelect("refundRequest.user", "user")
        .leftJoinAndSelect("user.auth", "auth")
        .orderBy("refundRequest.requestedAt", "DESC")
        .skip((page - 1) * limit)
        .take(limit);

      if (status && status !== "all") {
        query.andWhere("refundRequest.status = :status", { status });
      }

      const [refundRequests, total] = await query.getManyAndCount();

      return {
        status: true,
        code: 200,
        data: refundRequests.map((request) => ({
          id: request.id,
          bookingId: request.booking?.id,
          user: {
            id: request.user?.id,
            name: request.user?.name,
            email: request.user?.auth?.email,
          },
          vehicle: {
            id: request.booking?.vehicle?.id,
            name: request.booking?.vehicle?.name,
            make: request.booking?.vehicle?.make,
            model: request.booking?.vehicle?.model,
          },
          amount: request.booking?.finalAmount,
          reason: request.reason,
          status: request.status,
          adminNotes: request.adminNotes,
          requestedAt: request.requestedAt,
          processedAt: request.processedAt,
        })),
        pagination: {
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  async reviewRefundRequest(refundRequestId: number, action: "Approve" | "Reject" | "Processed", adminUserId: number, adminNotes?: string) {
    try {
      const refundRequest = await refundRequestRepository.findOne({
        where: { id: refundRequestId },
        relations: ["booking", "booking.payments"],
      });

      if (!refundRequest) return { status: false, code: 404, message: "Refund request not found" };

      if (action === "Reject") {
        refundRequest.status = REFUND_REQUEST_STATUS.REJECTED;
        refundRequest.adminNotes = adminNotes?.trim() || undefined;
        refundRequest.processedAt = new Date();
        refundRequest.processedBy = { id: adminUserId } as UserEntity;
        await refundRequestRepository.save(refundRequest);
        return { status: true, code: 200, message: "Refund request rejected" };
      }

      if (action === "Approve") {
        refundRequest.status = REFUND_REQUEST_STATUS.APPROVED;
        refundRequest.adminNotes = adminNotes?.trim() || refundRequest.adminNotes;
        refundRequest.processedAt = new Date();
        refundRequest.processedBy = { id: adminUserId } as UserEntity;

        const booking = refundRequest.booking;
        booking.status = BOOKING_STATUS.CANCELLED;
        await bookingRepository.save(booking);

        await refundRequestRepository.save(refundRequest);

        return { status: true, code: 200, message: "Refund request approved" };
      }

      refundRequest.status = REFUND_REQUEST_STATUS.PROCESSED;
      refundRequest.adminNotes = adminNotes?.trim() || refundRequest.adminNotes;
      refundRequest.processedAt = new Date();
      refundRequest.processedBy = { id: adminUserId } as UserEntity;
      await refundRequestRepository.save(refundRequest);

      for (const payment of refundRequest.booking?.payments || []) {
        if (payment.status === PAYMENT_STATUS.SUCCESS || payment.status === PAYMENT_STATUS.CANCELLED) {
          payment.status = PAYMENT_STATUS.REFUNDED;
          payment.response = JSON.stringify({
            reason: "refund_processed",
            processedAt: new Date().toISOString(),
          });
          await paymentRepository.save(payment);
        }
      }

      return { status: true, code: 200, message: "Refund marked as processed" };
    } catch (error) {
      console.error(error);
      return { status: false, code: 500, message: "Internal Server Error" };
    }
  },

  async getVehicleBookings(vehicleId: number) {
    try {
      const bookings = await bookingRepository.find({
        where: { vehicle: { id: vehicleId }, status: BOOKING_STATUS.CONFIRMED },
        select: ["startDate", "endDate"],
      });

      return {
        status: true,
        code: 200,
        data: bookings.map((b: BookingEntity) => ({
          startDate: b.startDate,
          endDate: b.endDate,
        })),
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async initiatePayment(
    bookingId: number,
    method: PAYMENT_METHOD,
    userId: number
  ) {
    try {
      const booking = await bookingRepository.findOne({
        where: { id: bookingId, user: { id: userId } },
        relations: ["vehicle", "user", "user.auth"],
      });

      if (!booking) {
        console.log(`Booking not found: bookingId=${bookingId}, userId=${userId}`);
        return {
          status: false,
          code: 404,
          message: "Booking not found",
        };
      }

      if (booking.status !== BOOKING_STATUS.PENDING) {
        console.log(`Booking not in pending state: bookingId=${bookingId}, status=${booking.status}`);
        return {
          status: false,
          code: 400,
          message: "Booking is not in pending state",
        };
      }

      const transactionUuid = crypto.randomUUID();

      /**
       * Payment initiation with deduplication.
       *
       * The `payment` table has a partial unique index that enforces:
       *   only one row with status = 'Pending' per booking.
       *
       * Failed retries must reuse the existing pending row. If concurrent
       * requests race, INSERT can hit a unique-constraint violation, then we
       * fetch and reuse the existing pending record.
       */
      const isPendingPerBookingConstraintError = (error: unknown) => {
        const pgError = error as { code?: string; constraint?: string };
        return (
          pgError?.code === "23505" &&
          (pgError?.constraint === "idx_one_pending_per_booking" ||
            pgError?.constraint === "ux_payment_one_pending_per_booking")
        );
      };

      // Step 1: Try to reuse existing pending payment for this booking
      let pendingPayment = await paymentRepository.findOne({
        where: {
          booking: { id: booking.id },
          status: PAYMENT_STATUS.PENDING,
        },
        order: { createdAt: "DESC" },
      });

      let reusedExisting = false;
      let paymentId: number;

      if (pendingPayment) {
        pendingPayment.transactionUuid = transactionUuid;
        pendingPayment.method = method;
        pendingPayment.attemptCount = (pendingPayment.attemptCount || 0) + 1;
        pendingPayment.lastAttemptedAt = new Date();
        pendingPayment.status = PAYMENT_STATUS.PENDING;
        await paymentRepository.save(pendingPayment);

        reusedExisting = true;
        paymentId = pendingPayment.id;
      } else {
        // Step 2: No pending found, create a new pending payment.
        // If unique constraint fails due to race, refetch and reuse.
        try {
          const payment = paymentRepository.create({
            booking: { id: booking.id },
            amount: booking.finalAmount,
            method,
            status: PAYMENT_STATUS.PENDING,
            transactionUuid,
            attemptCount: 1,
            lastAttemptedAt: new Date(),
          });

          const savedPayment = await paymentRepository.save(payment);
          paymentId = savedPayment.id;
        } catch (insertError) {
          if (!isPendingPerBookingConstraintError(insertError)) {
            throw insertError;
          }

          const racedPending = await paymentRepository.findOne({
            where: {
              booking: { id: booking.id },
              status: PAYMENT_STATUS.PENDING,
            },
            order: { createdAt: "DESC" },
          });

          if (!racedPending?.id) {
            throw insertError;
          }

          racedPending.transactionUuid = transactionUuid;
          racedPending.method = method;
          racedPending.attemptCount = (racedPending.attemptCount || 0) + 1;
          racedPending.lastAttemptedAt = new Date();
          racedPending.status = PAYMENT_STATUS.PENDING;
          await paymentRepository.save(racedPending);

          reusedExisting = true;
          paymentId = racedPending.id;
        }
      }

      console.log(
        `[Payment Init] bookingId=${bookingId}, method=${method}, userId=${userId}, reusedExisting=${reusedExisting}, paymentId=${paymentId}`
      );

      if (!paymentId) {
        return {
          status: false,
          code: 500,
          message: "Payment could not be created",
        };
      }

      let paymentGatewayData;

      try {
        if (method === PAYMENT_METHOD.ESEWA) {
          paymentGatewayData = this.generateEsewaPayload(
            booking,
            transactionUuid
          );
          console.log(`eSewa payload generated:`, paymentGatewayData);
        } else if (method === PAYMENT_METHOD.KHALTI) {
          // Khalti requires server-side API call to initiate payment
          paymentGatewayData = await this.initiateKhaltiPayment(
            booking,
            paymentId
          );
          console.log(`Khalti payment initiated:`, paymentGatewayData);
        } else {
          return {
            status: false,
            code: 400,
            message: "Unsupported payment method",
          };
        }

        if (!paymentGatewayData) {
          return {
            status: false,
            code: 500,
            message: "Failed to generate payment gateway data",
          };
        }
      } catch (paymentError) {
        console.error(`Error generating payment gateway data for ${method}:`, paymentError);
        return {
          status: false,
          code: 500,
          message: `Failed to initiate ${method} payment`,
        };
      }

      const response = {
        status: true,
        code: 200,
        message: "Payment initiated",
        data: {
          paymentId,
          bookingId: booking.id,
          amount: booking.finalAmount,
          method,
          reusedExisting,
          paymentGateway: paymentGatewayData,
        },
      };

      console.log(`Payment initiation successful:`, response);
      return response;
    } catch (error) {
      console.error("Payment initiation error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  generateEsewaSignature(
    totalAmount: string,
    transactionUuid: string,
    productCode: string
  ): string {
    try {
      // Use the sandbox secret by default, with fallback to the legacy env name.
      const secretKey = process.env.ESEWA_SECRET_KEY || process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
      
      // Ensure all values are strings and trimmed
      const totalAmountStr = String(totalAmount).trim();
      const transactionUuidStr = String(transactionUuid).trim();
      const productCodeStr = String(productCode).trim();
      
      // Signature data format: total_amount=X,transaction_uuid=Y,product_code=Z
      const signableData = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuidStr},product_code=${productCodeStr}`;
      
      console.log("=== eSewa Signature Generation ===");
      console.log("total_amount:", totalAmountStr);
      console.log("transaction_uuid:", transactionUuidStr);
      console.log("product_code:", productCodeStr);
      console.log("Message to sign:", signableData);
      console.log("Secret key length:", secretKey?.length || 0);
      
      // Create HMAC SHA256 hash and encode it in Base64
      const hash = crypto
        .createHmac("sha256", secretKey)
        .update(signableData)
        .digest("base64");
      
      console.log("Generated signature:", hash);
      console.log("===================================");
      return hash;
    } catch (error) {
      console.error("❌ Error generating eSewa signature:", error);
      return "";
    }
  },

  generateEsewaPayload(booking: BookingEntity, transactionUuid: string) {
    // Use environment variables matching reference implementation
    const productCode = process.env.ESEWA_MERCHANT_CODE || process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
    const successUrl = process.env.SUCCESS_URL || `${process.env.BACKEND_URL || "http://localhost:3000"}/api/v1/bookings/payment/callback/esewa`;
    const failureUrl = process.env.FAILURE_URL || `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking/payment/failure`;
    const normalizeEsewaPaymentUrl = (url: string) => {
      const trimmedUrl = String(url || "").trim();

      if (!trimmedUrl) {
        return "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
      }

      return trimmedUrl
        .replace(/\/api\/epay\/login(?:[?#].*)?$/i, "/api/epay/main/v2/form")
        .replace(/\/api\/epay\/main(?:[?#].*)?$/i, "/api/epay/main/v2/form")
        .replace(/\/epay\/main(?:[?#].*)?$/i, "/api/epay/main/v2/form");
    };

    const rawEsewaPaymentUrl = process.env.ESEWA_API_URL || process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    const esewaPaymentUrl = normalizeEsewaPaymentUrl(rawEsewaPaymentUrl);

    if (rawEsewaPaymentUrl !== esewaPaymentUrl) {
      console.warn("⚠️ Normalized legacy eSewa endpoint:", {
        rawEsewaPaymentUrl,
        esewaPaymentUrl,
      });
    }
    
    // eSewa API v2 expects amount in rupees
    const amount = Math.round(Number(booking.finalAmount)).toString();
    const taxAmount = "0";
    const productServiceCharge = "0";
    const productDeliveryCharge = "0";
    // total_amount = amount + tax_amount + product_service_charge + product_delivery_charge
    const totalAmount = (parseInt(amount) + parseInt(taxAmount) + parseInt(productServiceCharge) + parseInt(productDeliveryCharge)).toString();

    // Calculate signature
    const signature = this.generateEsewaSignature(totalAmount, transactionUuid, productCode);

    const payload = {
      // eSewa API v2 Form Fields
      amount,
      tax_amount: taxAmount,
      product_service_charge: productServiceCharge,
      product_delivery_charge: productDeliveryCharge,
      total_amount: totalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature,
      // eSewa payment redirect URL from env
      esewaUrl: esewaPaymentUrl,
    };

    console.log("📋 eSewa request payload:", payload);
    console.log("📡 eSewa endpoint:", esewaPaymentUrl);
    console.log("📋 Generated eSewa Payload:", payload);

    return payload;
  },

  async initiateKhaltiPayment(booking: BookingEntity, paymentId: number) {
    // Use sandbox/test environment by default, production in live
    const isProduction = process.env.NODE_ENV === "production";
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY || "live_secret_key_68791341fdd94846a146f0457ff7b455";
    const websiteUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const returnUrl = process.env.KHALTI_RETURN_URL || `${websiteUrl}/booking/payment/success`;
    
    // Khalti API base (prefer environment variable)
    const khaltiBase = process.env.KHALTI_API_URL || "https://dev.khalti.com/api/v2";
    const khaltiApiUrl = `${khaltiBase.replace(/\/$/, '')}/epayment/initiate/`;
    
    // Khalti expects amount in paisa (1 NPR = 100 paisa)
    const amountInPaisa = Math.round(Number(booking.finalAmount) * 100);
    
    // Minimum amount check (Khalti requires at least Rs. 10 = 1000 paisa)
    if (amountInPaisa < 1000) {
      console.error("❌ Amount too low for Khalti payment:", amountInPaisa);
      return null;
    }
    
    // Purchase order ID - unique identifier
    const purchaseOrderId = `BOOKING-${booking.id}-${paymentId}-${Date.now()}`;
    
    const requestPayload = {
      return_url: returnUrl,
      website_url: websiteUrl,
      amount: amountInPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Vehicle Booking #${booking.id}`,
      customer_info: {
        name: booking.user?.name || "Customer",
        email: booking.user?.auth?.email || "",
        phone: booking.user?.phoneNumber || "",
      },
    };

    console.log("📋 Khalti Request Payload:", requestPayload);
    console.log("📡 Calling Khalti API:", khaltiApiUrl);

    try {
      const headers = {
        Authorization: `Key ${khaltiSecretKey}`,
        "Content-Type": "application/json",
      } as Record<string, string>;

      const response = await fetch(khaltiApiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(requestPayload),
      });

      // Always log status for debugging
      console.log(`📡 Khalti response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // Attempt to read response body (text) for clearer error details
        let errorBody: string;
        try {
          errorBody = await response.text();
        } catch (e) {
          errorBody = `Could not read response body: ${String(e)}`;
        }

        console.error("❌ Khalti 400/5xx error response:", errorBody);
        console.error("📤 Request payload sent to Khalti:", JSON.stringify(requestPayload));
        console.error("📤 Request headers sent to Khalti:", headers);

        // Try to parse JSON error details if possible and log them
        try {
          const parsed = JSON.parse(errorBody);
          console.error("🔎 Parsed Khalti error:", parsed);
        } catch (e) {
          // ignore parse errors
        }

        return null;
      }

      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        console.error("❌ Failed to parse Khalti JSON response:", String(e));
        const text = await response.text().catch(() => "(no body)");
        console.error("📥 Raw Khalti response body:", text);
        return null;
      }

      console.log("📥 Khalti API Response:", data);

      if (data.pidx && data.payment_url) {
        return {
          pidx: data.pidx,
          payment_url: data.payment_url,
          expires_at: data.expires_at,
          expires_in: data.expires_in,
          bookingId: booking.id,
          paymentId: paymentId,
        };
      } else {
        console.error("❌ Khalti initiation failed:", data);
        return null;
      }
    } catch (error) {
      console.error("❌ Khalti API error:", error);
      return null;
    }
  },

  async khaltiCallback(
    pidx: string,
    transactionId: string,
    amount: string,
    purchaseOrderId: string,
    status: string
  ) {
    try {
      console.log("📥 Processing Khalti callback...", { pidx, transactionId, amount, purchaseOrderId, status });

      // Parse purchase_order_id to get booking and payment IDs
      // Format: BOOKING-bookingId-paymentId-timestamp
      const orderParts = purchaseOrderId.split("-");
      if (orderParts.length < 3 || orderParts[0] !== "BOOKING") {
        console.error("❌ Invalid purchase_order_id format:", purchaseOrderId);
        return {
          status: false,
          code: 400,
          message: "Invalid purchase order ID format",
        };
      }

      const bookingId = parseInt(orderParts[1]);
      const paymentId = parseInt(orderParts[2]);

      const payment = await paymentRepository.findOne({
        where: { id: paymentId },
        relations: ["booking", "booking.user"],
      });

      if (!payment) {
        console.error(`❌ Payment not found: id=${paymentId}`);
        return {
          status: false,
          code: 404,
          message: "Payment not found",
        };
      }

      // Verify payment status with Khalti
      const verificationResult = await this.verifyKhaltiPayment(pidx);
      
      if (status === "Completed" && verificationResult.success) {
        // Update payment status
        payment.status = PAYMENT_STATUS.SUCCESS;
        payment.transactionId = transactionId || pidx;
        await paymentRepository.save(payment);

        // Update booking status
        const booking = await bookingRepository.findOne({
          where: { id: payment.booking.id },
        });

        if (booking) {
          await this.updateBookingStatus(booking.id, BOOKING_STATUS.CONFIRMED);
          console.log(`✅ Booking ${booking.id} confirmed after Khalti payment`);
        }

        if (payment.booking?.user?.id) {
          const recipientId = Number(payment.booking.user.id);

          await safeNotify(() =>
            notificationService.createNotification({
              recipientId,
              recipientRole: USER_ROLE.USER,
              type: NOTIFICATION_TYPE.PAYMENT_SUCCESS,
              title: "Payment successful",
              message: `Payment for booking #${payment.booking.id} was completed successfully.`,
              data: {
                bookingId: payment.booking.id,
                paymentId: payment.id,
                transactionId: transactionId || pidx,
                route: "/bookings",
              },
            })
          );
        }

        return {
          status: true,
          code: 200,
          message: "Payment successful",
          data: {
            bookingId: payment.booking.id,
            paymentId: payment.id,
            transactionId: transactionId || pidx,
          },
        };
      } else {
        // Payment failed
        payment.status = PAYMENT_STATUS.FAILED;
        await paymentRepository.save(payment);

        if (payment.booking?.user?.id) {
          const recipientId = Number(payment.booking.user.id);

          await safeNotify(() =>
            notificationService.createNotification({
              recipientId,
              recipientRole: USER_ROLE.USER,
              type: NOTIFICATION_TYPE.PAYMENT_FAILED,
              title: "Payment failed",
              message: `Payment for booking #${payment.booking.id} could not be verified.`,
              data: {
                bookingId: payment.booking.id,
                paymentId: payment.id,
                route: "/bookings",
              },
            })
          );
        }

        await safeNotify(() =>
          notificationService.createForAdmins({
            type: NOTIFICATION_TYPE.PAYMENT_FAILED,
            title: "Payment failure",
            message: `Payment for booking #${payment.booking.id} failed verification.`,
            data: {
              bookingId: payment.booking.id,
              paymentId: payment.id,
              route: "/admin/payments",
            },
          })
        );

        return {
          status: false,
          code: 400,
          message: "Payment failed or not verified",
        };
      }
    } catch (error) {
      console.error("❌ Khalti callback error:", error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async verifyKhaltiPayment(pidx: string) {
    try {
      const isProduction = process.env.NODE_ENV === "production";
      const khaltiSecretKey = process.env.KHALTI_SECRET_KEY || "live_secret_key_68791341fdd94846a146f0457ff7b455";
      
      // Use sandbox/test environment for development
      const khaltiBaseLookup = process.env.KHALTI_API_URL || "https://dev.khalti.com/api/v2";
      const lookupUrl = `${khaltiBaseLookup.replace(/\/$/, '')}/epayment/lookup/`;
      
      console.log("📡 Verifying Khalti payment:", { pidx, lookupUrl });
      
      const headers = {
        Authorization: `Key ${khaltiSecretKey}`,
        "Content-Type": "application/json",
      } as Record<string, string>;

      const response = await fetch(lookupUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ pidx }),
      });

      console.log(`📡 Khalti lookup response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "(no body)");
        console.error("❌ Khalti lookup error response:", errorBody);
        console.error("📤 Khalti lookup request headers:", headers);
        console.error("📤 Khalti lookup request payload:", JSON.stringify({ pidx }));
        return { success: false, data: null };
      }

      const data = await response.json();
      console.log("Khalti verification response:", data);

      return {
        success: data.status === "Completed",
        data,
      };
    } catch (error) {
      console.error("Khalti verification error:", error);
      return { success: false, data: null };
    }
  },

  verifyEsewaResponseSignature(responseData: any): boolean {
    try {
      const secretKey = process.env.ESEWA_SECRET_KEY || process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
      const responseSignature = responseData.signature;
      const signedFieldNames = responseData.signed_field_names || "";
      
      const fieldNames = signedFieldNames.split(",").map((f: string) => f.trim());
      
      // Build signable data in the format: field_name=value,field_name=value
      const signableDataParts = fieldNames.map((field: string) => {
        const value = responseData[field];
        return `${field}=${String(value).trim()}`;
      });
      const signableData = signableDataParts.join(",");
      
      const generatedSignature = crypto
        .createHmac("sha256", secretKey)
        .update(signableData)
        .digest("base64");
      
      console.log("Signature Verification:", {
        signedFieldNames,
        signableData,
        expected: responseSignature,
        generated: generatedSignature,
        match: responseSignature === generatedSignature,
      });
      
      return responseSignature === generatedSignature;
    } catch (error) {
      console.error("Error verifying signature:", error);
      return false;
    }
  },

  async esewaCallback(
    transactionUuid: string,
    transactionCode: string,
    totalAmount: string,
    status: string
  ) {
    try {
      console.log("📥 Processing eSewa callback...", { transactionUuid, transactionCode, totalAmount, status });

      const payment = await paymentRepository.findOne({
        where: { transactionUuid },
        relations: ["booking", "booking.user"],
      });

      if (!payment) {
        console.error(`❌ Payment not found for transactionUuid=${transactionUuid}`);
        return {
          status: false,
          code: 404,
          message: "Payment not found",
        };
      }

      if (Number(payment.amount) !== Number(totalAmount)) {
        console.error("❌ eSewa amount mismatch:", {
          storedAmount: payment.amount,
          callbackAmount: totalAmount,
          transactionUuid,
        });
        return {
          status: false,
          code: 400,
          message: "Payment amount mismatch",
        };
      }

      if (payment.status === PAYMENT_STATUS.SUCCESS) {
        return {
          status: true,
          code: 200,
          message: "Payment already processed",
          data: {
            bookingId: payment.booking?.id,
            paymentId: payment.id,
            transactionId: payment.transactionId,
          },
        };
      }

      if (payment.status !== PAYMENT_STATUS.PENDING && payment.status !== PAYMENT_STATUS.CANCELLED) {
        return {
          status: false,
          code: 409,
          message: "Payment is no longer pending",
        };
      }

      // Check if payment status is COMPLETE
      if (status === "COMPLETE" && transactionCode) {
        payment.status = PAYMENT_STATUS.SUCCESS;
        payment.transactionId = transactionCode;
        payment.response = JSON.stringify({
          transactionUuid,
          transactionCode,
          totalAmount,
          status,
        });
        payment.paidAt = new Date();
        await paymentRepository.save(payment);

        const booking = payment.booking;
        await this.updateBookingStatus(booking.id, BOOKING_STATUS.CONFIRMED);

        if (payment.booking?.user?.id) {
          const recipientId = Number(payment.booking.user.id);

          await safeNotify(() =>
            notificationService.createNotification({
              recipientId,
              recipientRole: USER_ROLE.USER,
              type: NOTIFICATION_TYPE.PAYMENT_SUCCESS,
              title: "Payment successful",
              message: `Payment for booking #${booking.id} was completed successfully.`,
              data: {
                bookingId: booking.id,
                paymentId: payment.id,
                transactionId: transactionCode,
                route: "/bookings",
              },
            })
          );
        }

        console.log(`✅ Payment COMPLETE: booking=${booking.id}, transactionCode=${transactionCode}`);
        return {
          status: true,
          code: 200,
          message: "Payment completed",
          data: { bookingId: booking.id, paymentId: payment.id, transactionId: transactionCode },
        };
      }

      console.error(`❌ Payment not complete. Status: ${status}`);

      payment.status = PAYMENT_STATUS.FAILED;
      payment.response = JSON.stringify({
        transactionUuid,
        transactionCode,
        totalAmount,
        status,
      });
      await paymentRepository.save(payment);

      if (payment.booking?.user?.id) {
        const recipientId = Number(payment.booking.user.id);

        await safeNotify(() =>
          notificationService.createNotification({
            recipientId,
            recipientRole: USER_ROLE.USER,
            type: NOTIFICATION_TYPE.PAYMENT_FAILED,
            title: "Payment not completed",
            message: `Payment for booking #${payment.booking.id} finished with status ${status}.`,
            data: {
              bookingId: payment.booking.id,
              paymentId: payment.id,
              route: "/bookings",
            },
          })
        );
      }

      await safeNotify(() =>
        notificationService.createForAdmins({
          type: NOTIFICATION_TYPE.PAYMENT_FAILED,
          title: "Payment not completed",
            message: `Booking #${payment.booking.id} payment returned status ${status}.`,
          data: {
              bookingId: payment.booking.id,
              paymentId: payment.id,
            route: "/admin/payments",
          },
        })
      );

      return {
        status: false,
        code: 400,
        message: `Payment status: ${status}`,
      };
    } catch (error) {
      console.error("eSewa callback error:", error);
      return {
        status: false,
        code: 500,
        message: "Payment verification error",
      };
    }
  },

  async checkEsewaPaymentStatus(transactionUuid: string, amount: number) {
    try {
      const productCode = process.env.ESEWA_MERCHANT_CODE || process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
      const statusCheckUrl = process.env.ESEWA_PAYMENT_STATUS_CHECK_URL || "https://rc.esewa.com.np/api/epay/transaction/status/";
      const totalAmount = Number(amount).toFixed(2);

      console.log(`Checking eSewa status: uuid=${transactionUuid}`);

      const response = await axiosInstance.get(statusCheckUrl, {
        params: {
          product_code: productCode,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
        },
      });

      console.log("Status response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Status check failed:", error);
      return null;
    }
  },

  async getPaymentStatus(bookingId: number, userId: number) {
    try {
      const booking = await bookingRepository.findOne({
        where: { id: bookingId, user: { id: userId } },
        relations: ["payments"],
      });

      if (!booking) {
        return {
          status: false,
          code: 404,
          message: "Booking not found",
        };
      }

      const latestPayment = booking.payments?.[booking.payments.length - 1];

      return {
        status: true,
        code: 200,
        data: {
          bookingStatus: booking.status,
          paymentStatus: latestPayment?.status || PAYMENT_STATUS.PENDING,
          paymentMethod: latestPayment?.method,
          amount: booking.finalAmount,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async getVehicleUnavailableDates(vehicleId: number) {
    try {
      const vehicle = await vehicleRepository.findOne({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found",
        };
      }

      const bookings = await bookingRepository.find({
        where: {
          vehicle: { id: vehicleId },
          status: BOOKING_STATUS.CONFIRMED,
        },
        order: { startDate: "ASC" },
      });

      const unavailableDates = bookings.map((booking) => ({
        startDate: booking.startDate,
        endDate: booking.endDate,
        bookingId: booking.id,
        userName: booking.user?.name || "Unknown User",
      }));

      return {
        status: true,
        code: 200,
        data: {
          vehicleId,
          vehicleName: vehicle.name,
          unavailableDates,
          totalUnavailableDateRanges: unavailableDates.length,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  async checkVehicleAvailability(
    vehicleId: number,
    startDate: string,
    endDate: string
  ) {
    try {
      const vehicle = await vehicleRepository.findOne({
        where: { id: vehicleId },
      });

      if (!vehicle) {
        return {
          status: false,
          code: 404,
          message: "Vehicle not found",
        };
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return {
          status: false,
          code: 400,
          message: "End date must be after start date",
        };
      }

      const bookings = await bookingRepository.find({
        where: {
          vehicle: { id: vehicleId },
          status: BOOKING_STATUS.CONFIRMED,
        },
      });

      const conflicts = bookings.filter((booking) => {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        return start < bookingEnd && end > bookingStart;
      });

      if (conflicts.length > 0) {
        return {
          status: true,
          code: 200,
          data: {
            isAvailable: false,
            vehicleId,
            requestedStartDate: startDate,
            requestedEndDate: endDate,
            conflictingBookings: conflicts.map((b) => ({
              bookingId: b.id,
              startDate: b.startDate,
              endDate: b.endDate,
              userName: b.user?.name || "Unknown User",
            })),
            message: "Vehicle is not available for selected dates",
          },
        };
      }

      return {
        status: true,
        code: 200,
        data: {
          isAvailable: true,
          vehicleId,
          requestedStartDate: startDate,
          requestedEndDate: endDate,
          message: "Vehicle is available for selected dates",
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Admin: Get booking statistics
  async getBookingStats() {
    try {
      const totalBookings = await bookingRepository.count();
      const pendingCount = await bookingRepository.count({ where: { status: BOOKING_STATUS.PENDING } });
      const confirmedCount = await bookingRepository.count({ where: { status: BOOKING_STATUS.CONFIRMED } });
      const completedCount = await bookingRepository.count({ where: { status: BOOKING_STATUS.COMPLETED } });
      const cancelledCount = await bookingRepository.count({ where: { status: BOOKING_STATUS.CANCELLED } });

      // Calculate total revenue from completed bookings
      const completedBookings = await bookingRepository.find({
        where: { status: BOOKING_STATUS.COMPLETED },
        select: ["finalAmount"],
      });
      const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.finalAmount || 0), 0);

      return {
        status: true,
        code: 200,
        data: {
          total: totalBookings,
          pending: pendingCount,
          confirmed: confirmedCount,
          completed: completedCount,
          cancelled: cancelledCount,
          totalRevenue,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Admin: Get all payments
  async getAllPayments(page = 1, limit = 10, status?: string, method?: string) {
    try {
      const whereClause: any = {};
      if (status && status !== 'all') {
        whereClause.status = status;
      }
      if (method && method !== 'all') {
        whereClause.method = method;
      }

      const [payments, total] = await paymentRepository.findAndCount({
        where: whereClause,
        relations: ["booking", "booking.user", "booking.user.auth", "booking.vehicle"],
        skip: (page - 1) * limit,
        take: limit,
        order: { createdAt: "DESC" },
      });

      return {
        status: true,
        code: 200,
        data: payments.map((payment: PaymentEntity) => ({
          id: payment.id,
          amount: payment.amount,
          method: payment.method,
          status: payment.status,
          transactionId: payment.transactionId,
          paidAt: payment.paidAt,
          refundId: payment.refundId,
          refundAmount: payment.refundAmount,
          refundedAt: payment.refundedAt,
          createdAt: payment.createdAt,
          booking: payment.booking ? {
            id: payment.booking.id,
            startDate: payment.booking.startDate,
            endDate: payment.booking.endDate,
            status: payment.booking.status,
            finalAmount: payment.booking.finalAmount,
          } : null,
          user: payment.booking?.user ? {
            id: payment.booking.user.id,
            name: payment.booking.user.name,
            email: payment.booking.user.auth?.email,
          } : null,
          vehicle: payment.booking?.vehicle ? {
            id: payment.booking.vehicle.id,
            name: payment.booking.vehicle.name,
            make: payment.booking.vehicle.make,
            model: payment.booking.vehicle.model,
          } : null,
        })),
        pagination: {
          currentPage: page,
          perPage: limit,
          totalPages: Math.ceil(total / limit),
          total,
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },

  // Admin: Get payment statistics
  async getPaymentStats() {
    try {
      const totalPayments = await paymentRepository.count();
      const pendingCount = await paymentRepository.count({ where: { status: PAYMENT_STATUS.PENDING } });
      const successCount = await paymentRepository.count({ where: { status: PAYMENT_STATUS.SUCCESS } });
      const failedCount = await paymentRepository.count({ where: { status: PAYMENT_STATUS.FAILED } });
      const cancelledCount = await paymentRepository.count({ where: { status: PAYMENT_STATUS.CANCELLED } });

      // Calculate total revenue from successful payments (explicit SUM)
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

      const totalRevenue = Number((successfulRow && successfulRow.total) || 0);
      const pendingRevenue = Number((pendingRow && pendingRow.total) || 0);

      // Get eSewa vs Khalti breakdown
      const esewaCount = await paymentRepository.count({ where: { method: PAYMENT_METHOD.ESEWA, status: PAYMENT_STATUS.SUCCESS } });
      const khaltiCount = await paymentRepository.count({ where: { method: PAYMENT_METHOD.KHALTI, status: PAYMENT_STATUS.SUCCESS } });

      return {
        status: true,
        code: 200,
        data: {
          total: totalPayments,
          pending: pendingCount,
          success: successCount,
          failed: failedCount,
          cancelled: cancelledCount,
          totalRevenue,
          pendingRevenue,
          byMethod: {
            esewa: esewaCount,
            khalti: khaltiCount,
          },
        },
      };
    } catch (error) {
      console.error(error);
      return {
        status: false,
        code: 500,
        message: "Internal Server Error",
      };
    }
  },
};
