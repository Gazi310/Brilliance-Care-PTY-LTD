const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const slotLabel = (slot) => {
  if (!slot) return '';
  const [y, m, d] = String(slot.date).split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${DAYS[dt.getDay()]} ${d} ${MONTHS[m - 1]} · ${slot.label} (${slot.time})`;
};

function Dot({ state }) {
  if (state === 'done') {
    return (
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-white">
        ✓
      </span>
    );
  }
  if (state === 'now') {
    return (
      <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-aqua/20">
        <span className="h-2.5 w-2.5 rounded-full bg-aqua" />
      </span>
    );
  }
  return <span className="h-6 w-6 flex-none rounded-full border-2 border-line bg-white" />;
}

/**
 * "What happens next" — the order's journey through the estimate → deposit →
 * service → invoice → balance model, as a simple vertical timeline.
 * Steps: [{ state: 'done'|'now'|'todo', title, sub }]
 */
export default function OrderTimeline({ steps }) {
  return (
    <ol className="space-y-0">
      {steps.map((s, i) => (
        <li key={i} className="relative flex gap-3 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute left-3 top-6 h-full w-0.5 -translate-x-1/2 ${
                s.state === 'done' ? 'bg-emerald-200' : 'bg-line'
              }`}
            />
          )}
          <Dot state={s.state} />
          <div className="min-w-0 pt-0.5">
            <p className={`text-sm font-bold ${s.state === 'todo' ? 'text-faint' : 'text-ink'}`}>{s.title}</p>
            {s.sub && <p className="text-xs text-muted">{s.sub}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

/** Build the standard post-booking timeline for a service order. */
export function buildBookingSteps(order) {
  const steps = [];
  const depositPaid = order.depositStatus === 'paid';

  steps.push(
    depositPaid
      ? { state: 'done', title: `Deposit paid · $${Number(order.depositAmount).toFixed(2)}`, sub: 'Booking confirmed' }
      : { state: 'now', title: `Pay deposit · $${Number(order.depositAmount).toFixed(2)}`, sub: 'Secures your booking' }
  );

  if (order.laundryPickupSlot) {
    steps.push({
      state: depositPaid ? 'now' : 'todo',
      title: `Pickup · ${slotLabel(order.laundryPickupSlot)}`,
      sub: "We'll SMS when we're on the way",
    });
    steps.push({ state: 'todo', title: 'We weigh & clean', sub: 'Your final price is confirmed here' });
    if (order.laundryReturnSlot) {
      steps.push({ state: 'todo', title: `Return · ${slotLabel(order.laundryReturnSlot)}` });
    }
  }
  if (order.cleaningSlot) {
    steps.push({
      state: depositPaid && !order.laundryPickupSlot ? 'now' : 'todo',
      title: `Cleaning visit · ${slotLabel(order.cleaningSlot)}`,
      sub: order.laundryPickupSlot ? '' : 'We confirm the final price on site',
    });
  }
  steps.push({ state: 'todo', title: 'Invoice + pay balance', sub: 'Only the remaining balance — no surprises' });

  return steps;
}
