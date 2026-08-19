// Seed catalog for Brilliance Care — laundry, cleaning and eco-friendly care products.
//
// `image` is a root-relative URL into the client's `public/images/products/`
// folder, matching the laundry and cleaning catalogues — see the note in
// laundrySeed.js for why these are public/ URLs and not `src/assets` imports.
// ProductCard and ProductGallery both treat a leading-slash string as a photo.
//
// A new product may still be added with an emoji placeholder — the cards fall
// back to it cleanly, and seed.js's photo backfill skips emoji entries — but as
// of now every seeded product has a real shot.
export const products = [
  {
    name: 'Lavender Bloom Laundry Detergent',
    description: 'Concentrated plant-derived formula that lifts stains and leaves a calming lavender scent. 40 washes.',
    category: 'Laundry',
    price: 14.99,
    image: '/images/products/lavender-bloom-detergent.webp',
    stock: 40,
    rating: 4.8,
  },
  {
    name: 'Fresh Breeze Fabric Softener',
    description: 'Silky-soft fibres and long-lasting freshness with a gentle, skin-friendly conditioner.',
    category: 'Laundry',
    price: 9.99,
    image: '/images/products/fresh-breeze-fabric-softener.webp',
    stock: 32,
    rating: 4.6,
  },
  {
    name: 'OxyBoost Stain Remover Spray',
    description: 'Fast-acting oxygen power that tackles wine, grass and grease before the wash.',
    category: 'Laundry',
    price: 11.5,
    image: '/images/products/oxyboost-stain-remover.webp',
    stock: 25,
    rating: 4.7,
  },
  {
    name: 'Wool & Delicates Gentle Wash',
    description: 'pH-balanced care for wool, silk and activewear — keeps delicate fibres soft and intact.',
    category: 'Laundry',
    price: 13.25,
    image: '/images/products/wool-delicates-gentle-wash.webp',
    stock: 18,
    rating: 4.5,
  },
  {
    name: 'Premium Scent Booster Beads',
    description: 'In-wash beads that lock in up to 12 weeks of fresh fragrance between laundry days.',
    category: 'Laundry',
    price: 15.49,
    image: '/images/products/premium-scent-booster-beads.webp',
    stock: 22,
    rating: 4.9,
  },
  {
    name: 'All-Purpose Surface Cleaner',
    description: 'Streak-free multi-surface spray that cuts through grime on counters, tiles and glass.',
    category: 'Cleaning',
    price: 7.99,
    image: '/images/products/all-purpose-surface-cleaner.webp',
    stock: 50,
    rating: 4.6,
  },
  {
    name: 'Citrus Sparkle Glass Cleaner',
    description: 'Ammonia-free citrus formula for crystal-clear windows, mirrors and screens.',
    category: 'Cleaning',
    price: 6.5,
    image: '/images/products/citrus-sparkle-glass-cleaner.webp',
    stock: 36,
    rating: 4.4,
  },
  {
    name: 'Antibacterial Floor Cleaner',
    description: 'Kills 99.9% of germs while leaving sealed floors gleaming and freshly scented.',
    category: 'Cleaning',
    price: 10.99,
    image: '/images/products/antibacterial-floor-cleaner.webp',
    stock: 28,
    rating: 4.7,
  },
  {
    name: 'Bathroom Descaler Gel',
    description: 'Thick clinging gel that dissolves limescale and soap scum from taps and tiles.',
    category: 'Cleaning',
    price: 8.75,
    image: '/images/products/bathroom-descaler-gel.webp',
    stock: 20,
    rating: 4.5,
  },
  {
    name: 'Eco Bamboo Dryer Balls (Set of 6)',
    description: 'Reusable wool-bamboo balls that cut drying time and soften loads — no chemicals.',
    category: 'Eco-Friendly',
    price: 19.99,
    image: '/images/products/eco-bamboo-dryer-balls.webp',
    stock: 15,
    rating: 4.9,
  },
  {
    name: 'Plant-Based Dish Soap',
    description: 'Biodegradable, grease-cutting dish liquid that is kind to hands and waterways.',
    category: 'Eco-Friendly',
    price: 5.99,
    image: '/images/products/plant-based-dish-soap.webp',
    stock: 44,
    rating: 4.6,
  },
  {
    name: 'Microfiber Cleaning Cloths (10-Pack)',
    description: 'Ultra-absorbent, lint-free cloths for polishing, dusting and everyday wipe-downs.',
    category: 'Accessories',
    price: 12.0,
    image: '/images/products/microfiber-cloths.webp',
    stock: 30,
    rating: 4.8,
  },
];
