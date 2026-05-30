import AppDataSource from "../src/config/db.config";
import { PaymentEntity, PAYMENT_STATUS } from "../src/entities/payment.entity";

async function main() {
  const apply = process.argv.includes("--apply");
  await AppDataSource.initialize();
  const paymentRepo = AppDataSource.getRepository(PaymentEntity);

  const duplicates = await paymentRepo
    .createQueryBuilder("payment")
    .select("payment.bookingId", "bookingId")
    .addSelect("COUNT(*)", "count")
    .addSelect("ARRAY_AGG(payment.id ORDER BY payment.createdAt DESC)", "paymentIds")
    .where("payment.status = :status", { status: PAYMENT_STATUS.PENDING })
    .groupBy("payment.bookingId")
    .having("COUNT(*) > 1")
    .getRawMany();

  console.log(`Found ${duplicates.length} bookings with duplicate pending payments`);
  if (duplicates.length === 0) {
    await AppDataSource.destroy();
    return;
  }

  for (const dup of duplicates) {
    // paymentIds is an array with newest first due to ORDER BY
    const ids: number[] = dup.paymentIds;
    const keep = ids[0];
    const toCancel = ids.slice(1);

    console.log(`Booking ${dup.bookingId}: keeping ${keep}, cancelling ${toCancel.length} payments`);
    if (toCancel.length && apply) {
      await paymentRepo
        .createQueryBuilder()
        .update()
        .set({ status: PAYMENT_STATUS.CANCELLED, response: JSON.stringify({ reason: "duplicate_cleanup", cancelledAt: new Date().toISOString() }) })
        .whereInIds(toCancel)
        .execute();

      console.log(`Cancelled ${toCancel.length} payments for booking ${dup.bookingId}`);
    }
  }

  if (!apply) console.log("Dry-run complete. Rerun with --apply to perform updates.");

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
