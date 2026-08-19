// Starter catalogue of laundry services Brilliance Care offers.
// Admins can add/edit/remove these and swap the photos from the panel.
//
// `image` holds a root-relative URL into the client's `public/images/laundry/`
// folder, which Vite copies to the site root verbatim. It deliberately is NOT a
// `src/assets` import: this value lives in MongoDB and is admin-editable, so it
// has to be a plain string the browser can resolve at runtime rather than a
// hashed bundle path resolved at build time. Both service cards already treat a
// leading-slash string as a photo (see `isPhoto` in LaundryServiceCard /
// LaundryServiceInfo), so no component changes are needed.
export const laundryServices = [
  {
    name: 'Wash & Fold',
    description:
      'Your everyday laundry, sorted end to end. We sort colours from whites, wash each load on the right cycle, tumble dry, then neatly fold and package everything ready to go straight into the drawer. Ideal for weekly household washing, towels, sheets and workwear — cleaned with gentle, eco-friendly detergents as standard, with fabric softener on request.',
    price: 24.99,
    image: '/images/laundry/wash-and-fold.webp',
    unit: 'per load',
    turnaround: '48h',
    sort: 1,
  },
  {
    name: 'Ironing & Pressing',
    description:
      'Crisp, wrinkle-free finishes without you ever lifting an iron. Each garment is professionally pressed and returned on a hanger or neatly folded — perfect for business shirts, trousers, dresses, linen and uniforms. Add it to a Wash & Fold order, or send items you have already washed at home and just need pressed.',
    price: 3.5,
    image: '/images/laundry/ironing-and-pressing.webp',
    unit: 'per item',
    turnaround: '48h',
    sort: 2,
  },
  {
    name: 'Dry Cleaning',
    description:
      'Gentle, solvent-based cleaning for garments that cannot go through a normal wash. Suits, blazers, coats, formalwear and "dry clean only" pieces are treated with care, spot-cleaned where needed, then pressed and returned fresh on hangers. We inspect every item first and flag any stains or delicate trims before we begin.',
    price: 8.99,
    image: '/images/laundry/dry-cleaning.webp',
    unit: 'per item',
    turnaround: '72h',
    sort: 3,
  },
  {
    name: 'Duvet & Bedding',
    description:
      'A proper deep clean for the bulky items that never quite fit your machine at home. We wash and thoroughly dry duvets, doonas, comforters, pillows and heavy bed linen, refreshing them while lifting dust, odours and allergens. Returned fluffy, fully dry and packaged — a great seasonal refresh for the bedroom.',
    price: 29.99,
    image: '/images/laundry/duvet-and-bedding.webp',
    unit: 'per item',
    turnaround: '72h',
    sort: 4,
  },
  {
    name: 'Delicates & Silk',
    description:
      'Specialist, careful handling for your finest pieces. Silk, wool, lace, cashmere and embellished garments are hand-treated with gentle products and low-impact drying to protect the fabric, shape and colour. The right choice whenever the care label says "handle with care" and an ordinary wash simply will not do.',
    price: 12.5,
    image: '/images/laundry/delicates-and-silk.webp',
    unit: 'per item',
    turnaround: '72h',
    sort: 5,
  },
  {
    name: 'Express 24h Wash',
    description:
      'In a hurry? Your wash, dry and fold returned within 24 hours of pickup. It is the same careful cleaning as our standard Wash & Fold, just fast-tracked to the front of the queue — perfect for last-minute trips, events or a hectic week. Subject to slot availability in your area.',
    price: 34.99,
    image: '/images/laundry/express-24h-wash.webp',
    unit: 'per load',
    turnaround: '24h',
    sort: 6,
  },
];
