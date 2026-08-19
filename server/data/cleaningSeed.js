// Starter catalogue of cleaning services Brilliance Care offers.
// Admins can add/edit/remove these and swap the photos from the panel.
//
// `image` is a root-relative URL into the client's `public/images/cleaning/`
// folder, matching the laundry catalogue — see the note in laundrySeed.js for
// why these are public/ URLs and not `src/assets` imports. CleaningServiceCard
// and the booking-step `Thumb` both treat a leading-slash string as a photo, so
// no component changes are needed.
//
// Pricing model (see CleaningService.js):
//  - 'home' services: price = 1 bed / 1 bath base; + perBedroom / + perBathroom.
//  - 'flat' services: price per unit (visit / room).
//  - isAddon: offered as extras on top of a main clean in the booking flow.
export const cleaningServices = [
  {
    name: 'Standard Home Clean',
    description: 'Regular top-to-bottom tidy — dusting, floors, kitchen and bathrooms.',
    price: 89.0,
    image: '/images/cleaning/standard-home-clean.webp',
    unit: 'per visit',
    duration: '2h',
    sort: 1,
    pricingMode: 'home',
    perBedroom: 25.0,
    perBathroom: 20.0,
  },
  {
    name: 'Deep Cleaning',
    description: 'Intensive detail clean of every room, skirting boards, fixtures and more.',
    price: 169.0,
    image: '/images/cleaning/deep-cleaning.webp',
    unit: 'per visit',
    duration: '4h',
    sort: 2,
    pricingMode: 'home',
    perBedroom: 45.0,
    perBathroom: 35.0,
  },
  {
    name: 'End of Lease / Bond Clean',
    description: 'Get your full bond back — a thorough move-out clean to agent standard.',
    price: 299.0,
    image: '/images/cleaning/end-of-lease.webp',
    unit: 'per visit',
    duration: '6h',
    sort: 3,
    pricingMode: 'home',
    perBedroom: 60.0,
    perBathroom: 45.0,
  },
  {
    name: 'Office & Commercial',
    description: 'Workspaces, desks, kitchens and washrooms kept spotless for your team.',
    price: 129.0,
    image: '/images/cleaning/office-and-commercial.webp',
    unit: 'per visit',
    duration: '3h',
    sort: 4,
    pricingMode: 'flat',
  },
  {
    name: 'Carpet Steam Clean',
    description: 'Hot-water extraction that lifts deep stains, dust and odours from carpets.',
    price: 39.0,
    image: '/images/cleaning/carpet-steam-clean.webp',
    unit: 'per room',
    duration: '1h',
    sort: 5,
    pricingMode: 'flat',
    isAddon: true,
  },
  {
    name: 'Window Cleaning',
    description: 'Streak-free interior and exterior glass, frames and sills left sparkling.',
    price: 79.0,
    image: '/images/cleaning/window-cleaning.webp',
    unit: 'per visit',
    duration: '1.5h',
    sort: 6,
    pricingMode: 'flat',
    isAddon: true,
  },
  {
    name: 'Oven & Kitchen Detail',
    description: 'Degrease the oven, cooktop, range hood and splashbacks until they shine.',
    price: 99.0,
    image: '/images/cleaning/oven-and-kitchen-detail.webp',
    unit: 'per visit',
    duration: '1.5h',
    sort: 7,
    pricingMode: 'flat',
    isAddon: true,
  },
];
