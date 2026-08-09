import PageHero from '../components/ui/PageHero.jsx';
import Band from '../components/ui/Band.jsx';
import Container from '../components/ui/Container.jsx';
import ContactForm from '../components/marketing/ContactForm.jsx';
import ContactDetails from '../components/marketing/ContactDetails.jsx';
import ServiceArea from '../components/home/ServiceArea.jsx';
import CtaBand from '../components/marketing/CtaBand.jsx';

/**
 * /contact — the form, the direct details, and the service area.
 *
 * The service-area band is the same component the homepage uses. Someone
 * arriving here from a search result asking "do they come to Ringwood?"
 * gets the same postcode check and the same answer, and there's only one
 * place to change it when the coverage grows.
 */
export default function Contact() {
  return (
    <main>
      <PageHero
        title="Get in touch"
        sub="A person answers the phone, seven days a week. Or send a message and we’ll come back within one business day."
        crumbs={[
          { label: 'Home', to: '/' },
          { label: 'Contact' },
        ]}
      />

      <Band tone="white" question="How do I reach a human?">
        <Container className="flex flex-col gap-9 lg:flex-row lg:gap-14">
          <div className="min-w-0 lg:flex-[1.4]">
            <ContactForm />
          </div>
          <div className="min-w-0 lg:flex-1">
            <ContactDetails />
          </div>
        </Container>
      </Band>

      <ServiceArea />

      <CtaBand
        title="Know what you need already?"
        sub="Skip the message and get a price in two minutes."
      />
    </main>
  );
}
