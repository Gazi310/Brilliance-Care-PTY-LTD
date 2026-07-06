import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInvoice, payInvoiceBalance } from '../services/invoiceService.js';
import InvoiceLineItem from '../components/invoice/InvoiceLineItem.jsx';
import InvoiceTotals from '../components/invoice/InvoiceTotals.jsx';
import CardPaymentForm from '../components/common/CardPaymentForm.jsx';

const money = (n) => `$${Number(n || 0).toFixed(2)}`;
const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' });

const PAID_LABEL = {
  card_online: 'paid online by card',
  cash_on_delivery: 'paid in cash on delivery',
  card_on_delivery: 'paid by card on delivery',
  waived: 'waived — nothing to pay',
  not_required: 'no balance was due',
};

/**
 * /account/invoices/:id — the final bill (blueprint §4.11): estimate vs
 * actual line by line, the deposit already paid, and the remaining balance —
 * payable online right here, or on delivery.
 */
export default function Invoice() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [justPaid, setJustPaid] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        setInvoice(await getInvoice(id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const pay = async (card) => {
    setPaying(true);
    try {
      const res = await payInvoiceBalance(id, card);
      setInvoice((prev) => ({ ...prev, ...res.invoice, order: prev.order }));
      setJustPaid(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-surface pb-28 lg:pb-16">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-6 sm:px-6 sm:py-10">
          <div className="bc-skeleton h-8 w-52 rounded-xl" />
          <div className="bc-skeleton h-56 rounded-2xl" />
          <div className="bc-skeleton h-40 rounded-2xl" />
        </div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main className="min-h-screen bg-surface pb-28 lg:pb-16">
        <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            ⚠️ {error || 'Invoice not found'}
            <Link to="/account/orders" className="ml-3 text-xs font-bold underline">
              My orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const paid = invoice.status === 'paid';
  const awaiting = invoice.status === 'sent' && invoice.balanceDue > 0;

  return (
    <main className="min-h-screen bg-surface pb-28 lg:pb-16">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <Link to="/account/orders" className="text-xs font-bold text-navy hover:underline">
          ← My orders
        </Link>

        {/* ---- Header ---- */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
            Invoice {invoice.number}
          </h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold ${
              paid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'
            }`}
          >
            {paid ? 'Paid' : 'Awaiting payment'}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted">
          Issued {dateLabel(invoice.issuedAt)}
          {invoice.order?.orderNumber && <> · for order <b>{invoice.order.orderNumber}</b></>}
        </p>

        {/* ---- Paid banner ---- */}
        {paid && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm font-bold text-emerald-800">
            {justPaid ? '🎉 Payment received — thank you!' : '✅ This invoice is settled'}
            {invoice.paymentMethod && ` (${PAID_LABEL[invoice.paymentMethod] || 'paid'})`}
            {invoice.paidAt && ` · ${dateLabel(invoice.paidAt)}`}
          </div>
        )}

        {/* ---- What changed & why ---- */}
        <section className="mt-4 rounded-2xl border border-line bg-white p-4 shadow-soft sm:p-5">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-faint">
            Your final bill — estimate vs actual
          </p>
          <div className="mt-1 divide-y divide-line">
            {invoice.lineItems.map((l, i) => (
              <InvoiceLineItem key={i} line={l} />
            ))}
          </div>
        </section>

        {invoice.note && (
          <div className="mt-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-[13px] leading-relaxed text-slate-600">
            📝 <b className="text-slate-700">Note from Brilliance Care:</b> {invoice.note}
          </div>
        )}

        {/* ---- Money ---- */}
        <div className="mt-3">
          <InvoiceTotals invoice={invoice} />
        </div>

        {/* ---- Pay the balance ---- */}
        {awaiting && (
          <div className="mt-4">
            <CardPaymentForm
              amount={invoice.balanceDue}
              onPay={pay}
              busy={paying}
              buttonLabel={`Pay balance · ${money(invoice.balanceDue)}`}
            />
            <p className="mt-3 rounded-2xl border border-line bg-white px-4 py-3 text-center text-xs font-semibold text-muted shadow-soft">
              💵 Prefer to pay on delivery? Our driver can take cash or card — no need to do
              anything now.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
