/* Verify every Tailwind class used by the Phase 6 files actually compiles
   against client/src/index.css. Uses Tailwind v4's design-system API, so it
   needs no Vite and no lightningcss native binary. */
import fs from 'node:fs';
import path from 'node:path';
import { __unstable__loadDesignSystem } from 'tailwindcss';

const root = process.argv[2];
const files = process.argv.slice(3);

async function loadStylesheet(id, base) {
  let file;
  if (id === 'tailwindcss') file = path.join(root, 'node_modules/tailwindcss/index.css');
  else if (id.startsWith('tailwindcss/')) file = path.join(root, 'node_modules', id + '.css');
  else file = path.resolve(base, id);
  if (!fs.existsSync(file) && fs.existsSync(file + '.css')) file += '.css';
  return { base: path.dirname(file), content: fs.readFileSync(file, 'utf8'), path: file };
}

const css = fs.readFileSync(path.join(root, 'src/index.css'), 'utf8');
const ds = await __unstable__loadDesignSystem(css, {
  base: root,
  loadStylesheet,
  loadModule: async () => { throw new Error('no js config'); },
});

// Pull class candidates out of className strings / template literals.
const candidates = new Set();
for (const f of files) {
  const src = fs.readFileSync(path.join(root, 'src', f), 'utf8');
  for (const m of src.matchAll(/(?:className|class)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{`([\s\S]*?)`\}|\{([\s\S]*?)\}\s*>)/g)) {
    const blob = m[1] ?? m[2] ?? m[3] ?? m[4] ?? '';
    for (const tok of blob.split(/[\s`'"${}?:()+,]+/)) {
      const t = tok.trim();
      if (!t || t.length > 90) continue;
      if (!/^[a-z0-9[\]!@:./_[\]#()%-]+$/i.test(t)) continue;
      if (!/[a-z]/i.test(t)) continue;
      candidates.add(t);
    }
  }
  // string constants assigned to class-ish vars (e.g. `const btn = '...'`)
  for (const m of src.matchAll(/const\s+\w*(?:Cls|btn|Class)\w*\s*=\s*'([^']*)'/gi)) {
    for (const tok of m[1].split(/\s+/)) if (tok) candidates.add(tok);
  }
}

const list = [...candidates].sort();
const compiled = ds.candidatesToCss(list);

// Classes that are ours (bc-*) or plain identifiers are legitimately not
// Tailwind utilities — separate them from real misses.
const OURS = /^(bc-|lt$|group$|peer$|sr-only$)/;
// A token only counts as an attempted utility if it looks like one:
// contains a hyphen/slash/bracket/colon, no dots (those are JS member
// expressions the tokenizer swept out of template literals).
const looksLikeUtility = (c) => /[-/[:]/.test(c) && !c.includes('.');
const misses = [];
list.forEach((c, i) => {
  if (compiled[i] == null && !OURS.test(c) && looksLikeUtility(c)) misses.push(c);
});

console.log('candidates checked:', list.length);
console.log('compiled OK      :', list.length - misses.length);
if (misses.length) {
  console.log('\nDID NOT COMPILE:');
  for (const m of misses) console.log('  ', m);
} else {
  console.log('\nAll Tailwind candidates compile.');
}

// Sanity: prove the checker can actually detect a bad class.
const control = ds.candidatesToCss(['bg-navy-900', 'bg-navy-950', 'shadow-card', 'shadow-nope']);
console.log('\ncontrol  bg-navy-900:', control[0] ? 'OK' : 'MISS',
            '| bg-navy-950:', control[1] ? 'OK' : 'MISS',
            '| shadow-card:', control[2] ? 'OK' : 'MISS',
            '| shadow-nope:', control[3] ? 'OK' : 'MISS');
