import { useEffect, useState } from 'react';
import AdminSectionHeader from '../../components/admin/AdminSectionHeader.jsx';
import PricingSettingsCard from '../../components/admin/settings/PricingSettingsCard.jsx';
import BusinessSettingsCard from '../../components/admin/settings/BusinessSettingsCard.jsx';
import { getSettings } from '../../services/settingsService.js';

/**
 * /admin/settings (blueprint §5.8) — the global knobs: deposit %, delivery
 * fee, GST, business identity and the service-area postcode list.
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
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <AdminSectionHeader
        eyebrow="Admin"
        title="Settings"
        subtitle="Global switches for pricing, tax, business identity and your service area."
      />

      {loading ? (
        <div className="space-y-3">
          <div className="bc-skeleton h-56 rounded-2xl" />
          <div className="bc-skeleton h-72 rounded-2xl" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          ⚠️ {error}
          <button
            onClick={load}
            className="ml-3 rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : settings ? (
        <div className="space-y-4">
          <PricingSettingsCard settings={settings} onSaved={setSettings} />
          <BusinessSettingsCard settings={settings} onSaved={setSettings} />
          <p className="text-[11px] leading-relaxed text-faint">
            Card-payment keys and email/SMS templates will appear here once the real payment
            gateway and notification providers are connected (currently mocked).
          </p>
        </div>
      ) : null}
    </div>
  );
}
