import mongoose from 'mongoose';
import config from './index.js';

let memoryServer = null;

/**
 * Connect to MongoDB.
 * - If USE_MEMORY_DB=true, spin up a throwaway in-memory MongoDB (zero setup).
 * - Otherwise connect to MONGODB_URI, and if that is unreachable, gracefully
 *   fall back to the in-memory database so the app always boots.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);

  if (config.useMemoryDb) {
    return startMemoryDb();
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`⚠️  Could not reach MongoDB at ${config.mongoUri} (${err.message}).`);
    console.warn('   Falling back to an in-memory database so the app still runs.');
    console.warn('   For persistent storage, set USE_MEMORY_DB=false and a valid MONGODB_URI.');
    return startMemoryDb();
  }
}

async function startMemoryDb() {
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  const conn = await mongoose.connect(uri);
  console.log('✅ In-memory MongoDB started (data resets when the server stops).');
  return conn;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
