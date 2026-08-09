import { useState } from 'react';
import Field from '../ui/Field.jsx';
import ProfileCard from './ProfileCard.jsx';
import { useAuth } from '../../hooks/useAuth';

/**
 * Standing laundry preferences.
 *
 * Applied to every booking unless changed at checkout. The allergies
 * field is free text rather than a checklist on purpose — "sensitive to
 * enzymes, and please don't use anything on the wool coat" is the shape
 * these answers actually come in, and a checklist would lose it.
 */

const DETERGENTS = ['Fragrance-free', 'Lavender Bloom', 'I’ll supply my own'];
const SHIRTS = ['Folded', 'On hangers'];

export default function ProfilePreferences() {
  const { user, updateProfile } = useAuth();
  const saved = user?.preferences || {};

  const [detergent, setDetergent] = useState(saved.detergent || DETERGENTS[0]);
  const [shirts, setShirts] = useState(saved.shirts || SHIRTS[0]);
  const [allergies, setAllergies] = useState(saved.allergies || '');

  const dirty =
    detergent !== (saved.detergent || DETERGENTS[0]) ||
    shirts !== (saved.shirts || SHIRTS[0]) ||
    allergies !== (saved.allergies || '');

  return (
    <ProfileCard
      title="Laundry preferences"
      subtitle="Applied to every booking unless you change it at checkout."
      saveLabel="Save preferences"
      onSave={() => updateProfile({ preferences: { detergent, shirts, allergies } })}
      dirty={dirty}
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Field
          id="p-detergent"
          as="select"
          label="Detergent"
          value={detergent}
          onChange={(e) => setDetergent(e.target.value)}
        >
          {DETERGENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </Field>

        <Field
          id="p-shirts"
          as="select"
          label="Shirts returned"
          value={shirts}
          onChange={(e) => setShirts(e.target.value)}
        >
          {SHIRTS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </Field>

        <Field
          id="p-allergies"
          label="Allergies or fabrics to avoid"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
          placeholder="e.g. no wool wash, sensitive to enzymes"
          wrapperClassName="lg:col-span-2"
        />
      </div>
    </ProfileCard>
  );
}
