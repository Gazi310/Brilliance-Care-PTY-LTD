import InvoiceLineItem from './InvoiceLineItem.jsx';

/**
 * The estimate-vs-actual table.
 *
 * Three columns, in that order, deliberately: the customer reads left to
 * right and lands on what they were quoted before what they're being
 * charged. Reversing them makes every downward adjustment look like an
 * increase for the half-second it takes to read the header.
 *
 * Not `<DataTable>` — that primitive is tuned for admin scanning (pale
 * header, uppercase, one line per row). This one has a navy header and
 * a two-line cell, and is the only table a customer sees.
 */
export default function InvoiceLines({ lines = [] }) {
  return (
    <div className="overflow-x-auto rounded-card border border-line">
      <table className="w-full border-collapse">
        <caption className="sr-only">Estimated and actual charges for this order</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="bg-navy-900 px-5 py-3.5 text-left text-[13px] font-bold uppercase leading-[1.3] tracking-[0.06em] text-white lg:px-[22px]"
            >
              Line
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-navy-900 px-5 py-3.5 text-left text-[13px] font-bold uppercase leading-[1.3] tracking-[0.06em] text-white lg:px-[22px]"
            >
              Estimated
            </th>
            <th
              scope="col"
              className="whitespace-nowrap bg-navy-900 px-5 py-3.5 text-right text-[13px] font-bold uppercase leading-[1.3] tracking-[0.06em] text-white lg:px-[22px]"
            >
              Actual
            </th>
          </tr>
        </thead>
        <tbody className="[&>tr:last-child>td]:border-b-0">
          {lines.map((l, i) => (
            <InvoiceLineItem key={`${l.label}-${i}`} line={l} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
