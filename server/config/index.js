import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  // Database
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brilliance_care',
  useMemoryDb: String(process.env.USE_MEMORY_DB).toLowerCase() === 'true',

  // Auth
  jwtSecret: process.env.JWT_SECRET || 'brilliance_care_dev_secret_change_me',
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Seeded admin account (powers the admin inventory panel)
  admin: {
    name: process.env.ADMIN_NAME || 'Store Admin',
    email: (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
    password: process.env.ADMIN_PASSWORD || '123',
  },
};

export default config;
