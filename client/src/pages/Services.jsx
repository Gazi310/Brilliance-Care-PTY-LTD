import ComingSoon from '../components/common/ComingSoon.jsx';

export default function Services() {
  return (
    <ComingSoon
      eyebrow="Services"
      title="Our services"
      description="Pick a service to see estimated pricing and book a pickup or visit."
      links={[
        { to: '/laundry', label: 'Laundry' },
        { to: '/cleaning', label: 'Cleaning' },
        { to: '/products', label: 'Shop' },
      ]}
    />
  );
}
