import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDefaultAdmin, seedDemoDatabase } from '../src/utils/seedHelper.js';
import { config } from '../src/config/env.js';

const run = async () => {
  try {
    await connectDB(config.mongodbUri);
    const admin = await seedDefaultAdmin();
    console.log(`[Seed] Seeding demo leads, notes, and follow-ups for admin: ${admin.email}...`);
    const result = await seedDemoDatabase(admin);
    console.log(`[Seed] ${result.message}`);
    await disconnectDB();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

run();
