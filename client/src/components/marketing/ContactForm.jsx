import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button.jsx';
import Field from '../ui/Field.jsx';
import Notice from '../ui/Notice.jsx';
import { sendContactMessage } from '../../services/contactService';
import { useAuth } from '../../hooks/useAuth';

/**
 * The contact form — posts to /api/contact, which stores the enquiry and
 * surfaces it in the admin inbox at /admin/messages.
 *
 * Two things worth knowing:
 *
 * 1. `company` is a honeypot. It's rendered off-screen (not `hidden`,
 *    which some bots skip) and a real person never fills it in. The
 *    server drops anything that arrives with it filled, but answers 201
 *    regardless so a crawler learns nothing from the response.
 *
 * 2. Success replaces the form rather than showing a toast above it. A
 *    filled-in form left on screen after a successful send is the single
 *    most common cause of duplicate enquiries.
 *
 * Signed-in customers get their name and email prefilled — this is the
 * form most often used to chase an existing booking.
 */

/** Must match TOPICS in server/controllers/contactController.js. */
const TOPICS = [
  'A booking I’ve already made',
  'A quote for something unusual',
  'Commercial or bulk enquiry',
  'Something went wrong',
  'Something else',
];

const splitName = (full = '') => {
  const parts = full.trim().split(/\s+/);
  return { first: parts[0] || '', last: parts.slice(1).join(' ') };
};

export default function ContactForm() {
  const { user } = useAuth();
  const seed = splitName(user?.name);

  const [form, setForm] = useState({
    first: seed.first,
    last: seed.last,
    email: user?.email || '',
    phone: user?.phone || '',
    topic: TOPICS[0],
    message: '',
    company: '', // honeypot
  });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState('');
  const [sent, setSent] = useState(false);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((x) => ({ ...x, [key]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.first.trim()) next.first = 'We need a name to reply to.';
    if (!form.email.trim()) next.email = 'We need an email to reply to.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = 'That doesn’t look like a valid email address.';
    if (form.message.trim().length < 10) next.message = 'Tell us a little more — 10 characters or so.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setFailed('');
    if (!validate()) return;

    setSending(true);
    try {
      await sendContactMessage({
        name: `${form.first.trim()} ${form.last.trim()}`.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        topic: form.topic,
        message: form.message.trim(),
        company: form.company,
      });
      setSent(true);
    } catch (err) {
      setFailed(err.message);
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div>
        <h2 className="bc-h2">Message sent</h2>
        <Notice tone="ok" className="mt-6">
          Thanks {form.first.trim()} — we’ve got it. We reply within one business day, to{' '}
          <strong>{form.email.trim()}</strong>. If it’s urgent, calling is faster.
        </Notice>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button to="/book" variant="navy">
            Get an estimate while you wait
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setSent(false);
              setForm((f) => ({ ...f, message: '' }));
            }}
          >
            Send another message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="bc-h2">Send us a message</h2>
      <p className="bc-body mb-8 mt-3.5 text-muted">
        For a price, the{' '}
        <Link
          to="/book"
          className="font-bold text-navy-500 underline decoration-2 underline-offset-4 hover:text-navy-900"
        >
          estimator
        </Link>{' '}
        is faster — it gives you a number instantly.
      </p>

      <form onSubmit={submit} noValidate className="grid gap-5 lg:grid-cols-2">
        <Field
          id="c-first"
          label="First name"
          value={form.first}
          onChange={set('first')}
          error={errors.first}
          placeholder="Priya"
          autoComplete="given-name"
        />
        <Field
          id="c-last"
          label="Last name"
          value={form.last}
          onChange={set('last')}
          placeholder="Mehta"
          autoComplete="family-name"
        />
        <Field
          id="c-email"
          label="Email"
          type="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          id="c-phone"
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="04XX XXX XXX"
          autoComplete="tel"
        />

        <Field
          id="c-topic"
          as="select"
          label="What’s it about?"
          value={form.topic}
          onChange={set('topic')}
          wrapperClassName="lg:col-span-2"
        >
          {TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Field>

        <Field
          id="c-message"
          as="textarea"
          label="Message"
          value={form.message}
          onChange={set('message')}
          error={errors.message}
          placeholder="Tell us what you need…"
          wrapperClassName="lg:col-span-2"
        />

        {/* Honeypot — positioned off-screen rather than hidden, and never
            announced to assistive tech. */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label htmlFor="c-company">Company</label>
          <input
            id="c-company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={form.company}
            onChange={set('company')}
          />
        </div>

        <div className="lg:col-span-2">
          {failed && (
            <Notice tone="warn" className="mb-4">
              {failed} Your message hasn’t been sent — try again, or call us instead.
            </Notice>
          )}

          <Button type="submit" variant="gold" disabled={sending}>
            {sending ? 'Sending…' : 'Send message'}
          </Button>
          <p className="bc-meta mt-3 text-muted">
            We reply within one business day. Urgent? Call instead.
          </p>
        </div>
      </form>
    </div>
  );
}
