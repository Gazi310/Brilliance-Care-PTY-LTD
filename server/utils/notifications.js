/**
 * Notification layer — MOCK implementation (mirrors utils/payments.js).
 *
 * "Sends" are logged to the server console and returned as records that the
 * caller stores on the invoice (sentChannels + notifications[]), so the admin
 * UI can show exactly what went out, where, and when. Swapping in a real
 * provider later (email SMTP / an AU SMS gateway) is contained to this file:
 * keep the same function signatures and return shape.
 */

const fmtMoney = (n) => `$${Number(n || 0).toFixed(2)}`;

/** Lowest-level mock send — one message on one channel. */
async function send({ channel, to, subject, body }) {
  // Simulate a short provider round-trip.
  await new Promise((r) => setTimeout(r, 120));
  // eslint-disable-next-line no-console
  console.log(`[notify:${channel}] to=${to || '(none)'} :: ${subject} :: ${body}`);
  return { channel, to: to || '', at: new Date() };
}

/**
 * Notify the customer that their final invoice is ready, with a pay link.
 * @param {object} order    the booking Order document
 * @param {object} invoice  the Invoice document (already saved / numbered)
 * @param {string[]} channels  any of 'email' | 'sms'
 * @param {object|null} user   the owning User (for their email address)
 * @returns {Promise<Array<{channel,to,at}>>} records to store on the invoice
 */
export async function notifyInvoiceSent(order, invoice, channels = ['email'], user = null) {
  const payUrl = `/account/invoices/${invoice._id}`;
  const summary =
    invoice.balanceDue > 0
      ? `Balance due ${fmtMoney(invoice.balanceDue)}`
      : 'No balance due — you are all settled';
  const records = [];

  for (const channel of channels) {
    if (channel === 'email') {
      records.push(
        await send({
          channel,
          to: user?.email || '',
          subject: `Your Brilliance Care invoice ${invoice.number} is ready`,
          body: `Order ${order.orderNumber}: actual total ${fmtMoney(invoice.total)}, deposit ${fmtMoney(
            invoice.depositApplied
          )} applied. ${summary}. Pay online: ${payUrl}`,
        })
      );
    } else if (channel === 'sms') {
      records.push(
        await send({
          channel,
          to: order.contact?.phone || '',
          subject: `Invoice ${invoice.number}`,
          body: `Brilliance Care: your invoice for order ${order.orderNumber} is ready. ${summary}. Pay: ${payUrl}`,
        })
      );
    }
  }
  return records;
}

/** Receipt after the balance is settled (any method). */
export async function notifyBalancePaid(order, invoice, user = null) {
  return [
    await send({
      channel: 'email',
      to: user?.email || '',
      subject: `Payment received — ${invoice.number}`,
      body: `Thanks! Balance of ${fmtMoney(invoice.balanceDue)} for order ${order.orderNumber} is settled. See you next time.`,
    }),
  ];
}
