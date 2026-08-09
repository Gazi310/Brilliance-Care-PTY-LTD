import { Link } from 'react-router-dom';
import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Button from '../ui/Button.jsx';
import Accordion, { AccordionItem } from '../ui/Accordion.jsx';
import { FAQ_GROUPS } from './faqContent';

/**
 * The FAQ body — jump nav plus five grouped accordions.
 *
 * The sidebar is what makes a page this long usable: 20 questions in one
 * unbroken column is a page people scroll past rather than read. It's
 * sticky on desktop and collapses to a horizontal chip row on mobile,
 * where a sticky sidebar would eat a third of the screen.
 *
 * `scroll-mt-24` on each heading keeps the anchor target clear of the
 * sticky site header — without it, jumping to a section lands with the
 * heading hidden behind the nav, which reads as a broken link.
 *
 * The sidebar's contact button is navy, not gold: the closing band below
 * is gold and both are visible at once while the sidebar is stuck.
 */
export default function FaqGroups() {
  return (
    <Band tone="white">
      <Container className="flex flex-col gap-9 lg:flex-row lg:gap-14">
        {/* Jump nav */}
        <nav aria-label="On this page" className="lg:w-[240px] lg:flex-none">
          <div className="rounded-card border border-line bg-sky-50 p-6 lg:sticky lg:top-5">
            <p className="bc-eyebrow mb-3.5">On this page</p>

            <ul className="-mx-1 flex list-none gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:px-0 lg:pb-0">
              {FAQ_GROUPS.map((g) => (
                <li key={g.id} className="flex-none lg:flex-auto">
                  <Button href={`#${g.id}`} variant="ghost" className="whitespace-nowrap">
                    {g.nav}
                  </Button>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-line pt-5">
              <p className="bc-meta mb-3 text-muted">Still stuck?</p>
              <Button to="/contact" variant="navy" size="sm" block>
                Contact us
              </Button>
            </div>
          </div>
        </nav>

        {/* Groups */}
        <div className="min-w-0 flex-1">
          {FAQ_GROUPS.map((g, i) => (
            <section
              key={g.id}
              id={g.id}
              aria-labelledby={`${g.id}-h`}
              className={`scroll-mt-24 ${i > 0 ? 'mt-14' : ''}`}
            >
              <h2 id={`${g.id}-h`} className="bc-h2">
                {g.title}
              </h2>

              <Accordion className="mt-5">
                {g.items.map((item) => (
                  <AccordionItem key={item.q} q={item.q} defaultOpen={item.open}>
                    <p className="bc-body">{item.a}</p>
                    {item.link && (
                      <p className="mt-3">
                        <Link
                          to={item.link.to}
                          className="font-bold text-navy-500 underline decoration-2 underline-offset-4 hover:text-navy-900"
                        >
                          {item.link.label} &rarr;
                        </Link>
                      </p>
                    )}
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ))}
        </div>
      </Container>
    </Band>
  );
}
