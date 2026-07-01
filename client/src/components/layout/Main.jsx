import Hero from '../home/Hero';
import TabsSection from '../home/TabsSection';
import HomeSections from '../home/HomeSections';

export default function Main() {
  return (
    <main className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <Hero />
        <TabsSection />
        <HomeSections />
      </div>
    </main>
  );
}
