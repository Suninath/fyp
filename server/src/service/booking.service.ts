import AppDataSource from "../config/db.config";
import { BookingEntity, BOOKING_STATUS } from "../entities/booking.entity";
import { PaymentEntity, PAYMENT_METHOD, PAYMENT_STATUS } from "../entities/payment.entity";
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
const vehicleRepository = AppDataSource.getRepository(VehicleEntity);
const userRepository = AppDataSource.getRepository(UserEntity);

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
        relations: ["vehicle", "payments"],
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
          paymentStatus:
            booking.payments?.length > 0
              ? booking.payments[0].status
              : PAYMENT_STATUS.PENDING,
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
        relations: ["vehicle", "user", "user.auth", "payments"],
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
          paymentStatus:
            booking.payments?.length > 0
              ? booking.payments[0].status
              : PAYMENT_STATUS.PENDING,
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
    bookingId: number,
    status: BOOKING_STATUS,
    adminRemarks?: string
  ) {
    try {
      const booking = await bookingRepository.findOne({
        where: { id: bookingId },
        relations: ["user"],
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
        relations: ["vehicle", "payments"],
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

      booking.status = BOOKING_STATUS.CANCELLED;
      await bookingRepository.save(booking);

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

      const payment = paymentRepository.create({
        booking: { id: booking.id },
        amount: booking.finalAmount,
        method,
        status: PAYMENT_STATUS.PENDING,
      });

      const savedPayment = await paymentRepository.save(payment);
      const paymentId = savedPayment.id;

      console.log(`Payment created: paymentId=${paymentId}, method=${method}, amount=${booking.finalAmount}`);

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
            paymentId
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
      // Use ESEWA_SECRET env variable (matching reference implementation)
      const secretKey = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
      
      // Ensure all values are strings and trimmed
      const totalAmountStr = String(totalAmount).trim();
      const transactionUuidStr = String(transactionUuid).trim();
      const productCodeStr = String(productCode).trim();
      
      // Signature data format: total_amount=X,transaction_uuid=Y,product_code=Z
      const signableData = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuidStr},product_code=${productCodeStr}`;
      
      console.log("🔐 eSewa Signature Generation:", {
        total_amount: totalAmountStr,
        transaction_uuid: transactionUuidStr,
        product_code: productCodeStr,
        signableData,
      });
      
      // Create HMAC SHA256 hash and encode it in Base64
      const hash = crypto
        .createHmac("sha256", secretKey)
        .update(signableData)
        .digest("base64");
      
      console.log("✅ Generated Signature (base64):", hash);
      return hash;
    } catch (error) {
      console.error("❌ Error generating eSewa signature:", error);
      return "";
    }
  },

  generateEsewaPayload(booking: BookingEntity, paymentId: number) {
    // Use environment variables matching reference implementation
    const productCode = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
    const successUrl = process.env.SUCCESS_URL || `${process.env.BACKEND_URL || "http://localhost:3000"}/api/v1/bookings/payment/callback/esewa`;
    const failureUrl = process.env.FAILURE_URL || `${process.env.FRONTEND_URL || "http://localhost:5173"}/booking/payment/failure`;
    const esewaPaymentUrl = process.env.ESEWA_PAYMENT_URL || "https://rc-epay.esewa.com.np/api/epay/main/v2/form";
    
    // eSewa API v2 expects amount in rupees
    const amount = Math.round(Number(booking.finalAmount)).toString();
    const taxAmount = "0";
    const productServiceCharge = "0";
    const productDeliveryCharge = "0";
    // total_amount = amount + tax_amount + product_service_charge + product_delivery_charge
    const totalAmount = (parseInt(amount) + parseInt(taxAmount) + parseInt(productServiceCharge) + parseInt(productDeliveryCharge)).toString();
    // Transaction UUID - must be unique, supports alphanumeric and hyphen(-) only
    const transactionUuid = `${booking.id}-${paymentId}-${Date.now()}`;

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

    console.log("📋 Generated eSewa Payload:", payload);

    return payload;
  },

  async initiateKhaltiPayment(booking: BookingEntity, paymentId: number) {
    // Use sandbox/test environment by default, production in live
    const isProduction = process.env.NODE_ENV === "production";
    const khaltiSecretKey = process.env.KHALTI_SECRET_KEY || "live_secret_key_68791341fdd94846a146f0457ff7b455";
    const returnUrl = process.env.KHALTI_RETURN_URL || `${process.env.BACKEND_URL || "http://localhost:3000"}/api/v1/bookings/payment/callback/khalti`;
    const websiteUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    
    // Khalti API endpoints
    const khaltiApiUrl = isProduction 
      ? "https://khalti.com/api/v2/epayment/initiate/"
      : "https://dev.khalti.com/api/v2/epayment/initiate/";
    
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
      const response = await fetch(khaltiApiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
      });

      const data = await response.json();
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
          booking.status = BOOKING_STATUS.CONFIRMED;
          await bookingRepository.save(booking);
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
      const lookupUrl = isProduction
        ? "https://khalti.com/api/v2/epayment/lookup/"
        : "https://dev.khalti.com/api/v2/epayment/lookup/";
      
      console.log("📡 Verifying Khalti payment:", { pidx, lookupUrl });
      
      const response = await fetch(lookupUrl, {
        method: "POST",
        headers: {
          "Authorization": `Key ${khaltiSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pidx }),
      });

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
      const secretKey = process.env.ESEWA_SECRET || "8gBm/:&EnhH.1/q";
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

      // Parse transaction_uuid to get booking and payment IDs
      // Format: bookingId-paymentId-timestamp (hyphen separator)
      const uuidParts = transactionUuid.split("-");
      if (uuidParts.length < 2) {
        console.error("❌ Invalid transaction_uuid format:", transactionUuid);
        return {
          status: false,
          code: 400,
          message: "Invalid transaction UUID format",
        };
      }

      const bookingId = parseInt(uuidParts[0]);
      const paymentId = parseInt(uuidParts[1]);

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

      // Check if payment status is COMPLETE
      if (status === "COMPLETE" && transactionCode) {
        payment.status = PAYMENT_STATUS.SUCCESS;
        payment.transactionId = transactionCode;
        payment.paidAt = new Date();
        await paymentRepository.save(payment);

        const booking = payment.booking;
        booking.status = BOOKING_STATUS.CONFIRMED;
        await bookingRepository.save(booking);

        if (payment.booking?.user?.id) {
          const recipientId = Number(payment.booking.user.id);

          await safeNotify(() =>
            notificationService.createNotification({
              recipientId,
              recipientRole: USER_ROLE.USER,
              type: NOTIFICATION_TYPE.PAYMENT_SUCCESS,
              title: "Payment successful",
              message: `Payment for booking #${bookingId} was completed successfully.`,
              data: {
                bookingId,
                paymentId,
                transactionId: transactionCode,
                route: "/bookings",
              },
            })
          );
        }

        console.log(`✅ Payment COMPLETE: booking=${bookingId}, transactionCode=${transactionCode}`);
        return {
          status: true,
          code: 200,
          message: "Payment completed",
          data: { bookingId, paymentId, transactionId: transactionCode },
        };
      }

      console.error(`❌ Payment not complete. Status: ${status}`);

      if (payment.booking?.user?.id) {
        const recipientId = Number(payment.booking.user.id);

        await safeNotify(() =>
          notificationService.createNotification({
            recipientId,
            recipientRole: USER_ROLE.USER,
            type: NOTIFICATION_TYPE.PAYMENT_FAILED,
            title: "Payment not completed",
            message: `Payment for booking #${bookingId} finished with status ${status}.`,
            data: {
              bookingId,
              paymentId,
              route: "/bookings",
            },
          })
        );
      }

      await safeNotify(() =>
        notificationService.createForAdmins({
          type: NOTIFICATION_TYPE.PAYMENT_FAILED,
          title: "Payment not completed",
          message: `Booking #${bookingId} payment returned status ${status}.`,
          data: {
            bookingId,
            paymentId,
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
      const productCode = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";
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

      // Calculate total revenue from successful payments
      const successfulPayments = await paymentRepository.find({
        where: { status: PAYMENT_STATUS.SUCCESS },
        select: ["amount"],
      });
      const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

      // Calculate pending revenue from pending payments
      const pendingPayments = await paymentRepository.find({
        where: { status: PAYMENT_STATUS.PENDING },
        select: ["amount"],
      });
      const pendingRevenue = pendingPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

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
