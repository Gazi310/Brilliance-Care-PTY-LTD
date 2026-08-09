# Brilliance Care — Design Direction v2

Approved: **Direction A**, palette derived from the actual logo.
Reference aesthetic: [The Laundry Lady](https://thelaundrylady.com.au/)
Status: spec the Figma wireframes are built from.

---

## 1. The problem with v1

The client's note — "the website shows all the services out of nowhere" — is a *narrative* problem, not a styling one.

Current homepage order:

1. Hero (promise + CTA)
2. **Three service tiles** ← the site starts selling before it has introduced itself
3. How it works
4. Reviews
5. Trust badges

The visitor is asked to choose a service before being given any reason to trust the company. Compare the reference site: hero → **"Welcome to The Laundry Lady. We are a national, mobile laundry service…"** in huge type on a full-width colour band → *then* services. The introduction is unmissable and comes first.

Secondary issues, all visible next to the reference:

- Everything lives inside one `max-w-6xl` container, so the page is a single uninterrupted column. The reference uses full-bleed colour bands to break the scroll into chapters.
- Type is one size too small throughout. The reference runs 40–56px section headings; ours are ~20px.
- Emoji service icons (🧺 🫧 🧴) read as placeholder. The reference uses circular tinted badges with real line icons.
- Vertical spacing is ~32px between sections; the reference is 96–120px.

---

## 2. The new homepage narrative

Every section answers one question in the visitor's head. **Nothing is sold above section 5.**

| # | Section | Question it answers | Treatment |
|---|---------|--------------------|-----------|
| 1 | **Hero** | "What is this?" | Split layout — left: headline with mixed weights, postcode field, gold CTA. Right: photo (placeholder frame for now). Full-bleed. |
| 2 | **Who we are** | "Who am I dealing with?" | Full-bleed **sky band**. Large centred intro, reference-style: *"Welcome to Brilliance Care. We're a family-run laundry and cleaning service across Melbourne's eastern suburbs…"* Founded 2023, 6+ years' experience, family-run. |
| 3 | **Credibility strip** | "Are these people legit?" | White band, 4 stats in a row: 4.9★ rating · 2,000+ customers · 30+ suburbs · fully insured. Big gold numbers, small navy labels. |
| 4 | **Why choose us** | "Why you and not someone cheaper?" | 4 cards, circular gold-tinted icon badges: free pickup & delivery · eco products · fully insured & police-checked · transparent invoicing (deposit → assess → final invoice). This is where the deposit model becomes a *feature*. |
| 5 | **Our services** | "What can I buy?" | Full-bleed **sand band**. Big centred "Our Services" heading. Three rich cards — Laundry, Cleaning, Shop — image top, description, "from $X" anchor, own CTA. |
| 6 | **How it works** | "What happens after I click?" | Full-bleed **navy band**. Reference's "How to Book" pattern: numbered STEP pills on light cards, gold CTA pill centred below. |
| 7 | **Social proof** | "Do real people like it?" | White band. Testimonial cards with names, suburbs, stars. Minimum 4, carousel on mobile. |
| 8 | **Service area** | "Do you come to me?" | Sky band. Postcode checker + eastern-suburbs list (Melbourne map graphic later, like the reference's AU map). |
| 9 | **FAQ teaser** | "What about my edge case?" | White band, 5 accordion items, link to `/faq`. |
| 10 | **Closing CTA** | — | Full-bleed navy, single gold CTA + phone number. |
| 11 | **Footer** | — | Navy, 4 columns: about blurb, quick links, services, contact/newsletter. |

---

## 3. Palette — sampled from the logo

| Token | Hex | Use |
|-------|-----|-----|
| `navy-900` | `#041E60` | **Logo navy.** Nav bar, dark bands, footer, headings |
| `navy-800` | `#0A2A73` | Dark band gradient partner |
| `navy-700` | `#123A8C` | Hover on navy surfaces |
| `navy-500` | `#2E5AAE` | Links, secondary buttons, icon strokes |
| `gold-500` | `#EAAA22` | **Logo gold. Primary CTA**, stat numbers, price tags, accents |
| `gold-600` | `#C98F14` | CTA hover / pressed |
| `gold-100` | `#FDF1D6` | Icon badge fills, highlight chips |
| `sky-100` | `#DCEEF9` | Alternating light band (the reference's pale blue) |
| `sky-50` | `#F1F8FD` | Card surfaces on white |
| `sand-50` | `#FFFBF3` | Warm alternating band |
| `ink` | `#0F2436` | Body text |
| `muted` | `#5A6B7B` | Secondary text |
| `line` | `#E2E9F0` | Borders, dividers |
| `white` | `#FFFFFF` | Base |

**Rules**

- Gold is the *only* primary-action colour. One gold button per viewport.
- Gold on navy and navy on gold both pass AA at 16px+. **Gold text on white does not** — never use `gold-500` for body copy.
- Band sequence down the homepage: `white → sky-100 → white → sand-50 → navy-900 → white → sky-100 → white → navy-900`.

Retired: the old aqua/teal/mint tokens. `mint-400 #7FE3D6` survives only as a success state.

---

## 4. Typography

| Role | Font | Desktop | Mobile | Weight |
|------|------|---------|--------|--------|
| Hero H1 | Poppins | 60px / 1.05 | 34px | 700 (mix 300 for connective words, reference-style) |
| Section H2 | Poppins | 44px / 1.15 | 28px | 700 |
| Sub-head H3 | Poppins | 22px | 19px | 600 |
| Body | Inter | 17px / 1.65 | 16px | 400 |
| Large intro body | Inter | 21px / 1.6 | 18px | 400 |
| Small / meta | Inter | 14px | 13px | 500 |
| Eyebrow | Inter | 12px, +0.12em, uppercase | — | 800 |
| Button | Inter | 16px | 15px | 700 |

---

## 5. Patterns borrowed from the reference

Worth copying:

- **Full-bleed alternating colour bands.** The single biggest reason their page feels designed and ours doesn't.
- **Huge centred section headings** with generous space above and below.
- **Circular tinted icon badges** on cards, in place of emoji.
- **Numbered STEP pills** on a dark band for the how-it-works flow.
- **Image-topped service cards** with a circular arrow button bottom-right.
- **Breadcrumb hero** on inner pages: photo with a colour scrim, breadcrumb, page title.
- **Sticky side CTA rail** (desktop): Book Online · Pricing · Contact. Ours should be navy/gold and no more than 3 items.
- **Logo overlapping the nav bar** in a white circle — gives the header a signature.

Deliberately *not* copying:

- Their pink saturation level. Navy + gold is more premium and it's the actual brand.
- Icon-under-label nav on every item — visually noisy at 9 items. Text nav, icons only on the CTA.
- The Instagram feed row — only add it once the account is active.
- Cartoon mascot. The logo's star mark is the signature instead.

---

## 6. Layout system

- Container `max-w-7xl` (1280) with colour bands breaking full-bleed.
- Desktop section padding 112px top/bottom; mobile 64px.
- Radius: cards 16px, buttons 12px, pills 999px, image frames 20px.
- Shadows soft and wide, never tight/dark: `0 12px 32px rgba(4,30,96,.08)`.
- Grid: 12-col desktop / 4-col mobile, 24px gutters.

---

## 7. Page inventory for wireframing

**Marketing (full redesign)** — `/`, `/laundry`, `/cleaning`, `/products`, `/products/:id`, `/services`, `/pricing`, `/how-it-works`, `/faq`, `/contact`

**Transactional (restyle, structure kept)** — `/book` (4 steps), `/cart`, `/checkout/:orderId`, `/order/:id/confirmed`, `/account/orders`, `/account/invoices/:id`, `/account/profile`, `/login`, `/register`

Each gets a desktop (1440) and mobile (390) frame.

---

## 8. Confirmed facts for copy

- Founded **2023**, with **6+ years' experience** in the trade.
- **Family-run**.
- Homepage stats retained as-is for now: 4.9 average rating · 2,000+ happy customers · 30+ suburbs.
- **Melbourne**-based, servicing the **eastern suburbs**.
- Logo supplied; navy `#041E60` / gold `#EAAA22`.
- **No photography yet** — every image slot is a labelled placeholder frame with an aspect ratio noted, to be swapped later.

## 9. Still open

- Real photos of team / van / completed jobs — the "who we are" and service cards will stay flat until these land.
- Any commercial/B2B client logos for a trust row.
- Phone number for the closing CTA and sticky rail.
