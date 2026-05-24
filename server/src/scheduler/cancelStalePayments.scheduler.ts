import AppDataSource from "../config/db.config";
import { PaymentEntity, PAYMENT_STATUS } from "../entities/payment.entity";

const ONE_HOUR_IN_MS = 60 * 60 * 1000;
let schedulerStarted = false;

export const cancelStalePendingPayments = async () => {
  if (!AppDataSource.isInitialized) return;

  const paymentRepo = AppDataSource.getRepository(PaymentEntity);
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

  const result = await paymentRepo
    .createQueryBuilder()
    .update(PaymentEntity)
    .set({
      status: PAYMENT_STATUS.CANCELLED,
      response: JSON.stringify({ reason: "auto-cancelled-stale", cancelledAt: new Date().toISOString() }),
    })
    .where("status = :status", { status: PAYMENT_STATUS.PENDING })
    .andWhere("created_at < :cutoff", { cutoff })
    .execute();

  const count = result.affected || 0;
  if (count > 0) {
    console.log(`Auto-cancelled ${count} stale pending payments`);
  }
};

export const scheduleCancelStalePayments = () => {
  if (schedulerStarted) return;
  schedulerStarted = true;
  console.log("⏰ Stale payment auto-cancel scheduler started (runs hourly)");

  void cancelStalePendingPayments();

  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  const delayUntilNextHour = nextHour.getTime() - now.getTime();

  setTimeout(() => {
    void cancelStalePendingPayments();
    setInterval(() => void cancelStalePendingPayments(), ONE_HOUR_IN_MS);
  }, delayUntilNextHour);
};
