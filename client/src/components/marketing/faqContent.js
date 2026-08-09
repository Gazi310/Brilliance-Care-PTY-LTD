/**
 * The full FAQ, grouped.
 *
 * Content lives apart from the page so the answers can be edited without
 * touching layout, and so /faq and the homepage teaser can't drift apart
 * on the questions they share.
 *
 * Order within each group is deliberate: the question most people ask
 * first goes first, not the one that's easiest to answer. `link` renders
 * as a trailing "read more" after the answer — keeping answers plain
 * strings means this file stays content, not markup.
 */

export const FAQ_GROUPS = [
  {
    id: 'booking',
    title: 'Booking & slots',
    nav: 'Booking & slots',
    items: [
      {
        q: 'How far ahead can I book?',
        a: 'Up to eight weeks. Slots open on a rolling basis and the busiest windows — weekday evenings and Saturday mornings — usually go about a week out.',
        open: true,
      },
      {
        q: 'Do laundry and cleaning share a calendar?',
        a: 'No. Each service line has its own availability, because they’re run by different teams. You’ll see separate slot pickers if you book both in one order.',
      },
      {
        q: 'Do I need an account?',
        a: 'No. You can book as a guest with just a phone number and address. Creating an account keeps your order history and invoices in one place, and saves your details for next time.',
      },
      {
        q: 'Can I reschedule?',
        a: 'Free of charge up to 12 hours before your pickup window, from your orders page.',
        link: { to: '/account/orders', label: 'Go to my orders' },
      },
    ],
  },
  {
    id: 'money',
    title: 'Pricing & payment',
    nav: 'Pricing & payment',
    items: [
      {
        q: 'Why is it an estimate and not a fixed price?',
        a: 'Because nobody can weigh a laundry basket over the phone. We estimate fairly, take a deposit, then invoice for the real job.',
        link: { to: '/how-it-works', label: 'Full explanation here' },
      },
      {
        q: 'When is the balance charged?',
        a: 'After we’ve assessed the job and before delivery. You can pay online from the invoice, or by card or cash to the driver on the doorstep.',
      },
      {
        q: 'What if the final invoice is less than my deposit?',
        a: 'We refund the difference to your original payment method within three business days.',
      },
      {
        q: 'Are prices GST inclusive?',
        a: 'Yes. Every price shown on the site includes GST and is in Australian dollars.',
        link: { to: '/pricing', label: 'See the full price list' },
      },
      {
        q: 'Is there a delivery fee?',
        a: 'Not on laundry or cleaning bookings — pickup and delivery is free across the service area. Shop-only orders carry a flat delivery fee, shown before you pay.',
      },
    ],
  },
  {
    id: 'laundry',
    title: 'Laundry',
    nav: 'Laundry',
    items: [
      {
        q: 'How long does it take?',
        a: '48 hours from pickup as standard. Express 24-hour wash is available if you need it sooner.',
      },
      {
        q: 'How much is a load?',
        a: 'Up to 8kg — about a full domestic machine, or two large bags. Over that and we tell you before washing.',
      },
      {
        q: 'Do you separate colours?',
        a: 'Always, along with fabric type and wash temperature. Anything questionable gets set aside and flagged rather than guessed at.',
      },
      {
        q: 'Can you handle dry-clean-only items?',
        a: 'Yes. Suits, coats and formalwear go to our dry-cleaning partner and come back on hangers.',
        link: { to: '/laundry', label: 'See laundry services' },
      },
    ],
  },
  {
    id: 'cleaning',
    title: 'Cleaning',
    nav: 'Cleaning',
    items: [
      {
        q: 'Do I need to be home?',
        a: 'No — leave a key or lockbox code on the booking. We photograph the finished job so you can check it remotely.',
      },
      {
        q: 'Will a bond clean pass inspection?',
        a: 'We clean to the standard agents inspect against. If something’s flagged we return within 72 hours at no charge.',
      },
      {
        q: 'Do you bring products and equipment?',
        a: 'Everything’s included. Prefer we use yours for allergy reasons? Note it on the booking.',
      },
      {
        q: 'Can I get the same cleaner each time?',
        a: 'For recurring bookings that’s the default. We only swap when someone’s away, and we tell you first.',
      },
    ],
  },
  {
    id: 'trust',
    title: 'Insurance & safety',
    nav: 'Insurance & safety',
    items: [
      {
        q: 'Are your staff police-checked?',
        a: 'Every team member, before their first job. Certificates are available on request — property managers ask for these regularly.',
      },
      {
        q: 'What insurance do you carry?',
        a: '$20m public liability, plus cover for items in our care. A certificate of currency is available on request.',
      },
      {
        q: 'What if something is damaged or lost?',
        a: 'Report it within 48 hours of delivery. We repair, replace or refund. It’s rare, and we don’t argue about it.',
      },
    ],
  },
];

export default FAQ_GROUPS;
