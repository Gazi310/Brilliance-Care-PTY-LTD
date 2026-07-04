import ComingSoon from '../components/common/ComingSoon.jsx';

export default function Booking() {
  return (
    <ComingSoon
      eyebrow="Booking"
      title="Book a service"
      description="The full booking flow — build your order, get an instant estimate, pick a slot, and pay a deposit — lands here."
      phase="Phase 1"
      links={[
        { to: '/laundry', label: 'Laundry' },
        { to: '/cleaning', label: 'Cleaning' },
        { to: '/products', label: 'Shop' },
      ]}
    />
  );
}
