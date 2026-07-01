import SlotPickerButton from './SlotPickerButton.jsx';

/* ------------------------------------------------------------------ */
/*  Thin wrapper kept for backwards-compatibility. The actual UI now    */
/*  lives in SlotPickerButton + SlotCalendar (a real mini month grid).  */
/* ------------------------------------------------------------------ */
export default function DeliverySlotMenu({ isAdmin = false, selected = null, onSelect, notify }) {
  return (
    <SlotPickerButton
      isAdmin={isAdmin}
      value={selected}
      onChange={onSelect}
      notify={notify}
      icon="🚚"
      label={isAdmin ? 'Delivery availability' : 'Delivery slot'}
      accent={isAdmin ? 'violet' : 'emerald'}
    />
  );
}
