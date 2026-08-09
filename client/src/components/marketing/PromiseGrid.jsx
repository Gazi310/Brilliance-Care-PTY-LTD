import Card from '../ui/Card.jsx';
import IconBadge from '../ui/IconBadge.jsx';

/**
 * The four-up grid of promises — icon, heading, one paragraph.
 *
 * Shared by the homepage's "why people stay with us" band and the
 * /services page's "the same four promises on every job". Same shape,
 * different copy and a different band around it, so this component is
 * deliberately just the grid: it sets no section padding and no heading.
 *
 * items: [{ icon, title, body }] where icon is a component or element.
 */
export default function PromiseGrid({ items = [], className = '' }) {
  return (
    <div className={`grid gap-4 lg:grid-cols-4 lg:gap-6 ${className}`}>
      {items.map(({ icon, title, body }) => (
        <Card key={title}>
          <IconBadge icon={icon} />
          <h3 className="bc-h3 mb-2.5">{title}</h3>
          <p className="bc-body text-muted">{body}</p>
        </Card>
      ))}
    </div>
  );
}
