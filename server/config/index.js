import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const bool = (v, fallback = false) =>
  v === undefined ? fallback : String(v).toLowerCase() === 'true';

/**
 * Demo values that are fine on a laptop and dangerous on the internet.
 * In production the app refuses to boot rather than silently running with
 * a JWT secret and admin password that are published in the repo.
 */
const INSECURE_JWT_SECRET = 'brilliance_care_dev_secret_change_me';
const INSECURE_ADMIN_PASSWORD = '123';

const config = {
  port: process.env.PORT || 5000,
  nodeEnv,
  isProduction,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brilliance_care',
  useMemoryDb: bool(process.env.USE_MEMORY_DB),

  /**
   * When the real database is unreachable, should the app start a throwaway
   * in-memory MongoDB so it still boots? Convenient while developing, actively
   * harmful in production — the app would look healthy and take real orders
   * into a database that disappears on the next restart. Forced off in
   * production regardless of what the environment says.
   */
  allowMemoryFallback: isProduction ? false : bool(process.env.ALLOW_MEMORY_FALLBACK, true),

  /**
   * Atlas M0 clusters idle down, and the first connection has to do an SRV DNS
   * lookup plus a TLS handshake — regularly longer than a few seconds from a
   * cold container. The old 4s was short enough to "fail" a healthy cluster.
   */
  dbServerSelectionTimeoutMs: Number(process.env.DB_SERVER_SELECTION_TIMEOUT_MS) || 15000,
  dbMaxPoolSize: Number(process.env.DB_MAX_POOL_SIZE) || 10,

  // Index builds are a startup cost and a footgun on a live cluster; create
  // them deliberately in production rather than on every boot.
  dbAutoIndex: bool(process.env.DB_AUTO_INDEX, !isProduction),

  // Auth
  jwtSecret: process.env.JWT_SECRET || INSECURE_JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Seeded admin account (powers the admin inventory panel)
  admin: {
    name: process.env.ADMIN_NAME || 'Store Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || INSECURE_ADMIN_PASSWORD,
  },
};

/**
 * Fail fast, at import time, on anything that would be a security hole in
 * production. Crashing on boot is loud and fixable; booting with the demo
 * credentials is silent and not.
 */
if (isProduction) {
  const problems = [];

  if (!process.env.JWT_SECRET || config.jwtSecret === INSECURE_JWT_SECRET) {
    problems.push('JWT_SECRET is missing or still the demo value — set a long random string.');
  } else if (config.jwtSecret.length < 32) {
    problems.push('JWT_SECRET is shorter than 32 characters — use a long random string.');
  }

  if (!process.env.ADMIN_PASSWORD || config.admin.password === INSECURE_ADMIN_PASSWORD) {
    problems.push('ADMIN_PASSWORD is missing or still the demo value ("123") — set a real one.');
  }

  if (config.useMemoryDb) {
    problems.push('USE_MEMORY_DB=true in production — that database is wiped on every restart.');
  }

  if (!process.env.MONGODB_URI) {
    problems.push('MONGODB_URI is not set — point it at your MongoDB Atlas cluster.');
  }

  if (problems.length) {
    console.error('\n❌ Refusing to start in production with an insecure configuration:\n');
    for (const p of problems) console.error(`   • ${p}`);
    console.error('\n   Fix these in the environment (see server/.env.example) and restart.\n');
    process.exit(1);
  }
}

export default config;
