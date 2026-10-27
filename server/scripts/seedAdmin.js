import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDefaultAdmin } from '../src/utils/seedHelper.js';
import { config } from '../src/config/env.js';

const run = async () => {
  try {
    await connectDB(config.mongodbUri);
    const admin = await seedDefaultAdmin();
    console.log(`[Seed] Admin ready:`);
    console.log(`Email:    ${admin.email}`);
    console.log(`Password: ${config.defaultAdmin.password}`);
    console.log(`Role:     ${admin.role}`);
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

run();
