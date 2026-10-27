import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  mongodbUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leadflow-crm',
  jwtSecret: process.env.JWT_SECRET || 'leadflow_fallback_secret_change_me_in_prod',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  defaultAdmin: {
    name: process.env.DEFAULT_ADMIN_NAME || 'LeadFlow Admin',
    email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@leadflow.io',
    password: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456'
  }
};
