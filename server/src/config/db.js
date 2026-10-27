import mongoose from 'mongoose';

/**
 * Connect to MongoDB database
 * @param {string} uri - MongoDB connection string
 * @returns {Promise<typeof mongoose>}
 */
export const connectDB = async (uri) => {
  const connectionUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leadflow-crm';

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect to MongoDB: ${error.message}`);
    console.error('Make sure MongoDB service is running or check your MONGODB_URI in .env');
    throw error;
  }
};

/**
 * Disconnect from MongoDB (useful for test teardown)
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB connection closed');
  } catch (error) {
    console.error(`[Database Error] Failed to close connection: ${error.message}`);
  }
};
