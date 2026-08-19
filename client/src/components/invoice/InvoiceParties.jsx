import { useSettings } from '../../hooks/useSettings';

/**
 * The "billed to / billed by" header of the invoice.
 *
 * A tax invoice is a document people forward to accountants, screenshot
 * for a landlord, or file for a rebate — so it has to carry both parties
 * and the ABN, not just a total. Business details come from
 * /admin/settings, the same source the footer reads.
 */
export default function InvoiceParties({ order }) {
  const biz = useSettings();

  const name = biz?.businessName || 'Brilliance Care Pty Ltd';
  const email = biz?.businessEmail || 'hello@brilliancecare.com.au';
  const phone = biz?.businessPhone || '';
  const abn = biz?.abn || '';

  const to = order?.contact?.name || '';
  const addr = order?.address;

  return (
    <div className="mb-6 flex flex-wrap justify-between gap-5">
      <div>
        <p className="bc-eyebrow">Billed to</p>
        <p className="bc-body mt-2">
          {to && (
            <>
              <b className="font-semibold">{to}</b>
              <br />
            </>
          )}
          {addr ? (
            <>
              {addr.line1}
              <br />
              {addr.suburb} {addr.state} {addr.postcode}
            </>
          ) : (
            <span className="text-muted">No address on this order</span>
          )}
        </p>
      </div>

      <div className="sm:text-right">
        <p className="bc-eyebrow">{name}</p>
        <p className="bc-meta mt-2 text-muted">
          {abn ? `ABN ${abn}` : 'ABN pending'}
          <br />
          {email}
          {phone && (
            <>
              <br />
              {phone}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
