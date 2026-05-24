const AppDataSource = require('../dist/config/db.config').default;

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('DB initialized for status check');
    const res = await AppDataSource.query("SELECT DISTINCT status FROM booking");
    console.log('Distinct booking statuses:', res);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Error querying booking statuses', err);
    process.exit(1);
  }
}

run();
