import Band from '../ui/Band.jsx';
import Container from '../ui/Container.jsx';
import Card from '../ui/Card.jsx';
import LineItems from '../ui/LineItems.jsx';
import { useWorkedExample } from '../../hooks/useWorkedExample';
import { money } from '../../utils/money';

/**
 * "Show me a real example" — the bottom of /pricing.
 *
 * Everything above this band is a list of numbers. This is the band that
 * makes them mean something, and it's the only place on the site where
 * the deposit model is shown *reducing* a bill rather than described.
 * Don't trim it to save space.
 *
 * The saving line is the one deliberate use of green outside status
 * chips: it's the number the whole page is arguing for.
 */
export default function WorkedExample() {
  const ex = useWorkedExample();

  const lines = [
    {
      label: `${ex.cleanName} (${ex.bedrooms} bed / ${ex.bathrooms} bath)`,
      value: money(ex.cleanTotal),
    },
    {
      label: `${ex.washName} × ${ex.loadsBooked} loads (estimated)`,
      value: money(ex.laundryEstimate),
    },
    { label: 'Estimate', value: money(ex.estimate), emphasis: 'total' },
    {
      label: `Deposit paid at booking (${ex.depositPercent}%)`,
      value: `− ${money(ex.deposit)}`,
    },
    {
      label: `Actual laundry weight — ${ex.loadsActual} loads`,
      value: <span className="text-ok">− {money(Math.abs(ex.adjustment))}</span>,
    },
    {
      label: 'Balance due on delivery',
      value: money(ex.balance),
      emphasis: 'due',
    },
  ];

  return (
    <Band tone="navy" question="Show me a real example">
      <Container className="flex flex-col gap-9 lg:flex-row lg:gap-16">
        <div className="min-w-0 flex-1 space-y-[18px]">
          <p className="bc-eyebrow">A worked example</p>
          <h2 className="bc-h2">What “you never overpay” looks like</h2>
          <p className="bc-lead text-sky-100">
            A three-bedroom, two-bathroom standard clean plus two loads of washing. Estimated,
            deposited, then invoiced on the real job.
          </p>
          <p className="bc-body text-sky-100">
            The load came in under weight, so the final invoice dropped to {money(ex.actualTotal)}.
            The deposit is credited either way, and the difference is simply never charged.
          </p>
        </div>

        <div className="min-w-0 flex-1">
          <Card>
            <LineItems lines={lines} />
          </Card>
        </div>
      </Container>
    </Band>
  );
}
