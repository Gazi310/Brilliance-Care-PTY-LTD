import SlotPickerButton from './SlotPickerButton.jsx';

/* ------------------------------------------------------------------ */
/*  Thin wrapper kept for backwards-compatibility. The actual UI now    */
/*  lives in SlotPickerButton + SlotCalendar (a real mini month grid).  */
/* ------------------------------------------------------------------ */
export default function DeliverySlotMenu({
  isAdmin = false,
  selected = null,
  onSelect,
  notify,
  scope = 'shop',
  icon = '🚚',
  label,
  accent,
}) {
  return (
    <SlotPickerButton
      isAdmin={isAdmin}
      value={selected}
      onChange={onSelect}
      notify={notify}
      scope={scope}
      icon={icon}
      label={label ?? (isAdmin ? 'Delivery availability' : 'Delivery slot')}
      accent={accent ?? (isAdmin ? 'violet' : 'emerald')}
    />
  );
}
