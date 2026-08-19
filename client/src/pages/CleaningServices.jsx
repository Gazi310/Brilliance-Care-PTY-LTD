import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext.jsx';
import { getCleaningServices } from '../services/cleaningService.js';
import PageHero from '../components/ui/PageHero.jsx';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import SectionHead from '../components/ui/SectionHead.jsx';
import Notice from '../components/ui/Notice.jsx';
import Button from '../components/ui/Button.jsx';
import CleaningToolbar from '../components/cleaning/CleaningToolbar.jsx';
import CleaningGrid from '../components/cleaning/CleaningGrid.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';

/**
 * /cleaning — the cleaning catalogue.
 *
 * Phase 4 restyle. The page keeps its structure (hero, search, grid) and
 * all of its behaviour; what changes is that the hero is the shared
 * navy `<PageHero>`, the emerald/teal scheme is gone, and the search row
 * and grid moved into `cleaning/` components so the page stays thin.
 */
export default function CleaningServices() {
  const navigate = useNavigate();
  const { setCleaningService, setAddonQty } = useBooking();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCleaningServices();
      setServices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setMounted(true);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getCleaningServices();
        if (active) {
          setServices(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) {
          setLoading(false);
          setMounted(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) => s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
  }, [services, search]);

  // "Book" jumps into the guided flow with this service pre-selected.
  // Add-ons pre-select as an extra; main services become the cleaning type.
  const handleAdd = (service) => {
    if (service.isAddon) setAddonQty(service._id, 1);
    else setCleaningService(service._id);
    navigate('/book/cleaning');
  };

  return (
    <main>
      <PageHero
        title="Cleaning"
        sub="Standard, deep and end-of-lease cleans, plus carpet, window and oven extras. Priced on the size of your home."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: 'Cleaning' },
        ]}
      />

      <Band tone="white" question="What clean do I need?">
        <Container>
          <SectionHead
            eyebrow="Our cleans"
            title="Pick a clean, we'll size the price"
            sub="Tell us the bedrooms, bathrooms and any extras and the estimate updates as you go."
          />

          <Notice tone="info" className="mx-auto mb-8 max-w-[820px] lg:mb-12">
            The price you see is an <b className="font-bold">estimate</b> for a one bed, one bath
            home. You pay a <b className="font-bold">50% deposit</b> to book, and the balance after
            the clean once we've confirmed what was actually done.
          </Notice>

          {error && (
            <Notice tone="warn" className="mb-8">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={load}>
                  Retry
                </Button>
              </div>
            </Notice>
          )}

          {!error && (
            <>
              <CleaningToolbar
                search={search}
                onSearch={setSearch}
                count={filtered.length}
                loading={loading}
              />
              <CleaningGrid
                services={filtered}
                loading={loading}
                mounted={mounted}
                onAdd={handleAdd}
                onClearSearch={search ? () => setSearch('') : undefined}
                emptyTitle={search ? 'No cleans match that' : 'No cleaning services yet'}
                emptySub={
                  search
                    ? 'Try a different search, or clear it to see everything we clean.'
                    : "We're still setting up the price list. Check back soon."
                }
              />
            </>
          )}
        </Container>
      </Band>

      <CtaBand
        title="Not sure which clean you need?"
        sub="Start an estimate — you can change the clean, the rooms and the extras before you pay a cent."
        cta="Book a clean"
        to="/book/cleaning"
        question="How do I start?"
      />
    </main>
  );
}
