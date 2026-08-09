import { AlertIcon, CheckIcon, CloseIcon, InfoIcon } from './icons.jsx';

/**
 * ToastStack — transient confirmations, bottom-right.
 *
 * Shared with the booking flow and three admin screens, so it moved to
 * the v2 status tokens rather than being duplicated: the shop pages
 * would otherwise be the only place in the app where a success message
 * is emerald-500 instead of the palette's `ok` green.
 *
 * A toast is transient by definition. If the message is part of the
 * page and should still be there in a minute, it's a <Notice>.
 */

const TONES = {
  success: { box: 'bg-ok-bg text-ok border-ok/20', Icon: CheckIcon },
  error: { box: 'bg-bad-bg text-bad border-bad/20', Icon: AlertIcon },
  info: { box: 'bg-sky-100 text-navy-900 border-navy-500/15', Icon: InfoIcon },
};

export default function ToastStack({ toasts = [], onDismiss }) {
  return (
    <div
      className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col gap-3"
      role="status"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const { box, Icon } = TONES[t.type] ?? TONES.success;

        return (
          <div
            key={t.id}
            className={`bc-toast-in pointer-events-auto flex max-w-xs items-center gap-3 rounded-card border px-4 py-3.5 shadow-lift ${box}`}
          >
            <Icon className="h-5 w-5 flex-none" aria-hidden="true" />
            <span className="flex-1 text-sm font-semibold leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => onDismiss(t.id)}
              className="flex-none opacity-55 transition-opacity hover:opacity-100"
              aria-label="Dismiss"
            >
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
