const AppDataSource = require('../dist/config/db.config').default;

async function run() {
  const clearInvalidPhones = String(process.env.CLEAR_INVALID_PHONES || '').toLowerCase() === 'true';

  try {
    await AppDataSource.initialize();
    console.log('DB initialized for phone cleanup');

    const invalidUsers = await AppDataSource.query(
      "SELECT id, name, phonenumber FROM users WHERE phonenumber IS NOT NULL AND phonenumber !~ '^9[678][0-9]{8}$'"
    );

    console.log(`Found ${invalidUsers.length} users with invalid phone numbers`);
    invalidUsers.forEach((user) => {
      console.log(`- id=${user.id}, name=${user.name}, phone=${user.phonenumber}`);
    });

    if (clearInvalidPhones && invalidUsers.length > 0) {
      await AppDataSource.query(
        "UPDATE users SET phonenumber = NULL WHERE phonenumber IS NOT NULL AND phonenumber !~ '^9[678][0-9]{8}$'"
      );
      console.log('Invalid phone numbers were cleared');
    } else {
      console.log('Set CLEAR_INVALID_PHONES=true to null out invalid phone numbers');
    }

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error during invalid phone cleanup', error);
    process.exit(1);
  }
}

run();