import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/settingsService.js';
import { TruckIcon } from '../admin/icons.jsx';
import { Panel, Button, IconBadge } from '../ui';

/* Small admin widget to view & edit the flat per-visit delivery fee. */
export default function DeliveryFeeControl({ notify }) {
  const [fee, setFee] = useState('');
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getSettings()
      .then((s) => {
        if (!active) return;
        setFee(String(s.deliveryFee));
        setSaved(s.deliveryFee);
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const dirty = saved !== null && Number(fee) !== saved;

  const save = async () => {
    setSaving(true);
    try {
      const s = await updateSettings({ deliveryFee: Number(fee) || 0 });
      setSaved(s.deliveryFee);
      setFee(String(s.deliveryFee));
      notify?.('Delivery fee updated', 'success');
    } catch (err) {
      notify?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel padded>
      <div className="flex items-center gap-4">
        <IconBadge size="inline" tone="sky" icon={TruckIcon} className="h-11 w-11 rounded-btn" />

        <div className="min-w-0 flex-1">
          <p className="font-bold text-navy-900">Delivery fee</p>
          <p className="mt-0.5 bc-meta text-muted">
            Charged once per home visit. A shared pickup/delivery slot is billed once.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex h-10 w-32 items-center rounded-btn border border-line bg-white px-3">
          <span className="text-[15px] text-muted">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={loading ? '' : fee}
            disabled={loading}
            onChange={(e) => setFee(e.target.value)}
            placeholder={loading ? '…' : '0.00'}
            aria-label="Delivery fee per visit"
            className="w-full min-w-0 border-0 bg-transparent text-[15px] text-ink outline-none"
          />
        </div>

        <span className="bc-meta text-muted">per visit</span>

        <Button
          variant="navy"
          size="sm"
          onClick={save}
          disabled={!dirty || saving}
          className="ml-auto"
        >
          {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </Button>
      </div>
    </Panel>
  );
}
