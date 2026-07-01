import config from '../config/index.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import DeliverySlot from '../models/DeliverySlot.js';
import LaundryService from '../models/LaundryService.js';
import CleaningService from '../models/CleaningService.js';
import Settings from '../models/Settings.js';
import { products as productSeed } from '../data/seedData.js';
import { laundryServices as laundrySeed } from '../data/laundrySeed.js';
import { cleaningServices as cleaningSeed } from '../data/cleaningSeed.js';
import { dayFromToday, dayMeta } from './delivery.js';

/**
 * Opens a sensible starter set of delivery slots so the calendar isn't empty
 * on first run: morning + afternoon on the next 3 upcoming weekdays. Admins can
 * adjust everything from the dropdown; slots are otherwise occupied by default.
 */
async function seedDeliverySlots(force = false) {
  if (force) await DeliverySlot.deleteMany({});
  if (!force && (await DeliverySlot.countDocuments()) > 0) return;

  const open = [];
  for (let i = 1; i <= 14 && open.length < 6; i += 1) {
    const m = dayMeta(dayFromToday(i));
    if (m.isWeekend) continue; // weekdays only for the demo set
    open.push({ date: m.date, window: 'morning', available: true });
    open.push({ date: m.date, window: 'afternoon', available: true });
  }
  if (open.length) {
    await DeliverySlot.insertMany(open);
    console.log(`🚚 Seeded ${open.length} open delivery slots`);
  }
}

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

  // --- Laundry services ---
  if (force) await LaundryService.deleteMany({});
  const laundryCount = await LaundryService.countDocuments();
  if (force || laundryCount === 0) {
    await LaundryService.insertMany(laundrySeed);
    console.log(`🧺 Seeded ${laundrySeed.length} laundry services`);
  }

  // --- Cleaning services ---
  if (force) await CleaningService.deleteMany({});
  const cleaningCount = await CleaningService.countDocuments();
  if (force || cleaningCount === 0) {
    await CleaningService.insertMany(cleaningSeed);
    console.log(`🫧 Seeded ${cleaningSeed.length} cleaning services`);
  }

  // --- Store settings (delivery fee) ---
  if (force) await Settings.deleteMany({});
  if ((await Settings.countDocuments()) === 0) {
    await Settings.create({ key: 'global', deliveryFee: 9.99 });
    console.log('⚙️  Seeded store settings (delivery fee $9.99)');
  }

  // --- Delivery slots ---
  await seedDeliverySlots(force);
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
