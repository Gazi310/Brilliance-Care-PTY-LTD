import config from '../config/index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { products as productSeed } from '../data/seedData.js';

/**
 * Ensures the admin account and product catalog exist.
 * Runs automatically on startup. Pass { force: true } to wipe and reseed products.
 */
export async function seedDatabase({ force = false } = {}) {
  // --- Admin user ---
  let admin = await User.findOne({ email: config.admin.email });
  if (!admin) {
    admin = await User.create({
      name: config.admin.name,
      email: config.admin.email,
      password: config.admin.password,
      isAdmin: true,
    });
    console.log(`👤 Admin account ready → ${config.admin.email} / ${config.admin.password}`);
  }

  // --- Products ---
  if (force) await Product.deleteMany({});
  const count = await Product.countDocuments();
  if (force || count === 0) {
    await Product.insertMany(productSeed);
    console.log(`📦 Seeded ${productSeed.length} products`);
  }
}

// Allow running directly:  npm run seed   (force-reseeds the configured database)
const isDirectRun = process.argv[1] && process.argv[1].endsWith('seed.js');
if (isDirectRun) {
  const { connectDB, disconnectDB } = await import('../config/db.js');
  await connectDB();
  await seedDatabase({ force: true });
  console.log('✅ Seed complete');
  await disconnectDB();
  process.exit(0);
}
