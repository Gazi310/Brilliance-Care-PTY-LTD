import { useEffect, useState } from 'react';
import { getSettings, updateSettings } from '../../services/settingsService.js';

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
      notify?.('Delivery fee updated ✅', 'success');
    } catch (err) {
      notify?.(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-lg">🚚</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-gray-800">Delivery fee</p>
          <p className="text-[11px] text-gray-400">Charged once per home visit. A shared pickup/delivery slot is billed once.</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="inline-flex items-center rounded-lg border border-gray-200 px-2">
          <span className="text-sm text-gray-400">$</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={loading ? '' : fee}
            disabled={loading}
            onChange={(e) => setFee(e.target.value)}
            className="w-24 py-1.5 text-sm outline-none"
            placeholder={loading ? '…' : '0.00'}
          />
        </div>
        <span className="text-xs text-gray-400">per visit</span>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className={`ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
            dirty ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-md active:scale-95' : 'cursor-not-allowed bg-gray-200 text-gray-400'
          }`}
        >
          {saving ? 'Saving…' : dirty ? 'Save' : 'Saved'}
        </button>
      </div>
    </div>
  );
}
