/**
 * Payment provider abstraction — MOCK implementation.
 *
 * The API mirrors a typical card gateway's payment-intent flow closely enough
 * that swapping in a real provider later (any hosted card payment system) is
 * contained to this file plus keys in .env:
 *   - chargeDeposit(order, card) → { id, status } like a confirmed payment.
 *   - chargeBalance(order, invoice, card) → same shape, for the final balance.
 *
 * Mock behaviour (for demoing error states, mirrors common gateway test cards):
 *   - any 12–19 digit card number succeeds,
 *   - a number ending in 0002 is DECLINED.
 */

const digitsOnly = (s) => String(s || '').replace(/\D/g, '');

/** Validate the card fields and simulate a gateway charge of `amount` AUD. */
async function mockCharge(amount, card, idSeed) {
  const number = digitsOnly(card.number);
  const expiry = String(card.expiry || '').trim();
  const cvc = digitsOnly(card.cvc);

  if (number.length < 12 || number.length > 19) {
    const err = new Error('That card number does not look right');
    err.statusCode = 400;
    throw err;
  }
  if (!/^(0[1-9]|1[0-2])\s*\/\s*\d{2}$/.test(expiry)) {
    const err = new Error('Expiry must be in MM/YY format');
    err.statusCode = 400;
    throw err;
  }
  if (cvc.length < 3 || cvc.length > 4) {
    const err = new Error('CVC must be 3 or 4 digits');
    err.statusCode = 400;
    throw err;
  }
  if (number.endsWith('0002')) {
    const err = new Error('Your card was declined — please try another card');
    err.statusCode = 402;
    throw err;
  }

  // Simulate a short network round-trip so the UI's loading state is visible.
  await new Promise((r) => setTimeout(r, 400));

  return {
    id: `mock_pi_${idSeed}_${Date.now()}`,
    status: 'succeeded',
    amount: Math.round(amount * 100), // cents, like real gateways
    currency: 'aud',
    provider: 'mock',
  };
}

/** Charge the booking deposit (Phase 1 flow). */
export async function chargeDeposit(order, card = {}) {
  return mockCharge(order.depositAmount, card, order._id.toString().slice(-6));
}

/** Charge the remaining balance of a sent invoice (Phase 2 flow). */
export async function chargeBalance(order, invoice, card = {}) {
  return mockCharge(invoice.balanceDue, card, `bal_${invoice._id.toString().slice(-6)}`);
}
