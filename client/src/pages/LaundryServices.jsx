import { useEffect, useState } from 'react';
import { getLaundryServices } from '../services/laundryService.js';
import LaundryOverview from '../components/laundry/LaundryOverview.jsx';

/**
 * /laundry — services overview. Describes every laundry service and points the
 * customer to the booking catalogue (/laundry/book) to build an estimate.
 * Thin: load services, compose the overview.
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
    <main className="min-h-screen bg-surface pb-16">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <LaundryOverview services={services} loading={loading} error={error} onRetry={load} />
      </div>
    </main>
  );
}
