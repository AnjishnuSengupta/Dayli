// Load environment variables at the top
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

// Server-side should use regular env variables, not VITE_ prefixed ones
const MONGODB_URI = process.env.MONGODB_URI || process.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/dayli-dev';

interface Connection {
  isConnected?: number;
}

const connection: Connection = {};

async function connectToDatabase() {
  if (connection.isConnected) {
    console.log('✅ Already connected to MongoDB');
    return;
  }

  // Debug: Log the MongoDB URI (without password for security)
  const uriForLog = MONGODB_URI.includes('mongodb+srv://') 
    ? 'MongoDB Atlas (connection string hidden for security)'
    : MONGODB_URI;
  console.log('🔗 Connecting to:', uriForLog);

  try {
    const db = await mongoose.connect(MONGODB_URI);
    connection.isConnected = db.connections[0].readyState;
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📊 Database:', db.connection.name);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase;
export { mongoose };
