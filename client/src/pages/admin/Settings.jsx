import { useEffect, useState } from 'react';
import AdminPage from '../../components/admin/AdminPage.jsx';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import PricingSettingsCard from '../../components/admin/settings/PricingSettingsCard.jsx';
import BookingWindowCard from '../../components/admin/settings/BookingWindowCard.jsx';
import BusinessSettingsCard from '../../components/admin/settings/BusinessSettingsCard.jsx';
import { getSettings } from '../../services/settingsService.js';
import { AlertIcon } from '../../components/admin/icons.jsx';
import { Button, Notice } from '../../components/ui';

/**
 * /admin/settings (blueprint §5.8) — the global knobs: deposit %, delivery
 * fee, GST, how far ahead laundry sells, business identity and the
 * service-area postcode list.
 * (Payment keys & notification templates arrive with the real providers.)
 */
export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setSettings(await getSettings());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <AdminPage width="narrow">
      <AdminSectionHeader
        eyebrow="Settings"
        title="Business settings"
        subtitle="Global switches for pricing, tax, business identity and your service area."
      />

      {loading ? (
        <div className="space-y-5">
          <div className="bc-skeleton h-72 rounded-card" />
          <div className="bc-skeleton h-96 rounded-card" />
        </div>
      ) : error ? (
        <Notice tone="warn" icon={<AlertIcon className="mt-0.5 flex-none" />}>
          <p>{error}</p>
          <Button variant="ghost" onClick={load} className="mt-2">
            Retry
          </Button>
        </Notice>
      ) : settings ? (
        <div className="space-y-5">
          <PricingSettingsCard settings={settings} onSaved={setSettings} />
          <BookingWindowCard settings={settings} onSaved={setSettings} />
          <BusinessSettingsCard settings={settings} onSaved={setSettings} />
          <p className="bc-meta text-muted">
            Card-payment keys and email/SMS templates will appear here once the real payment gateway
            and notification providers are connected (currently mocked).
          </p>
        </div>
      ) : null}
    </AdminPage>
  );
}
