import AppDataSource from "../src/config/db.config";

async function main() {
  await AppDataSource.initialize();

  // Postgres partial unique index: only one pending payment per booking
  const query = `CREATE UNIQUE INDEX IF NOT EXISTS ux_payment_one_pending_per_booking ON payment ("bookingId") WHERE status = 'Pending'`;

  await AppDataSource.query(query);
  console.log("Created partial unique index ux_payment_one_pending_per_booking (if not exists)");

  await AppDataSource.destroy();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
