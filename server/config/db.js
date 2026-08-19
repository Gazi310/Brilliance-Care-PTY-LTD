import mongoose from 'mongoose';
import config from './index.js';

let memoryServer = null;

/** Strip the password out of a connection string before it reaches a log. */
export function redactUri(uri) {
  return String(uri).replace(/\/\/([^:/@]+):([^@]+)@/, '//$1:****@');
}

/**
 * Connect to MongoDB.
 *
 * - USE_MEMORY_DB=true spins up a throwaway in-memory MongoDB (zero setup, dev only).
 * - Otherwise connect to MONGODB_URI.
 *
 * If the real database is unreachable the behaviour depends on the environment.
 * In development we fall back to the in-memory database so you are not blocked.
 * In production we throw, because the alternative — booting a healthy-looking
 * app on top of a database that is wiped on the next restart — means silently
 * accepting real customer orders into nothing. A crash-loop is recoverable;
 * lost orders are not.
 */
export async function connectDB() {
  mongoose.set('strictQuery', true);
  mongoose.set('autoIndex', config.dbAutoIndex);

  if (config.useMemoryDb) {
    if (config.isProduction) {
      // config/index.js already refuses to start in this state; belt and braces.
      throw new Error('USE_MEMORY_DB=true is not allowed in production.');
    }
    return startMemoryDb();
  }

  try {
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: config.dbServerSelectionTimeoutMs,
      maxPoolSize: config.dbMaxPoolSize,
    });
    attachConnectionLogging();
    console.log(`✅ MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    if (!config.allowMemoryFallback) {
      console.error(`\n❌ Could not reach MongoDB at ${redactUri(config.mongoUri)}`);
      console.error(`   ${err.message}\n`);
      console.error('   Common causes: wrong password (URL-encode special characters),');
      console.error('   the database user lacks read/write, or this host\'s IP is not in');
      console.error('   Atlas → Network Access.\n');
      console.error('   Not starting. Refusing to fall back to a throwaway in-memory');
      console.error('   database, which would accept real orders and then lose them.\n');
      throw err;
    }

    console.warn(`⚠️  Could not reach MongoDB at ${redactUri(config.mongoUri)} (${err.message}).`);
    console.warn('   Falling back to an in-memory database so the app still runs.');
    console.warn('   THIS DATA IS THROWAWAY — it resets when the server stops.');
    console.warn('   Set ALLOW_MEMORY_FALLBACK=false to make this a hard failure instead.');
    return startMemoryDb();
  }
}

async function startMemoryDb() {
  let MongoMemoryServer;
  try {
    ({ MongoMemoryServer } = await import('mongodb-memory-server'));
  } catch {
    throw new Error(
      'mongodb-memory-server is not installed (it is a devDependency). ' +
        'Set USE_MEMORY_DB=false and provide a real MONGODB_URI, or run `npm install` ' +
        'with dev dependencies included.'
    );
  }
  memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  const conn = await mongoose.connect(uri);
  attachConnectionLogging();
  console.log('✅ In-memory MongoDB started (data resets when the server stops).');
  return conn;
}

/**
 * Atlas fails over between replica set members from time to time; the driver
 * reconnects on its own, but without this the only symptom is a few seconds of
 * slow requests and nothing in the log to explain them.
 */
let loggingAttached = false;
function attachConnectionLogging() {
  if (loggingAttached) return;
  loggingAttached = true;
  mongoose.connection.on('error', (err) => console.error(`❌ MongoDB error: ${err.message}`));
  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected'));
  mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));
}

/** True when the live connection is the throwaway in-memory one. */
export function isMemoryDb() {
  return memoryServer !== null;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
