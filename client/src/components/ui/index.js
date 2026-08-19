/**
 * The v2 UI primitive layer.
 *
 * Everything the wireframes repeat, built once. Pages should compose
 * these rather than re-styling from scratch — that's the whole reason
 * this layer exists and is what keeps spacing and colour from drifting
 * page by page as the migration rolls through.
 *
 * Import from the barrel:
 *   import { Band, Container, SectionHead, Button } from '../components/ui';
 *
 * House rules these components assume:
 *   · Gold is a fill, never text on a light background.
 *   · One gold button per viewport.
 *   · Bands own vertical rhythm; nothing inside sets section padding.
 *   · Mobile styles are the base; `lg:` is the desktop breakpoint.
 */

export { default as Band } from './Band.jsx';
export { default as Container } from './Container.jsx';
export { default as SectionHead } from './SectionHead.jsx';
export { default as Button } from './Button.jsx';
export { default as Card } from './Card.jsx';
export { default as Panel } from './Panel.jsx';
export { default as IconBadge } from './IconBadge.jsx';
export { default as Chip } from './Chip.jsx';
export { default as Tag } from './Tag.jsx';
export { default as Notice } from './Notice.jsx';
export { default as ImagePlaceholder } from './ImagePlaceholder.jsx';
export { default as PageHero } from './PageHero.jsx';
export { default as StatStrip } from './StatStrip.jsx';
export { default as PriceTable } from './PriceTable.jsx';
export { default as PlanCard } from './PlanCard.jsx';
export { default as Accordion, AccordionItem } from './Accordion.jsx';
export { default as StepCard } from './StepCard.jsx';
export { default as Stepper } from './Stepper.jsx';
export { default as Timeline } from './Timeline.jsx';
export { default as LineItems } from './LineItems.jsx';
export { default as SummaryCard } from './SummaryCard.jsx';
export { default as DataTable } from './DataTable.jsx';
export { default as KpiCard } from './KpiCard.jsx';
export { default as Field } from './Field.jsx';
