import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { seedDefaultAdmin } from './utils/seedHelper.js';
import { Lead } from './models/Lead.js';
import { Note } from './models/Note.js';
import { FollowUp } from './models/FollowUp.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB(config.mongodbUri);

    // Auto-seed initial admin account if not already present
    const defaultAdmin = await seedDefaultAdmin();
    console.log(`[Auth] Default admin initialized: ${defaultAdmin.email}`);


    const server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(` LeadFlow CRM API Server Running`);
      console.log(` Port:     ${config.port}`);
      console.log(` Mode:     ${config.nodeEnv}`);
      console.log(` Health:   http://localhost:${config.port}/api/health`);
      console.log(` Client:   ${config.clientUrl}`);
      console.log(`===============================================`);
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Closing HTTP server and database...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(`[Server Error] Startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
