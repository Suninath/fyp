import express from "express";
import bookingController from "../controller/booking.controller";
import { authenticationMiddeware } from "../middleware/authMiddleware";

const router = express.Router();

// Booking routes - require authentication
router.post("/", authenticationMiddeware, bookingController.createBooking);
router.get("/", authenticationMiddeware, bookingController.getUserBookings);
router.get("/:id", authenticationMiddeware, bookingController.getBookingById);
router.patch("/:id/cancel", authenticationMiddeware, bookingController.cancelBooking);
router.get("/vehicle/:vehicleId", bookingController.getVehicleBookings); // Check availability

// Availability check routes (no auth required - useful for frontend)
router.get("/vehicle/:vehicleId/unavailable-dates", bookingController.getVehicleUnavailableDates);
router.post("/vehicle/:vehicleId/check-availability", bookingController.checkVehicleAvailability);

// Payment routes
router.post("/:bookingId/payment", authenticationMiddeware, bookingController.initiatePayment);
// Callbacks use GET (payment gateways redirect via query parameters)
router.get("/payment/callback/esewa", bookingController.esewaCallback);
router.get("/payment/callback/khalti", bookingController.khaltiCallback);
router.get("/:bookingId/payment/status", authenticationMiddeware, bookingController.getPaymentStatus);

export default router;
