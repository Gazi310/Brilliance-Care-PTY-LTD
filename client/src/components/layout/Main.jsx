import { useState, useEffect } from 'react';
import loginSectionBg from '../../assets/login-section-bg-img.jpg';
import LoginCard from '../common/LoginCard';
import WelcomeMessage from '../common/WelcomeMessage';
import TabsSection from '../common/TabsSection'; // 1) add this import

export default function Main() {
  // triggers the entrance animation once the component mounts
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <main className="flex-1 bg-gray-100 p-6 min-h-screen">

      <section
        className="login-section relative flex gap-4 items-center justify-around overflow-hidden rounded-3xl bg-cover bg-center bg-no-repeat px-6 py-16"
        style={{ backgroundImage: `url(${loginSectionBg})` }}
      >

        {/* dark overlay for readability over the background image */}
        <div className="pointer-events-none absolute inset-0 bg-slate-900/60" />

        {/* LOGIN CARD */}
        <LoginCard mounted={mounted} />

        {/* RIGHT SIDE (div2 placeholder) */}
        <WelcomeMessage mounted={mounted} />

      </section>

      {/* 2) replace your old <section className="tabs">…</section> with this: */}
      <TabsSection />

    </main>
  );
}
