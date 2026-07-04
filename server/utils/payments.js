/**
 * Payment provider abstraction — MOCK implementation.
 *
 * The API mirrors Stripe's PaymentIntent flow closely enough that swapping in
 * real Stripe later is contained to this file (plus real keys in .env):
 *   - chargeDeposit(order, card) → { id, status } like a confirmed PaymentIntent.
 *
 * Mock behaviour (for demoing error states, mirrors Stripe's test cards):
 *   - any 12–19 digit card number succeeds,
 *   - a number ending in 0002 is DECLINED (like Stripe's 4000 0000 0000 0002).
 */

const digitsOnly = (s) => String(s || '').replace(/\D/g, '');

export async function chargeDeposit(order, card = {}) {
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
    id: `mock_pi_${order._id.toString().slice(-6)}_${Date.now()}`,
    status: 'succeeded',
    amount: Math.round(order.depositAmount * 100), // cents, like Stripe
    currency: 'aud',
    provider: 'mock',
  };
}
