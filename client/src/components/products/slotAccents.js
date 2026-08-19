/* ------------------------------------------------------------------ */
/*  SLOT ACCENTS — how the four uses of SlotCalendar are told apart.     */
/*                                                                      */
/*  v1 gave each use its own hue (emerald / sky / amber / violet, with   */
/*  gradient headers). v2 has exactly two brand colours, and gold is     */
/*  reserved for "the thing you're doing next" — so hue can't carry      */
/*  identity here any more.                                              */
/*                                                                      */
/*  What carries it instead, all of it already in the v2 kit:            */
/*    · badge — the IconBadge tone in the field header (SlotField):      */
/*              sky fill / gold fill / navy fill / hairline outline.     */
/*              Four visibly different discs, one palette.               */
/*    · dot   — the availability marker under each day: a round dot vs   */
/*              a dash, in navy-500 vs navy-900. Shape and weight,       */
/*              which is what the plan sanctions in place of hue.        */
/*    · ring  — the hairline on today's cell, matched to the dot.        */
/*                                                                      */
/*  Selection state is deliberately NOT per-accent: a picked day is gold */
/*  everywhere, because gold means "your choice" across the whole app    */
/*  (see Stepper's current step and Timeline's 'now' dot).               */
/*                                                                      */
/*  Lives in its own module, not in SlotCalendar.jsx, so the component   */
/*  file keeps exporting only components (react-refresh).                */
/*  Full literal class strings so Tailwind keeps them.                   */
/* ------------------------------------------------------------------ */
export const SLOT_ACCENTS = {
  pickup: { badge: 'sky', dot: 'h-1.5 w-1.5 bg-navy-500', ring: 'ring-navy-500' },
  return: { badge: 'gold', dot: 'h-1 w-3 bg-navy-500', ring: 'ring-navy-500' },
  cleaning: { badge: 'navy', dot: 'h-1.5 w-1.5 bg-navy-900', ring: 'ring-navy-900' },
  admin: { badge: 'outline', dot: 'h-1 w-3 bg-navy-900', ring: 'ring-navy-900' },
};

/* The old colour names still arrive from the shop and admin screens
   (SlotPickerButton, DeliverySlotMenu, admin/Services, admin/Cleaning),
   so map them onto the semantic ones and nothing there has to change. */
const ALIAS = { sky: 'pickup', amber: 'return', emerald: 'cleaning', violet: 'admin' };

/** Resolve either a semantic accent name or a legacy colour name. */
export const resolveSlotAccent = (name) =>
  SLOT_ACCENTS[name] || SLOT_ACCENTS[ALIAS[name]] || SLOT_ACCENTS.pickup;
