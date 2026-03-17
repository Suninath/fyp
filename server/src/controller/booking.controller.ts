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

      if (!userId) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const result = await bookingService.cancelBooking(bookingId, userId);
      res.status(result.code).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
      });
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
};

export default bookingController;
