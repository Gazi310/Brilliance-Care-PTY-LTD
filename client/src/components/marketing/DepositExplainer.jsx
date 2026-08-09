import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Card from '../ui/Card.jsx';
import Timeline from '../ui/Timeline.jsx';
import { useWorkedExample } from '../../hooks/useWorkedExample';
import { money } from '../../utils/money';

/**
 * "Why a deposit at all?" — the honest answer, /how-it-works.
 *
 * This is the page's real argument and it's worth making plainly: every
 * competitor quoting a flat price over the phone is quoting high, because
 * they have to. Saying so directly is more persuasive than any amount of
 * reassurance, and it reframes the deposit from "they want money up
 * front" to "they won't overcharge me".
 *
 * The timeline beside it runs the same order as the worked example on
 * /pricing — same numbers, told as a sequence of events rather than a
 * bill, because the two pages catch people asking different questions.
 */
export default function DepositExplainer() {
  const ex = useWorkedExample();

  const items = [
    { title: 'Estimate created', meta: `Monday, 9:14am · ${money(ex.estimate)}`, state: 'done' },
    { title: 'Deposit paid', meta: `Monday, 9:16am · ${money(ex.deposit)}`, state: 'done' },
    { title: 'Picked up', meta: 'Tuesday, 8:00–10:00am window', state: 'done' },
    {
      title: 'Assessed and invoiced',
      meta: `Tuesday, 2:40pm · balance ${money(ex.balance)}`,
      state: 'now',
    },
    { title: 'Delivered, balance settled', meta: 'Thursday, 4:00–6:00pm window' },
  ];

  return (
    <Band tone="sky" question="Why a deposit at all?">
      <Container className="flex flex-col gap-9 lg:flex-row lg:gap-16">
        <div className="min-w-0 flex-1 space-y-[18px]">
          <p className="bc-eyebrow">The honest answer</p>
          <h2 className="bc-h2">Why we take a deposit instead of quoting a flat price</h2>
          <p className="bc-lead">
            Nobody knows the weight of a laundry basket over the phone. Most services solve that by
            quoting high and keeping the difference.
          </p>
          <p className="bc-body text-muted">
            We’d rather estimate fairly, take {ex.depositPercent}% to hold the slot, then charge you
            for what was actually there. When a load comes in lighter than expected your invoice
            goes down — that happens more often than you’d think.
          </p>
          <p className="bc-body text-muted">
            It also means our team isn’t rushed into cutting corners to make a fixed price work.
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <Card>
            <h3 className="bc-h3 mb-[18px]">A typical order timeline</h3>
            <Timeline items={items} />
          </Card>
        </div>
      </Container>
    </Band>
  );
}
