import { useEffect, useState } from 'react';
import { getLaundryServices } from '../services/laundryService.js';
import PageHero from '../components/ui/PageHero.jsx';
import LaundryOverview from '../components/laundry/LaundryOverview.jsx';

/**
 * /laundry — services overview. Describes every laundry service and points the
 * customer to the guided booking flow (/book/laundry) to build an estimate.
 * Thin: load services, compose the hero and the overview.
 */
export default function LaundryServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLaundryServices();
      setServices(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getLaundryServices();
        if (active) {
          setServices(data);
          setError('');
        }
      } catch (err) {
        if (active) setError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main>
      <PageHero
        title="Laundry"
        sub="Wash and fold, ironing, dry cleaning and delicates — collected from your door and returned within 48 hours."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Services', to: '/services' },
          { label: 'Laundry' },
        ]}
      />

      <LaundryOverview services={services} loading={loading} error={error} onRetry={load} />
    </main>
  );
}
