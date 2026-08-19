import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getInvoice, payInvoiceBalance } from '../services/invoiceService.js';
import PageHero from '../components/ui/PageHero.jsx';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import InvoiceOutcome from '../components/invoice/InvoiceOutcome.jsx';
import InvoiceParties from '../components/invoice/InvoiceParties.jsx';
import InvoiceLines from '../components/invoice/InvoiceLines.jsx';
import InvoiceTotals from '../components/invoice/InvoiceTotals.jsx';
import InvoicePayPanel from '../components/invoice/InvoicePayPanel.jsx';
import { AlertIcon } from '../components/booking/icons.jsx';

const dateLabel = (iso) =>
  new Date(iso).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * /account/invoices/:id — the final bill (blueprint §4.11).
 *
 * Reading order is the design: verdict, then the line-by-line evidence,
 * then the totals, then the payment. Anyone who only reads the first
 * block should already know whether the price moved and which way.
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
      <main>
        <PageHero title="Invoice" crumbs={[{ label: 'Home', to: '/' }, { label: 'Invoice' }]} />
        <Band tone="white">
          <Container className="space-y-4">
            <div className="bc-skeleton h-20 rounded-card" />
            <div className="bc-skeleton h-80 rounded-card" />
          </Container>
        </Band>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main>
        <PageHero
          title="Invoice"
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Account', to: '/account/orders' },
            { label: 'Invoice' },
          ]}
        />
        <Band tone="white">
          <Container>
            <div className="flex gap-3.5 rounded-card bg-bad-bg px-5 py-[18px] text-[15.5px] leading-[1.55] text-bad">
              <AlertIcon className="mt-0.5 flex-none" aria-hidden="true" />
              <p>
                {error || 'Invoice not found'} —{' '}
                <Link
                  to="/account/orders"
                  className="font-bold underline decoration-2 underline-offset-4"
                >
                  back to my orders
                </Link>
              </p>
            </div>
          </Container>
        </Band>
      </main>
    );
  }

  const awaiting = invoice.status === 'sent' && invoice.balanceDue > 0;

  return (
    <main>
      <PageHero
        title={`Invoice ${invoice.number}`}
        sub={`${invoice.order?.orderNumber ? `Order ${invoice.order.orderNumber} · ` : ''}issued ${dateLabel(
          invoice.issuedAt
        )}`}
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Account', to: '/account/orders' },
          { label: 'Orders', to: '/account/orders' },
          { label: 'Invoice' },
        ]}
      />

      <Band tone="white">
        <Container className="flex flex-col gap-9 lg:flex-row lg:gap-12">
          <div className="min-w-0 lg:flex-[1.6]">
            <InvoiceOutcome invoice={invoice} justPaid={justPaid} />

            <Card className="mt-6">
              <InvoiceParties order={invoice.order} />
              <InvoiceLines lines={invoice.lineItems} />
              <InvoiceTotals invoice={invoice} className="mt-6" />
            </Card>

            <div className="mt-6">
              <Button to="/account/orders" variant="ghost" className="text-sm">
                ← Back to my orders
              </Button>
            </div>
          </div>

          {awaiting && (
            <div className="min-w-0 lg:w-[380px] lg:flex-none">
              <InvoicePayPanel invoice={invoice} onPay={pay} busy={paying} />
            </div>
          )}
        </Container>
      </Band>
    </main>
  );
}
