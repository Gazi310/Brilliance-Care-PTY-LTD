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
import { dayFromToday, dayMeta, DELIVERY_SCOPES } from './delivery.js';

/**
 * Opens a sensible starter set of delivery slots so the calendars aren't empty
 * on first run: morning + afternoon on the next few upcoming weekdays, for each
 * scope (shop / laundry / cleaning). Admins adjust everything from the admin
 * pages; slots are otherwise occupied by default.
 */
async function seedDeliverySlots(force = false) {
  if (force) await DeliverySlot.deleteMany({});

  // Backfill: tag any legacy (pre-scope) records as the shop calendar so the
  // new scoped queries still find them. Cheap no-op once every record is tagged.
  await DeliverySlot.updateMany({ scope: { $exists: false } }, { $set: { scope: 'shop' } });

  if (!force && (await DeliverySlot.countDocuments()) > 0) return;

  const open = [];
  for (const scope of DELIVERY_SCOPES) {
    let added = 0;
    for (let i = 1; i <= 14 && added < 6; i += 1) {
      const m = dayMeta(dayFromToday(i));
      if (m.isWeekend) continue; // weekdays only for the demo set
      open.push({ scope, date: m.date, window: 'morning', available: true });
      open.push({ scope, date: m.date, window: 'afternoon', available: true });
      added += 2;
    }
  }
  if (open.length) {
    await DeliverySlot.insertMany(open);
    console.log(`🚚 Seeded ${open.length} open delivery slots across ${DELIVERY_SCOPES.length} scopes`);
  }
}

/** A stored `image` that points at a real file rather than an emoji. */
const isPhotoPath = (img) =>
  typeof img === 'string' &&
  (/^https?:\/\//.test(img) || img.startsWith('data:') || img.startsWith('/'));

/**
 * Backfills the seed photos onto catalogue rows that were inserted before the
 * seed had any (they shipped with emoji placeholders). Matched by name, since
 * the seed carries no stable id.
 *
 * Deliberately conservative: a row is only touched when its current image is
 * still an emoji/blank, so a photo an admin uploaded or pasted from the panel is
 * never clobbered on the next server restart. Once every row holds a photo this
 * is one read per boot and no writes.
 *
 * Shared by all three catalogues (shop / laundry / cleaning) — every model stores
 * `image` the same way, so the only difference is which collection to walk.
 * Seed entries still holding an emoji are skipped, so a catalogue can be photo'd
 * one item at a time.
 */
async function backfillPhotos(Model, seed, label) {
  const withPhotos = seed.filter((s) => isPhotoPath(s.image));
  if (!withPhotos.length) return;

  const rows = await Model.find({ name: { $in: withPhotos.map((s) => s.name) } })
    .select('name image')
    .lean();

  const ops = [];
  for (const row of rows) {
    if (isPhotoPath(row.image)) continue; // admin-set or already backfilled
    const seeded = withPhotos.find((s) => s.name === row.name);
    if (seeded) ops.push({ updateOne: { filter: { _id: row._id }, update: { $set: { image: seeded.image } } } });
  }

  if (ops.length) {
    await Model.bulkWrite(ops);
    console.log(`🖼️  Backfilled photos onto ${ops.length} ${label} services`);
  }
}

/**
 * Ensures the admin account and product catalog exist.
 * Runs automatically on startup. Pass { force: true } to wipe and reseed products.
 */
export async function seedDatabase({ force = false } = {}) {
  // --- Admin user ---
  // Created rather than upserted because the password has to go through the
  // model's pre-save hash hook. Two instances booting together can both find
  // nothing and both insert; the loser gets a duplicate-key error on the
  // unique email index, which just means the account already exists.
  let admin = await User.findOne({ email: config.admin.email });
  if (!admin) {
    try {
      admin = await User.create({
        name: config.admin.name,
        email: config.admin.email,
        password: config.admin.password,
        isAdmin: true,
      });
      console.log(
        config.isProduction
          ? `👤 Admin account created → ${config.admin.email}`
          : `👤 Admin account ready → ${config.admin.email} / ${config.admin.password}`
      );
    } catch (err) {
      if (err?.code !== 11000) throw err;
      admin = await User.findOne({ email: config.admin.email });
    }
  }

  // --- Products ---
  if (force) await Product.deleteMany({});
  const count = await Product.countDocuments();
  if (force || count === 0) {
    await Product.insertMany(productSeed);
    console.log(`📦 Seeded ${productSeed.length} products`);
  } else {
    await backfillPhotos(Product, productSeed, 'shop');
  }

  // --- Laundry services ---
  if (force) await LaundryService.deleteMany({});
  const laundryCount = await LaundryService.countDocuments();
  if (force || laundryCount === 0) {
    await LaundryService.insertMany(laundrySeed);
    console.log(`🧺 Seeded ${laundrySeed.length} laundry services`);
  } else {
    await backfillPhotos(LaundryService, laundrySeed, 'laundry');
  }

  // --- Cleaning services ---
  if (force) await CleaningService.deleteMany({});
  const cleaningCount = await CleaningService.countDocuments();
  if (force || cleaningCount === 0) {
    await CleaningService.insertMany(cleaningSeed);
    console.log(`🫧 Seeded ${cleaningSeed.length} cleaning services`);
  } else {
    await backfillPhotos(CleaningService, cleaningSeed, 'cleaning');
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
