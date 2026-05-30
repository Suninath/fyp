import { LessThan, LessThanOrEqual } from "typeorm";
import AppDataSource from "../config/db.config";
import { USER_ROLE } from "../constant/enums";
import { BOOKING_STATUS, BookingEntity } from "../entities/booking.entity";
import {
  NOTIFICATION_TYPE,
} from "../entities/notification.entity";
import { PAYMENT_STATUS, PaymentEntity } from "../entities/payment.entity";
import { notificationService } from "../service/notification.service";
import { bookingService } from "../service/booking.service";

const bookingRepository = AppDataSource.getRepository(BookingEntity);
const paymentRepository = AppDataSource.getRepository(PaymentEntity);
const ONE_HOUR_IN_MS = 60 * 60 * 1000;
let schedulerStarted = false;

const AUTO_CANCEL_REMARK =
  "Automatically cancelled because payment was not completed before the booking start date.";

const safeNotify = async (callback: () => Promise<unknown>) => {
  try {
    await callback();
  } catch (error) {
    console.error("Notification dispatch failed:", error);
  }
};

export const autoCancelUnpaidBookings = async () => {
  if (!AppDataSource.isInitialized) {
    return;
  }

  const now = new Date();
  const overduePendingBookings = await bookingRepository.find({
    where: {
      status: BOOKING_STATUS.PENDING,
      startDate: LessThanOrEqual(now),
    },
    relations: ["user", "payments"],
  });

  if (!overduePendingBookings.length) {
    return;
  }

  for (const booking of overduePendingBookings) {
    const hasSuccessfulPayment = booking.payments?.some(
      (payment) => payment.status === PAYMENT_STATUS.SUCCESS
    );

    if (hasSuccessfulPayment) {
      continue;
    }

    // Use bookingService to update status so vehicle condition syncs correctly
    const remark = booking.adminRemarks || AUTO_CANCEL_REMARK;
    await bookingService.updateBookingStatus(booking.id, BOOKING_STATUS.CANCELLED, remark);

    const pendingPayments = (booking.payments || []).filter(
      (payment) => payment.status === PAYMENT_STATUS.PENDING
    );

    if (pendingPayments.length) {
      pendingPayments.forEach((payment) => {
        payment.status = PAYMENT_STATUS.CANCELLED;
        payment.response = remark;
      });
      await paymentRepository.save(pendingPayments);
    }

    // Notify admins specifically (user notification already handled by bookingService)
    await safeNotify(() =>
      notificationService.createForAdmins({
        type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
        title: "Booking auto-cancelled",
        message: `Booking #${booking.id} was automatically cancelled because payment was not completed in time.`,
        data: {
          bookingId: booking.id,
          status: BOOKING_STATUS.CANCELLED,
          adminRemarks: remark,
          route: "/admin/bookings",
        },
      })
    );
  }
};

export const autoCompleteFinishedBookings = async () => {
  if (!AppDataSource.isInitialized) {
    return;
  }

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const finishedConfirmedBookings = await bookingRepository.find({
    where: {
      status: BOOKING_STATUS.CONFIRMED,
      // Complete only after the full end date has finished.
      endDate: LessThan(startOfToday),
    },
    relations: ["user"],
  });

  if (!finishedConfirmedBookings.length) {
    return;
  }

    for (const booking of finishedConfirmedBookings) {
      // Use bookingService to mark as completed so vehicle condition is cleared if appropriate
      await bookingService.updateBookingStatus(booking.id, BOOKING_STATUS.COMPLETED);

      // Notify admins about auto-completion (user notification handled in bookingService)
      await safeNotify(() =>
        notificationService.createForAdmins({
          type: NOTIFICATION_TYPE.BOOKING_STATUS_UPDATED,
          title: "Booking auto-completed",
          message: `Booking #${booking.id} was automatically marked as completed after the full booking end date passed.`,
          data: {
            bookingId: booking.id,
            status: BOOKING_STATUS.COMPLETED,
            route: "/admin/bookings",
          },
        })
      );
    }
};

const runBookingLifecycleJobs = async () => {
  await autoCancelUnpaidBookings();
  await autoCompleteFinishedBookings();
};

export const scheduleBookingAutoCancellation = () => {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;
  console.log("⏰ Booking lifecycle scheduler started (runs hourly)");

  void runBookingLifecycleJobs();

  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  const delayUntilNextHour = nextHour.getTime() - now.getTime();

  setTimeout(() => {
    void runBookingLifecycleJobs();

    setInterval(() => {
      void runBookingLifecycleJobs();
    }, ONE_HOUR_IN_MS);
  }, delayUntilNextHour);
};
