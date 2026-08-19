import config from './config/index.js';
import app from './app.js';
import { connectDB, isMemoryDb } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

async function start() {
  await connectDB();
  await seedDatabase();

  app.listen(config.port, () => {
    console.log(`\n🚀 Brilliance Care API running on port ${config.port} (${config.nodeEnv})`);

    if (config.isProduction) {
      // Never print credentials in production — startup logs are collected and
      // retained by the host, and the admin login is the whole store.
      console.log(`   Admin login: ${config.admin.email}\n`);
      return;
    }

    console.log(`   Health:   http://localhost:${config.port}/api/health`);
    console.log(`   Products: http://localhost:${config.port}/api/products`);
    console.log(`   Admin:    ${config.admin.email} / ${config.admin.password}`);
    if (isMemoryDb()) {
      console.log('   ⚠️  Using a THROWAWAY in-memory database — data resets on restart.');
    }
    console.log('');
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err.message || err);
  process.exit(1);
});
