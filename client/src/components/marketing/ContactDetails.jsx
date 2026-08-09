import SummaryCard from '../ui/SummaryCard.jsx';
import LineItems from '../ui/LineItems.jsx';
import Notice from '../ui/Notice.jsx';
import { useSettings } from '../../hooks/useSettings';

/**
 * "Straight to us" — the details panel beside the contact form.
 *
 * Every line comes from /admin/settings, and any line the client hasn't
 * filled in yet is dropped rather than shown as a placeholder. A contact
 * page reading "Phone: XX XXXX XXXX" is worse than one with no phone
 * number on it — the first says the business is unfinished, the second
 * just points at the form.
 *
 * Phone and ABN are both still open items on the project; this panel
 * fills itself in the moment they're entered in the admin, with no code
 * change.
 */
export default function ContactDetails() {
  const settings = useSettings();

  const lines = [
    settings?.businessPhone && {
      label: 'Phone',
      value: (
        <a
          href={`tel:${settings.businessPhone.replace(/\s+/g, '')}`}
          className="underline underline-offset-4"
        >
          {settings.businessPhone}
        </a>
      ),
    },
    settings?.businessEmail && {
      label: 'Email',
      value: (
        <a href={`mailto:${settings.businessEmail}`} className="underline underline-offset-4">
          {settings.businessEmail}
        </a>
      ),
    },
    settings?.businessHours && { label: 'Hours', value: settings.businessHours },
    settings?.abn && { label: 'ABN', value: settings.abn },
  ].filter(Boolean);

  return (
    <SummaryCard title="Straight to us" sticky={false}>
      {lines.length > 0 ? (
        <LineItems lines={lines} />
      ) : (
        <p className="bc-body text-muted">
          The form is the fastest way to reach us right now — we read every message and reply
          within one business day.
        </p>
      )}

      <Notice tone="info" className="mt-[22px]">
        We’re a mobile service — there’s no shopfront to visit. Everything happens at your door.
      </Notice>
    </SummaryCard>
  );
}
