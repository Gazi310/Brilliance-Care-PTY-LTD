# Migration Plan — v1 app → v2 design

Turning the existing React app into the wireframes in `blueprint/wireframes/`.
Nine phases. Each one is a self-contained chunk you can start and finish, and the
app stays shippable at every checkpoint.

Reference: `wireframes/kit.css` (tokens + components) · `design-direction-v2.md` (the spec)

---

## What we're actually dealing with

Facts from the current codebase, not guesses:

| | |
|---|---|
| Client source | ~11,200 lines across 108 files |
| Styling | Tailwind v4, tokens in `@theme` in `client/src/index.css` (45 lines) |
| Old palette in use | `navy` ×88, `aqua` ×87, `teal` ×31, `mint` ×6, `surface` ×59 — **271 class occurrences to migrate** |
| Tokens that survive unchanged | `ink #0F2436`, `muted #5A6B7B`, `line #E2E9F0` — identical in the new kit |
| Routes | All 24 already exist in `AppRoutes.jsx`. Nothing new to wire. |
| **Still "Coming soon" stubs** | `/services`, `/pricing`, `/how-it-works`, `/faq`, `/contact`, `/account/profile` — 6 pages, 12–16 lines each |
| Dead files | 9 empty (0-byte): `Home.jsx`, `Button.jsx`, `Loader.jsx`, `Navbar.jsx`, `App.js`, `App.css`, `index.js`, `constants.js`, `helpers.js` |
| Scratch files | `_verify_dsm.jsx`, `_verify_os.js`, `_verify_products.jsx` at `src/` root (~700 lines) |
| Homepage entry | `/` → `layout/Main.jsx` → `Hero` + `TabsSection` + `HomeSections`. `pages/Home.jsx` is a 0-byte decoy. |

**Two of those matter a lot for planning.** Six pages aren't restyle jobs — they don't
exist yet, so they're *build from scratch* and carry no regression risk. And the
homepage lives in `layout/Main.jsx`, not `pages/Home.jsx`, so don't go looking in the
obvious place.

---

## Fidelity: which pages follow the wireframe, which just change clothes

The wireframes are a design reference, not a spec to match pixel for pixel. Two
different jobs here, and mixing them up is how a migration turns into a rewrite.

| Fidelity | Pages | What happens |
|---|---|---|
| **Restructure** | Homepage · `/services` · `/pricing` · `/how-it-works` · `/faq` · `/contact` · `/account/profile` · `/products` · `/products/:id` · `/cart` | Layout follows the wireframe. Sections, order and composition all change. |
| **Restyle** | `/laundry` · `/cleaning` · `/book` · `/checkout` · `/order/:id/confirmed` · `/account/orders` · `/account/invoices/:id` · `/login` · `/register` · all 6 admin screens | **Structure stays exactly as it is.** Palette, type, buttons, cards, inputs, spacing, radii and shadows all move to the new kit. No JSX trees get rebuilt. |

Homepage is restructured because the section *order* is the thing the client
objected to — restyling it without reordering doesn't answer the complaint. The six
stub pages are restructured by default since there's nothing there to preserve.

Everything in the restyle column is a mechanical job, not a creative one. See the
recipe below.

---

## The restyle recipe

For restyle pages, don't open the wireframe and copy it. Work through the existing
file and apply these swaps. It's close to find-and-replace, and it's the fastest
route to a coherent product.

**The single biggest change is that v2 has no gradients.** v1 leans on
`bg-gradient-to-r from-navy to-aqua` throughout; v2 is flat navy with gold as the only
action colour. Killing the gradients does most of the visual work on its own.

| v1 | v2 | Note |
|---|---|---|
| `bg-gradient-to-br from-navy-d to-aqua-d` | `bg-navy-900` | Hero and dark bands go flat |
| `bg-gradient-to-r from-navy to-aqua` | `bg-gold-500 text-navy-900` | It was a CTA — CTAs are gold now |
| `bg-navy` · `bg-navy-d` | `bg-navy-900` | |
| `text-navy` | `text-navy-900` | |
| `bg-aqua` · `bg-aqua-d` | `bg-gold-500` (action) or `bg-navy-500` (accent) | Decide by role, not by colour |
| `text-aqua-d` · `text-aqua` | `text-navy-500` | Never gold — fails contrast on white |
| `bg-mint` · `text-mint` | success states only | `#7FE3D6` survives as a success tint |
| `bg-teal*` · `text-teal*` | `bg-navy-700` | |
| `bg-surface` | `bg-sky-50` | |
| `text-faint` | `text-muted` | Fold `faint` out as you go |
| `shadow-soft` | `shadow-card` | |
| `shadow-cta` | `shadow-lift` | |
| Emoji icons (📍 🧺 🫧) | `<IconBadge icon={…}>` | Emoji reads as placeholder — it's a named complaint |

Beyond the swaps, three things apply everywhere:

- **Type goes up a size.** Section headings were ~20px; v2 runs 44px desktop / 28px
  mobile. Body 17px, large intro 21px.
- **Spacing goes up a lot.** v1 sits at ~32px between sections; v2 is 112px desktop /
  64px mobile. This is most of why the wireframes feel designed.
- **One gold button per viewport.** If a screen has three gold CTAs, two of them
  should be `variant="outline"`.

---

## The one strategic decision: parallel tokens

The tempting move is to rewrite `index.css` in one go. Don't. 271 class occurrences
point at `navy`/`aqua`/`teal`/`mint`, so a big-bang swap leaves every unmigrated page
looking broken for as long as the migration takes — which is exactly when the client
asks for a demo.

Instead: **add the new tokens alongside the old ones.** The new names don't collide
(`navy-900` vs the old bare `navy`), so both palettes coexist. Each page migrates
independently and looks finished the moment it's done. Phase 9 deletes the old tokens,
and anything still referencing them breaks loudly and visibly.

```css
/* client/src/index.css — Phase 1 adds this; nothing is removed yet */
@theme {
  /* --- v2 (new) --- */
  --color-navy-900:#041E60; --color-navy-800:#0A2A73;
  --color-navy-700:#123A8C; --color-navy-500:#2E5AAE;
  --color-gold-500:#EAAA22; --color-gold-600:#C98F14; --color-gold-100:#FDF1D6;
  --color-sky-100:#DCEEF9;  --color-sky-50:#F1F8FD;   --color-sand-50:#FFFBF3;

  --shadow-card:0 12px 32px rgba(4,30,96,.08);
  --shadow-lift:0 24px 56px rgba(4,30,96,.18);

  /* --- v1 (retire in Phase 9) --- */
  --color-navy:#0E4D8B; --color-aqua:#16B4C4; /* …unchanged for now… */
}
```

`ink`, `muted` and `line` already hold the right values — leave them alone.
`surface #EDF3F8` becomes `sky-50 #F1F8FD`; `faint #93A4B3` has no v2 equivalent, so
keep it for now and fold it into `muted` opportunistically.

**Two hard rules, carried over from the wireframes:**

1. **Gold is never text on white.** `#EAAA22` on white measures 2.04:1 and fails WCAG;
   `gold-600` only reaches 2.83:1. Gold on `navy-900` is 7.56:1. Gold is for button
   *fills*, icon badges, and text *on navy* — never body copy or headings on a light band.
2. **Container queries → media queries.** The wireframes use `@container (max-width:900px)`
   so the Desktop/Mobile toggle can reflow inside a desktop window. In React you want
   Tailwind's normal `lg:` / `md:` breakpoints. 900px sits between Tailwind's `md` (768)
   and `lg` (1024) — **use `lg:` as the desktop breakpoint** and let mobile styles be the base.

---

## Component layer to build first

The wireframes are built from ~20 repeating pieces. Building them as React primitives
before touching any page is what stops each page from re-inventing spacing and colour.
Put them in `components/ui/`.

| Component | Props | Replaces (kit.css) |
|---|---|---|
| `<Band>` | `tone="white\|sky\|sand\|navy"`, `size="default\|sm"`, `question` | `.band .b-*` |
| `<Container>` | `width="default\|narrow"` | `.container .narrow` |
| `<SectionHead>` | `eyebrow`, `title`, `sub`, `align` | `.head` |
| `<Button>` | `variant="gold\|navy\|outline\|ghost"`, `size`, `pill`, `block` | `.btn .btn-*` |
| `<Card>` | `flat` | `.card .card-flat` |
| `<IconBadge>` | `icon`, `size` | `.badge` |
| `<Chip>` / `<Tag>` | `active` / `tone="ok\|warn\|bad\|info\|gold"` | `.chip .tag-*` |
| `<Notice>` | `tone="info\|ok\|warn"` | `.notice-*` |
| `<ImagePlaceholder>` | `subject`, `ratio` | `.imgph` |
| `<PageHero>` | `title`, `sub`, `crumbs`, `image` | `.ihero .crumb` |
| `<StatStrip>` | `stats[]` | `.statcard` |
| `<PriceTable>` | `columns`, `rows` | `.ptable` |
| `<PlanCard>` | `featured` | `.plan` |
| `<Accordion>` / `<AccordionItem>` | `defaultOpen` | `details.q` |
| `<StepCard>` | `step`, `title` | `.stepcard .pill` |
| `<Stepper>` | `steps`, `current` | `.stepper` |
| `<Timeline>` | `items[]` with `state` | `.tl` |
| `<LineItems>` / `<SummaryCard>` | `lines[]`, `sticky` | `.lines .summary` |
| `<DataTable>` | admin tables | `.dtable` |
| `<KpiCard>` | `label`, `value`, `delta` | `.kpi` |

`<Band>`'s `question` prop is worth keeping — it's what powers the "show what each
section answers" overlay. Ship it behind a dev-only flag and you keep the client
demo tool alive in the real app.

---

# The phases

## Phase 1 · Foundation and shell
**Nothing visible is "done" yet, but every page moves halfway.**

- Add v2 tokens to `index.css` alongside v1 (above).
- Build the `components/ui/` primitives table above.
- Migrate the shell, which appears on every route:
  - `layout/Header.jsx` (355 lines — the biggest single file in the app)
  - `layout/Footer.jsx`
  - `layout/BottomTabBar.jsx`
  - `admin/AdminLayout.jsx` + `admin/AdminBottomTabBar.jsx`
- Delete the 9 empty stubs and 3 `_verify_*` scratch files. Confirm nothing imports
  them first — `Home.jsx` in particular looks load-bearing and isn't.

**Files:** ~8 changed, ~20 created · **Done when:** nav and footer match the wireframe
on every route, and the old pages still render without crashing.

---

## Phase 2 · Homepage — RESTRUCTURE
**The page the client actually rejected. Highest signal, do it early.**

Wireframe: `wireframes/index.html`

- Rebuild `layout/Main.jsx` as the 11-section narrative in the approved band sequence:
  `white → sky → white → sand → navy → white → sky → white → navy`.
- `home/Hero.jsx` — split layout, mixed-weight H1, postcode checker. Keep the existing
  `getSettings()` postcode logic; it already works.
- `home/TabsSection.jsx` and `home/TabCard.jsx` become the **service cards** in the sand
  band (section 5) — they move *down* the page, which is the entire point of the redesign.
- `home/HomeSections.jsx` splits into: `WhoWeAre`, `StatStrip`, `WhyUs`, `HowItWorks`,
  `Reviews`, `ServiceArea`, `FaqTeaser`, `ClosingCta`.
- Fix the copy bug: the hero currently says **"30+ Sydney suburbs"**. It's Melbourne.

**Files:** ~5 changed, ~8 created · **Done when:** the section order matches the wireframe
and nothing sells above section 5.

> **Checkpoint — show the client the homepage before going further.**

---

## Phase 3 · The six missing pages — BUILD NEW
**Currently "Coming soon". Pure addition, zero regression risk, kills the unfinished feel.**

| Route | File | Wireframe |
|---|---|---|
| `/services` | `pages/Services.jsx` | `services.html` |
| `/pricing` | `pages/Pricing.jsx` | `pricing.html` |
| `/how-it-works` | `pages/HowItWorks.jsx` | `how-it-works.html` |
| `/faq` | `pages/Faq.jsx` | `faq.html` |
| `/contact` | `pages/Contact.jsx` | `contact.html` |
| `/account/profile` | `pages/Profile.jsx` | `profile.html` |

Pricing and how-it-works both need the **worked example** — estimate → deposit →
assessed lower → balance. That's the strongest sales asset in the whole set; don't
trim it to save space.

Contact and Profile need real form handling — wire Contact to a `POST /api/contact`
endpoint (server work, small) and Profile to the existing user endpoints.

**Files:** 6 rewritten from 12-line stubs · **Done when:** no route in the top nav
says "Coming soon".

---

## Phase 4 · Service pages — RESTYLE
**Structure stays. This is now a quick phase — mostly the recipe above.**

- `pages/LaundryServices.jsx` (55 lines) + `laundry/LaundryOverview.jsx`,
  `LaundryCatalogue.jsx`, `LaundryServiceCard.jsx`, `LaundryServiceInfo.jsx`
- `pages/CleaningServices.jsx` (143 lines) + `cleaning/CleaningServiceCard.jsx`

Apply the class swaps, drop the gradients, lift the type and spacing, replace emoji
with `<IconBadge>`. Keep the existing catalogue and card composition — it works.

Two optional borrowings from the wireframe, only if they're cheap on the day:
`<PageHero>` for a breadcrumb header, and the three-tier `<PlanCard>` treatment for
cleaning. **Skip both if they'd mean restructuring** — the plan is a restyle.

Retire `pages/LaundryBook.jsx` (10-line redirect) once nothing links to it.

**Files:** ~7 changed · **Done when:** both pages sit next to the new homepage without
looking like a different website.

> **Checkpoint — the whole marketing site is now v2. Second client review.**

---

## Phase 5 · Shop — RESTRUCTURE
Wireframes: `products.html`, `product-detail.html`, `cart.html`

- `pages/Products.jsx` (182) — filter chips, sort, 4-up `<ProductCard>` grid
- `pages/ProductDetail.jsx` (222) — gallery, thumbs, qty stepper, related products
- `pages/Cart.jsx` (190) — `<LineItems>` rows, sticky `<SummaryCard>`
- Keep the flat delivery-fee notice prominent on all three; it's the one shop rule
  customers get wrong.

**Files:** ~6 changed · **Watch for:** `products/AdminPanel.jsx` (344 lines) is admin
UI living in the shop folder — leave it until Phase 8.

---

## Phase 6 · Booking and checkout — RESTYLE
**The revenue path. Most careful phase — appearance only, no logic and no restructuring.**

Wireframes: `book.html`, `checkout.html`, `confirmed.html`

- `booking/BookingFlow.jsx` (361 lines) — swap the step chrome for `<Stepper>`
- `StepBuildLaundry`, `StepBuildCleaning`, `StepSchedule`, `StepDetails`, `StepReview`
- `booking/QtyStepper.jsx` → the kit's `.qty` styling
- `booking/SlotField.jsx` + `products/SlotCalendar.jsx` (373 lines) — the slot grid
- `pages/Checkout.jsx`, `common/CardPaymentForm.jsx`, `pages/OrderConfirmed.jsx`,
  `booking/OrderTimeline.jsx` → `<Timeline>`

Do **not** touch `BookingContext.jsx` (294 lines) — the estimate engine mirrors the
server and any drift silently produces wrong prices.

**Files:** ~12 changed · **Done when:** a full booking completes end-to-end with the
same totals as before. Test with a card ending `0002` to confirm the decline path
still works.

---

## Phase 7 · Customer account — RESTYLE
Reference only: `account-orders.html`, `invoice.html`, `login.html`

- `pages/Orders.jsx` + `account/OrderCard.jsx` (192) — status tags, per-state CTAs
- `pages/Invoice.jsx` (164) + `invoice/InvoiceLineItem.jsx`, `InvoiceTotals.jsx` —
  the est-vs-actual table, and the green "came in lighter" `<Notice>`
- `pages/Login.jsx` (119) + `pages/Register.jsx` (107) + `common/LoginCard.jsx` —
  merge into the tabbed layout from the wireframe
- `common/FloatingInput.jsx` — replace with the kit's plain `.field` + `.label`

The invoice page is where the deposit model either reads as generous or as confusing.
Lead with the explanation `<Notice>`, not the table.

**Files:** ~9 changed

---

## Phase 8 · Admin — RESTYLE
**Internal-facing, so it goes last — but it's the biggest surface area.**

Wireframes: the six `admin-*.html` files

| Page | Files |
|---|---|
| Dashboard | `admin/Dashboard.jsx` + `dashboard/KpiGrid`, `NeedsAction`, `TodayJobs` |
| Work queue | `admin/Orders.jsx` (159) + `orders/AdminOrderRow`, `StatusControl` |
| Assess & invoice | `admin/OrderDetail.jsx` (192) + `orders/AssessPanel` (313), `InvoicePanel` (204) |
| Schedule | `admin/Schedule.jsx` (201) + `schedule/DayStrip`, `SlotManager` |
| Customers | `admin/Customers.jsx`, `CustomerDetail.jsx` + 4 `customers/*` components |
| Settings + catalogue | `admin/Settings.jsx`, `Services.jsx`, `Cleaning.jsx`, `Products.jsx` + the 3 big admin panels |

Start with **Assess & Invoice**. It's the screen the business actually runs on, and
`AssessPanel.jsx` at 313 lines is the most complex component in the app.

**Files:** ~25 changed · **Note:** the three admin panels (`AdminPanel` 344,
`CleaningAdminPanel` 328, `LaundryAdminPanel` 248) are 920 lines between them and
mostly forms — good `<DataTable>` and `<Card>` candidates, low creative risk.

---

## Phase 9 · Cleanup and audit

- Delete v1 tokens from `@theme`: `navy`, `navy-d`, `aqua`, `aqua-d`, `mint`, `teal`,
  `teal-d`, `surface`. Anything still referencing them now breaks visibly — that's the point.
- `grep -r "aqua\|mint\|teal\|bg-surface" client/src` must return nothing.
- Contrast audit: no gold text on white anywhere.
- Check every image placeholder is either a real photo or an intentional placeholder.
- Responsive pass at 390 / 768 / 1440.
- Keyboard focus visible on every interactive element; `prefers-reduced-motion` respected.

---

## Suggested order if you want to move faster

Phases 3 and 4 are independent of each other, and Phase 8 is independent of everything
after Phase 1. If you want parallel tracks: Phase 1 → then 2, and 8 can run alongside
3–7 since admin shares only the shell.

The sequencing above optimises for **client-visible progress**: after Phase 4 you can
demo a complete, coherent marketing site while the transactional pages are still v1.

---

## Open items blocking a truly finished build

Unchanged from `design-direction-v2.md`, all three still outstanding:

1. **Phone number and ABN** — placeholders in the nav, footer, contact page and invoices.
2. **Photography** — 30+ labelled image slots across the wireframes.
3. **Public "from" prices** — confirm $24.99/load and $89/visit are the right anchors.

Plus one found during this audit:

4. **The hero says "Sydney"** — `home/Hero.jsx` line 88. The business is Melbourne-based
   and services the eastern suburbs. Fix it in Phase 2 at the latest.
