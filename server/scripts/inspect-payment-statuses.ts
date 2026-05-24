import AppDataSource from "../src/config/db.config";
import { PaymentEntity } from "../src/entities/payment.entity";

async function main() {
  await AppDataSource.initialize();
  const paymentRepo = AppDataSource.getRepository(PaymentEntity);

  const statuses = await paymentRepo
    .createQueryBuilder("payment")
    .select("payment.status", "status")
    .distinct(true)
    .getRawMany();

  console.log("Distinct payment statuses:");
  console.table(statuses.map((r) => r.status));

  const counts = await paymentRepo
    .createQueryBuilder("payment")
    .select("payment.status", "status")
    .addSelect("COUNT(*)", "count")
    .groupBy("payment.status")
    .getRawMany();

  console.log("Counts by status:");
  console.table(counts);

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
