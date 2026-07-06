import CardPaymentForm from '../common/CardPaymentForm.jsx';

/**
 * The deposit payment form — a thin wrapper over the shared CardPaymentForm
 * (components/common/CardPaymentForm.jsx), which is also used to pay the
 * invoice balance in Phase 2. Kept so Checkout's import stays stable.
 */
export default function DepositPaymentForm({ amount, onPay, busy }) {
  return (
    <CardPaymentForm
      amount={amount}
      onPay={onPay}
      busy={busy}
      buttonLabel={`Pay $${Number(amount || 0).toFixed(2)} deposit`}
    />
  );
}
