import { useState, useEffect } from 'react';
import TabCard from './TabCard';

// The three service entries. Edit copy, emoji, routes or gradients freely.
const TABS = [
  {
    to: '/laundry',
    emoji: '🧺',
    name: 'Laundry',
    sub: 'Wash · Iron · Fold',
    gradient: 'from-[#1E6FB0] to-navy',
  },
  {
    to: '/cleaning',
    emoji: '🫧',
    name: 'Cleaning',
    sub: 'Home & office',
    gradient: 'from-teal to-teal-d',
  },
  {
    to: '/products',
    emoji: '🧴',
    name: 'Shop products',
    sub: 'Detergents & eco care — pay in full',
    gradient: 'from-[#5B6EE1] to-[#8A5CF6]',
    wide: true,
  },
];

export default function TabsSection() {
  // staggered entrance animation once mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <section className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {TABS.map((tab, i) => (
        <TabCard key={tab.to} index={i} mounted={mounted} {...tab} />
      ))}
    </section>
  );
}
