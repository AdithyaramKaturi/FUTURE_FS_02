import { connectDB, disconnectDB } from '../src/config/db.js';
import { Lead } from '../src/models/Lead.js';
import { Note } from '../src/models/Note.js';
import { FollowUp } from '../src/models/FollowUp.js';
import { config } from '../src/config/env.js';

const clearDatabase = async () => {
  try {
    await connectDB(config.mongodbUri);

    const [deletedLeads, deletedNotes, deletedFollowUps] = await Promise.all([
      Lead.deleteMany({}),
      Note.deleteMany({}),
      FollowUp.deleteMany({})
    ]);

    console.log(`[Clear] Removed ${deletedLeads.deletedCount} leads`);
    console.log(`[Clear] Removed ${deletedNotes.deletedCount} notes`);
    console.log(`[Clear] Removed ${deletedFollowUps.deletedCount} follow-ups`);
    console.log('[Clear] Database is now completely clean and empty (admin preserved).');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Clear Error]', error);
    process.exit(1);
  }
};

clearDatabase();
