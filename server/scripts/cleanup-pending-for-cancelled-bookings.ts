import AppDataSource from "../src/config/db.config";
import { PaymentEntity, PAYMENT_STATUS } from "../src/entities/payment.entity";
import { BOOKING_STATUS } from "../src/entities/booking.entity";

async function main() {
  const apply = process.argv.includes("--apply");
  await AppDataSource.initialize();
  const paymentRepo = AppDataSource.getRepository(PaymentEntity);

  console.log("Finding pending payments whose booking is already cancelled...");

  const rows = await paymentRepo
    .createQueryBuilder("payment")
    .leftJoinAndSelect("payment.booking", "booking")
    .where("payment.status = :status", { status: PAYMENT_STATUS.PENDING })
    .andWhere("booking.status = :bstatus", { bstatus: BOOKING_STATUS.CANCELLED })
    .select(["payment.id", "payment.amount", "booking.id", "booking.status"])
    .getRawMany();

  console.log(`Found ${rows.length} pending payments linked to cancelled bookings`);
  if (rows.length > 0) console.table(rows);

  if (!apply) {
    console.log("Dry-run mode. To apply changes run with --apply flag.");
    await AppDataSource.destroy();
    process.exit(0);
  }

  console.log("Applying updates: marking these payments as Cancelled...");

  // Update using query builder
  const ids = rows.map((r: any) => r.payment_id || r.paymentId || r.paymentId);

  if (!ids.length) {
    console.log("No ids to update.");
    await AppDataSource.destroy();
    return;
  }

  // Use raw SQL update for simplicity
  await paymentRepo
    .createQueryBuilder()
    .update()
    .set({ status: PAYMENT_STATUS.CANCELLED, response: JSON.stringify({ reason: "booking_cancelled_migration", cancelledAt: new Date().toISOString() }) })
    .whereInIds(ids)
    .execute();

  console.log(`Updated ${ids.length} payments to status ${PAYMENT_STATUS.CANCELLED}`);

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
