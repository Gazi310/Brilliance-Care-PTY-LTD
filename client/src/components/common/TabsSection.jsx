import { useState, useEffect } from 'react';
import TabCard from './TabCard';

// The three tabs. Edit `to`, copy, icons or gradients freely.
const TABS = [
  {
    to: '/laundry',
    icon: '🧺',
    title: 'Laundry Services',
    description: 'Wash, dry & fold handled with care and delivered fresh to your door.',
    gradient: 'from-sky-500 to-blue-600',
    accent: 'text-blue-600',
  },
  {
    to: '/cleaning',
    icon: '🫧',
    title: 'Cleaning Services',
    description: 'Sparkling home and office cleaning by trusted, vetted professionals.',
    gradient: 'from-emerald-500 to-teal-600',
    accent: 'text-emerald-600',
  },
  {
    to: '/products',
    icon: '🧴',
    title: 'Products',
    description: 'Premium detergents and eco-friendly care products, shipped to you.',
    gradient: 'from-violet-500 to-fuchsia-600',
    accent: 'text-violet-600',
  },
];

export default function TabsSection() {
  // staggered entrance animation once mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="tabs flex flex-wrap items-stretch justify-center gap-6 py-12">
      {TABS.map((tab, i) => (
        <TabCard key={tab.to} index={i} mounted={mounted} {...tab} />
      ))}
    </section>
  );
}
