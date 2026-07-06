import mongoose from 'mongoose';

/**
 * Establish connection to MongoDB database.
 * Designed to be modular and easy to integrate in production.
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillswap';
    
    // Check if URI is default/placeholder to warn developers
    if (mongoURI.includes('localhost') || !process.env.MONGODB_URI) {
      console.warn('⚠️ Warning: MONGODB_URI not specified in environment. Using fallback local database.');
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🔌 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Database connection error: ${error.message}`);
    // Exiting the process with failure in production is standard behavior
    process.exit(1);
  }
};

export default connectDB;
