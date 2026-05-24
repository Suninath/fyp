import AppDataSource from "../src/config/db.config";
import { PaymentEntity } from "../src/entities/payment.entity";

async function main() {
  await AppDataSource.initialize();
  const paymentRepo = AppDataSource.getRepository(PaymentEntity);

  const duplicates = await paymentRepo
    .createQueryBuilder("payment")
    .select("payment.bookingId", "bookingId")
    .addSelect("COUNT(*)", "count")
    .addSelect("COALESCE(SUM(payment.amount),0)", "totalAmount")
    .addSelect("ARRAY_AGG(payment.id)", "paymentIds")
    .where("payment.status = :status", { status: "Pending" })
    .groupBy("payment.bookingId")
    .having("COUNT(*) > 1")
    .getRawMany();

  console.log(`Found ${duplicates.length} bookings with duplicate pending payments`);
  if (duplicates.length > 0) console.table(duplicates);

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
