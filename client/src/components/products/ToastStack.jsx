// Floating notification stack (success / error / info).
export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[70] flex flex-col gap-3">
      {toasts.map((t) => {
        const style =
          t.type === 'error'
            ? 'border-red-200 bg-red-50/95 text-red-800'
            : t.type === 'info'
            ? 'border-sky-200 bg-sky-50/95 text-sky-800'
            : 'border-emerald-200 bg-emerald-50/95 text-emerald-800';
        const icon = t.type === 'error' ? '⚠️' : t.type === 'info' ? 'ℹ️' : '✅';
        return (
          <div
            key={t.id}
            className={`bc-toast-in pointer-events-auto flex max-w-xs items-center gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${style}`}
          >
            <span className="text-lg">{icon}</span>
            <span className="flex-1 text-sm font-medium">{t.message}</span>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-gray-400 transition hover:text-gray-700"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
