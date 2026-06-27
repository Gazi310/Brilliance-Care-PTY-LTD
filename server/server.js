import config from './config/index.js';
import app from './app.js';
import { connectDB } from './config/db.js';
import { seedDatabase } from './utils/seed.js';

async function start() {
  await connectDB();
  await seedDatabase();

  app.listen(config.port, () => {
    console.log(`\n🚀 Brilliance Care API running on http://localhost:${config.port}`);
    console.log(`   Health:   http://localhost:${config.port}/api/health`);
    console.log(`   Products: http://localhost:${config.port}/api/products`);
    console.log(`   Admin:    ${config.admin.email} / ${config.admin.password}\n`);
  });
}

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
