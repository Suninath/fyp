import { Request, Response } from "express";
import { bookingService } from "../service/booking.service";
import { PAYMENT_METHOD } from "../entities/payment.entity";

const bookingController = {
  async createBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { vehicleId, startDate, endDate, location, notes } = req.body;

      if (!userId || !vehicleId || !startDate || !endDate || !location) {
        return res.status(400).json({
          status: false,
          message: "Missing required fields",
        });
      }

      const result = await bookingService.createBooking(
        userId,
        vehicleId,
        startDate,
        endDate,
        location,
        notes
      );

      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const result = await bookingService.getUserBookings(userId, page, limit);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async getEsewaConfig(req: Request, res: Response) {
    try {
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
      const esewaApiUrl = normalizeEsewaPaymentUrl(rawEsewaPaymentUrl);

      return res.status(200).json({
        status: true,
        nodeEnv: process.env.NODE_ENV || "development",
        mockPayments: process.env.MOCK_PAYMENTS === "true" || process.env.MOCK_PAYMENTS === "1",
        esewaApiUrl,
        rawEsewaApiUrl: rawEsewaPaymentUrl,
        merchantCode: process.env.ESEWA_MERCHANT_CODE || process.env.ESEWA_MERCHANT_ID || "EPAYTEST",
        hasSecretKey: Boolean(process.env.ESEWA_SECRET_KEY || process.env.ESEWA_SECRET),
        secretKeyLength: (process.env.ESEWA_SECRET_KEY || process.env.ESEWA_SECRET || "").length,
        backendUrl: process.env.BACKEND_URL || "http://localhost:3000",
        frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
      });
    } catch (error) {
      console.error('Error returning eSewa config:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
  },

  async getBookingById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const bookingId = parseInt(req.params.id);

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const result = await bookingService.getBookingById(bookingId, userId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async cancelBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const bookingId = parseInt(req.params.id);

      console.log("[CancelBooking] Controller request", {
        bookingIdRaw: req.params.id,
        bookingId,
        userId,
      });

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      if (!bookingId || Number.isNaN(bookingId)) {
        return res.status(400).json({
          status: false,
          message: "Invalid booking id",
        });
      }

      const result = await bookingService.cancelBooking(bookingId, userId);
      console.log("[CancelBooking] Controller response", {
        bookingId,
        userId,
        code: result.code,
        status: result.status,
        message: result.message,
      });
      res.status(result.code).json(result);
    } catch (error) {
      console.error("[CancelBooking] Controller error", error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async requestRefund(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const bookingId = parseInt(req.params.id);
      const { reason } = req.body;

      if (!userId) {
        return res.status(401).json({ status: false, message: "Unauthorized" });
      }

      const result = await bookingService.requestRefund(bookingId, userId, reason);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  },

  async getVehicleBookings(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);

      if (!vehicleId) {
        return res.status(400).json({
          status: false,
          message: "Vehicle ID required",
        });
      }

      const result = await bookingService.getVehicleBookings(vehicleId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async initiatePayment(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const bookingId = parseInt(req.params.bookingId);
      const { method } = req.body;

      console.log(`Payment initiation: userId=${userId}, bookingId=${bookingId}, method=${method}`);

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      if (!method || !Object.values(PAYMENT_METHOD).includes(method)) {
        return res.status(400).json({
          status: false,
          message: "Invalid payment method",
        });
      }

      const result = await bookingService.initiatePayment(
        bookingId,
        method,
        userId
      );
      
      console.log(`Payment response:`, result);
      res.status(result.code).json(result);
    } catch (error) {
      console.error("Payment initiation error:", error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async esewaCallback(req: Request, res: Response) {
    try {
      // eSewa API v2 returns response encoded in Base64 as query parameter 'data'
      const { data } = req.query;
      
      if (!data) {
        return res.status(400).json({
          status: false,
          message: "Missing data parameter from eSewa callback",
        });
      }

      // Decode Base64 response
      const decodedData = Buffer.from(data as string, 'base64').toString('utf-8');
      const responseData = JSON.parse(decodedData);
      
      console.log("📥 eSewa callback received:", responseData);

      const { transaction_uuid, transaction_code, total_amount, status, product_code, signature, signed_field_names } = responseData;

      if (!transaction_uuid || !status) {
        return res.status(400).json({
          status: false,
          message: "Missing required parameters from eSewa callback",
        });
      }

      // Verify signature before processing
      const isValidSignature = bookingService.verifyEsewaResponseSignature(responseData);
      if (!isValidSignature) {
        console.error("❌ Invalid signature in eSewa response");
        return res.status(400).json({
          status: false,
          message: "Invalid signature",
        });
      }

      const result = await bookingService.esewaCallback(
        transaction_uuid,
        transaction_code,
        total_amount,
        status
      );

      // Redirect to frontend with status
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      if (result.status) {
        return res.redirect(`${frontendUrl}/bookings?payment=success&bookingId=${result.data?.bookingId}`);
      } else {
        return res.redirect(`${frontendUrl}/booking/payment/failure?message=${encodeURIComponent(result.message)}`);
      }
    } catch (error) {
      console.error("eSewa callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/booking/payment/failure?message=Payment%20verification%20failed`);
    }
  },

  async khaltiCallback(req: Request, res: Response) {
    try {
      // Khalti returns these parameters via query string after redirect
      const { pidx, transaction_id, tidx, amount, total_amount, status, mobile, purchase_order_id, purchase_order_name } = req.query;
      
      console.log("📥 Khalti callback received:", req.query);

      if (!pidx || !status || !purchase_order_id) {
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        return res.redirect(`${frontendUrl}/booking/payment/failure?message=Missing%20required%20parameters`);
      }

      const result = await bookingService.khaltiCallback(
        pidx as string,
        (transaction_id || tidx) as string,
        (total_amount || amount) as string,
        purchase_order_id as string,
        status as string
      );

      // Redirect to frontend with status
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      if (result.status) {
        return res.redirect(`${frontendUrl}/bookings?payment=success&bookingId=${result.data?.bookingId}`);
      } else {
        return res.redirect(`${frontendUrl}/booking/payment/failure?message=${encodeURIComponent(result.message)}`);
      }
    } catch (error) {
      console.error("Khalti callback error:", error);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      return res.redirect(`${frontendUrl}/booking/payment/failure?message=Payment%20verification%20failed`);
    }
  },

  async verifyKhalti(req: Request, res: Response) {
    try {
      const pidx = req.query.pidx as string;
      if (!pidx) {
        return res.status(400).json({ status: false, message: 'Missing pidx parameter' });
      }

      const verification = await bookingService.verifyKhaltiPayment(pidx);
      if (!verification.success) {
        return res.status(400).json({ status: false, message: 'Payment not verified', data: verification.data });
      }

      // If lookup succeeded, process the payment update via existing khaltiCallback flow
      const data = verification.data || {};
      let purchaseOrderId = data.purchase_order_id || data.purchase_order || data.purchaseOrderId || data.purchase_order_id;
      const transactionId = data.transaction_id || data.tidx || data.transactionId || pidx;
      const amount = data.total_amount || data.amount || data.totalAmount || "";
      const status = data.status || "Completed";

      if (!purchaseOrderId) {
        // Try to map pidx back to our payment record (we save the initiation response in payment.response)
        try {
          const payment = await bookingService.findPaymentByPidx(pidx);
          if (payment && payment.booking && payment.id) {
            purchaseOrderId = `BOOKING-${payment.booking.id}-${payment.id}-recovered`;
            console.log('Recovered purchaseOrderId from DB for pidx:', pidx, '->', purchaseOrderId);
          } else {
            // We have a lookup but can't map to an order - return the raw data
            return res.status(200).json({ status: true, message: 'Payment lookup succeeded (no purchase_order_id)', data });
          }
        } catch (mapErr) {
          console.error('Error mapping pidx to payment:', mapErr);
          return res.status(200).json({ status: true, message: 'Payment lookup succeeded (no purchase_order_id)', data });
        }
      }

      const result = await bookingService.khaltiCallback(
        pidx,
        String(transactionId),
        String(amount),
        String(purchaseOrderId),
        String(status)
      );

      if (result.status) {
        return res.status(200).json({ status: true, message: 'Payment processed', data: result.data });
      } else {
        return res.status(400).json({ status: false, message: result.message || 'Payment verification failed', data: result.data });
      }
    } catch (error) {
      console.error('Khalti verify endpoint error:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
  },

  async getKhaltiConfig(req: Request, res: Response) {
    try {
      const isProduction = process.env.NODE_ENV === 'production';
      const defaultBase = isProduction ? 'https://a.khalti.com/api/v2' : 'https://dev.khalti.com/api/v2';
      const khaltiApiUrl = process.env.KHALTI_API_URL || defaultBase;
      return res.status(200).json({ status: true, khaltiApiUrl });
    } catch (error) {
      console.error('Error returning Khalti config:', error);
      return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
  },



  async getPaymentStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const bookingId = parseInt(req.params.bookingId);

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const result = await bookingService.getPaymentStatus(bookingId, userId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async getVehicleUnavailableDates(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);

      if (!vehicleId) {
        return res.status(400).json({
          status: false,
          message: "Vehicle ID is required",
        });
      }

      const result = await bookingService.getVehicleUnavailableDates(vehicleId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async checkVehicleAvailability(req: Request, res: Response) {
    try {
      const vehicleId = parseInt(req.params.vehicleId);
      const { startDate, endDate } = req.body;

      if (!vehicleId || !startDate || !endDate) {
        return res.status(400).json({
          status: false,
          message: "Vehicle ID, start date, and end date are required",
        });
      }

      const result = await bookingService.checkVehicleAvailability(
        vehicleId,
        startDate,
        endDate
      );
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
    }
  },

  async getRefundRequests(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ status: false, message: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string | undefined;
      const result = await bookingService.getRefundRequests(page, limit, status);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  },

  async reviewRefundRequest(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.id;
      const refundRequestId = parseInt(req.params.id);
      const { action, adminNotes } = req.body;

      const result = await bookingService.reviewRefundRequest(refundRequestId, action, adminId, adminNotes);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: false, message: "Internal Server Error" });
    }
  },
};

export default bookingController;
