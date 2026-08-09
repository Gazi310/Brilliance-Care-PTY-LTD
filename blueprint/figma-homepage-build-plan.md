# Figma Build Plan — Homepage (v2)

Target file: https://www.figma.com/design/66f0TVYLa56X070IcDEBGO/Brilliance-care-services-pty-ltd
Source of truth: `design-direction-v2.md`
Scope of this pass: **homepage only**, desktop 1440 + mobile 390.

This is the payload the `use_figma` calls consume. Everything here is resolved —
no decisions left to make while drawing, except the three flagged in §9.

---

## 1. File setup

Pages to create in the Figma file:

| Page | Contents |
|------|----------|
| `🎨 Foundations` | Colour variables swatch board, type scale specimen |
| `🧩 Components` | Button, IconBadge, Chip, StatItem, StepCard, ServiceCard, TestimonialCard, FaqRow, ImagePlaceholder |
| `🏠 Home` | `🖥 Home — Desktop 1440`, `📱 Home — Mobile 390` |

Build order matters: **Foundations → Components → Home**. Both frames instance
the same components, so a later copy change is one edit, not two.

---

## 2. Variables

One collection, `Brilliance Care`, single mode (`Value`). No dark mode yet.

**Colour**

| Variable | Hex |
|----------|-----|
| `color/navy/900` | `#041E60` |
| `color/navy/800` | `#0A2A73` |
| `color/navy/700` | `#123A8C` |
| `color/navy/500` | `#2E5AAE` |
| `color/gold/500` | `#EAAA22` |
| `color/gold/600` | `#C98F14` |
| `color/gold/100` | `#FDF1D6` |
| `color/sky/100`  | `#DCEEF9` |
| `color/sky/50`   | `#F1F8FD` |
| `color/sand/50`  | `#FFFBF3` |
| `color/ink`      | `#0F2436` |
| `color/muted`    | `#5A6B7B` |
| `color/line`     | `#E2E9F0` |
| `color/white`    | `#FFFFFF` |

**Number**

| Variable | Value |
|----------|-------|
| `space/section-y/desktop` | 112 |
| `space/section-y/mobile` | 64 |
| `space/edge/desktop` | 80 |
| `space/edge/mobile` | 20 |
| `space/gutter` | 24 |
| `size/container` | 1280 |
| `radius/card` | 16 |
| `radius/button` | 12 |
| `radius/pill` | 999 |
| `radius/image` | 20 |

Effect style `shadow/card` = `0 12 32 rgba(4,30,96,0.08)`.

---

## 3. Text styles

Poppins for headings, Inter for everything else.

| Style name | Font | Size / line | Weight | Tracking |
|---|---|---|---|---|
| `Hero/H1` | Poppins | 60 / 63 | 700 | -0.5 |
| `Hero/H1 Light` | Poppins | 60 / 63 | 300 | -0.5 |
| `Section/H2` | Poppins | 44 / 51 | 700 | -0.3 |
| `Sub/H3` | Poppins | 22 / 30 | 600 | 0 |
| `Body` | Inter | 17 / 28 | 400 | 0 |
| `Body/Large` | Inter | 21 / 34 | 400 | 0 |
| `Meta` | Inter | 14 / 20 | 500 | 0 |
| `Eyebrow` | Inter | 12 / 16 | 800 | +1.44 (0.12em), uppercase |
| `Button` | Inter | 16 / 16 | 700 | 0 |

Mobile set — same names suffixed ` Mobile`: H1 34/36, H2 28/33, H3 19/26,
Body 16/26, Body Large 18/29, Meta 13/18, Button 15/15. Eyebrow unchanged.

---

## 4. Desktop frame architecture

```
🖥 Home — Desktop 1440          W 1440 · vertical auto-layout · gap 0 · fill white · clip
├── Nav / Desktop               W fill · H 88 · fill navy/900
├── Band / Hero — White         W fill · pad 96/80/112/80 · fill white
├── Band / Who We Are — Sky     W fill · pad 112/80 · fill sky/100
├── Band / Credibility + Why    W fill · pad 112/80 · fill white · gap 96
├── Band / Services — Sand      W fill · pad 112/80 · fill sand/50
├── Band / How It Works — Navy  W fill · pad 112/80 · fill navy/900
├── Band / Reviews — White      W fill · pad 112/80 · fill white
├── Band / Service Area — Sky   W fill · pad 112/80 · fill sky/100
├── Band / FAQ — White          W fill · pad 112/80 · fill white
├── Band / Closing CTA — Navy   W fill · pad 140/80 · fill navy/900
└── Footer / Desktop            W fill · pad 80/80/40/80 · fill navy/900
```

Every band contains one `Container` child: W 1280, horizontally centred,
vertical auto-layout. Bands go full-bleed; content never does.

Band sequence check against spec §3 — `white → sky → white → sand → navy →
white → sky → white → navy`. Nine bands, ten content sections: the credibility
strip and "why choose us" share the third band. Correct.

Approximate assembled height: **~6,300px**.

---

## 5. Section specs and final copy

### 5.0 Nav / Desktop

H 88, fill `navy/900`, horizontal auto-layout, pad `0 80`, space-between, centre-aligned.

- **Left** — logo lockup: 56px circle `radius/pill` fill white containing the star
  mark, overlapping the nav's bottom edge by 12px (the reference's signature move).
  Beside it: `BRILLIANCE CARE` Inter 800 16 white, and under it `LAUNDRY & CLEANING`
  Meta 11 `sky/100`.
- **Centre** — links, `Body` 16 white, gap 28: Home · Laundry · Cleaning · Shop ·
  Pricing · How it works · Contact
- **Right** — Meta `sky/100` phone number, then Button/Primary: fill `gold/500`,
  label `navy/900`, `radius/button`, pad `14 24`, text **Book a service**

### 5.1 Hero — white band

Container: horizontal auto-layout, gap 64, centre-aligned.

**Left column** (fill, ~620 wide), vertical gap 24:

- Eyebrow, `navy/500` — `MELBOURNE'S EASTERN SUBURBS`
- H1, `navy/900`, mixed weight across two lines:
  - line 1 `Hero/H1 Light` — *Fresh laundry and a spotless home,*
  - line 2 `Hero/H1` — **without lifting a finger.**
- Body/Large, `muted` — "Family-run pickup-and-delivery laundry, plus home and
  end-of-lease cleaning, right across Melbourne's eastern suburbs. Free pickup and
  delivery, a price up front, and no surprises on the invoice."
- Postcode row, horizontal gap 12:
  - Input 300×56, fill white, 1px `line` border, `radius/button`, placeholder
    "Enter your postcode" `Body` `muted`
  - Button H 56 — **Check my area**, fill `gold/500`, label `navy/900`
- Meta row, `muted`, gap 20 — `✓ Free pickup & delivery`  `✓ Fully insured`  `✓ 7 days a week`

**Right column** — `IMG / hero-doorstep / 600×520` (7:6).
Label: "PHOTO — team member handing back laundry bags at a front door".

### 5.2 Who we are — sky band

Container: vertical, centre-aligned, text max-width 900, gap 24.

- Eyebrow `navy/500` — `WHO WE ARE`
- H2 `navy/900`, centred — **Welcome to Brilliance Care.**
- Body/Large `ink`, centred — "We're a family-run laundry and cleaning service based
  in Melbourne, looking after homes right across the eastern suburbs. We started
  Brilliance Care in 2023 and brought more than six years in the trade with us — and
  we still treat every basket, and every home, like it's our own."
- Body `muted`, centred — "No call centres. No rotating contractors. Just a small
  team that turns up when we say we will."
- Meta `navy/500`, centred — "— The Brilliance Care family"

### 5.3 Credibility strip — navy card straddling the band edge

**Deviation from spec, deliberate — see §9.** The spec asked for gold stat numbers on
the white band. Gold `#EAAA22` on white measures **2.04:1**, which fails even the 3:1
floor for large text; `gold/600` only reaches 2.83:1, still short. Rather than lose the
gold numerals, the strip sits in a navy card: gold on `navy/900` measures **7.56:1**
and passes AAA.

Card: W 1280, fill `navy/900`, `radius/card`, pad `48 40`, `shadow/card`,
margin-top **-64** so it overlaps the sky/white boundary.
Horizontal auto-layout, 4 equal columns, gap 24, 1px `navy/700` dividers between.

| Number (`Poppins 700 44`, `gold/500`) | Label (`Meta`, `sky/100`) |
|---|---|
| 4.9 ★ | Average customer rating |
| 2,000+ | Happy customers |
| 30+ | Suburbs serviced |
| 100% | Insured & police-checked |

### 5.4 Why choose us — same white band

- Eyebrow centred `navy/500` — `WHY BRILLIANCE CARE`
- H2 centred `navy/900` — **Why people stay with us**
- 4 cards, horizontal, gap 24, each W 302 (1280 − 3×24 ÷ 4)

Card: fill white, 1px `line`, `radius/card`, pad 32, `shadow/card`, vertical gap 16.
Contains IconBadge (64px circle, fill `gold/100`, line icon `navy/500`), `Sub/H3`
`navy/900`, `Body` `muted`.

| Icon | Title | Body |
|---|---|---|
| van | Free pickup & delivery | We collect from your door and bring everything back folded, on a day that suits you. No delivery fee on laundry and cleaning bookings. |
| leaf | Eco-friendly products | Gentle, low-tox detergents and cleaning products that are safe around kids, pets and sensitive skin. |
| shield | Insured & police-checked | Every member of our team is fully insured and police-checked before they set foot in your home. |
| receipt | No-surprise invoicing | You get an estimate up front and pay a 50% deposit. We only invoice the balance once we've weighed and assessed the real job — so you never overpay. |

The fourth card is where the deposit model stops being a payment mechanic and starts
being a selling point. Keep it fourth: it lands after trust is established.

### 5.5 Our services — sand band

- Eyebrow centred `navy/500` — `OUR SERVICES`
- H2 centred `navy/900` — **What we can take off your hands**
- 3 cards, horizontal, gap 32, each W 405

Card: fill white, `radius/card`, clip content, `shadow/card`, vertical.
Image placeholder 405×240 (17:10) on top, then body pad 28: `Sub/H3` `navy/900`,
`Body` `muted`, spacer, price row — amount `Poppins 700 22` `navy/900` + unit `Meta`
`muted` — and a 48px circular `gold/500` arrow button bottom-right.

| Card | Image label | Body | Price |
|---|---|---|---|
| Laundry | folded laundry stack, warm light | Wash, dry, fold and ironing, collected from your door and back within 48 hours. Priced by the load or by the item — whichever suits you. | from **$24.99** a load |
| Cleaning | cleaner in a bright living room | Regular home cleans, deep cleans and end-of-lease bond cleans. Priced on the size of your home, not a guess over the phone. | from **$89** a visit |
| Shop | eco detergent bottles on a shelf | Eco detergents, wool dryer balls and laundry essentials, delivered with your next order. | Browse the shop |

Prices are the live seed values (`server/data/laundrySeed.js`, `cleaningSeed.js`) —
Wash & Fold $24.99/load, Standard Home Clean $89 base. Confirm these are the numbers
to show publicly before sign-off.

### 5.6 How it works — navy band

- Eyebrow centred `gold/500` — `HOW IT WORKS`
- H2 centred white — **Booking takes about two minutes**
- 4 step cards, horizontal, gap 24, each W 302

Card: fill white, `radius/card`, pad 28, vertical gap 12. STEP pill on top —
horizontal auto-layout, fill `gold/100`, `radius/pill`, pad `6 14`, label `Eyebrow`
`navy/900`. Then `Sub/H3` `navy/900`, `Body` `muted`.

| Pill | Title | Body |
|---|---|---|
| STEP 1 | Get your estimate | Tell us what you need and when. You'll see a price estimate straight away. |
| STEP 2 | Pay a 50% deposit | Lock the booking in with half up front. The rest waits until the job's done. |
| STEP 3 | We pick up and get to work | We collect at your chosen time, weigh and assess the real job, then do it properly. |
| STEP 4 | Final invoice, then delivery | You're invoiced for the actual amount, minus your deposit, and we bring everything back. |

Below, centred, gap 48: Button `gold/500` / `radius/pill` / pad `18 40` —
**Get my estimate**, then Meta `sky/100` — "No card needed to see your price."

### 5.7 Reviews — white band

- Eyebrow centred `navy/500` — `REVIEWS`
- H2 centred `navy/900` — **2,000 customers, 4.9 stars**
- 4 cards, horizontal, gap 24, each W 302

Card: fill white, 1px `line`, `radius/card`, pad 28, vertical gap 16. Star row
(5 × 18px `gold/500`), `Body` `ink` quote, `Meta` `muted` attribution.
Stars carry meaning, so pair them with a visually-hidden "5 out of 5" text layer for
the accessibility annotation — gold stars on white are decorative-strength only.

| Quote | Attribution |
|---|---|
| "They picked up Tuesday and everything was back Thursday, folded better than I'd ever manage. I haven't done a wash in four months." | Priya M. · Box Hill |
| "Booked an end-of-lease clean two days before handover and got the full bond back. The agent actually commented on it." | Daniel R. · Ringwood |
| "Same two people every fortnight, which matters to me. They know where things go now." | Helen T. · Camberwell |
| "The estimate was $140 and the final invoice came to $128, because the load was lighter than we thought. First time a service has charged me less than quoted." | Marcus O. · Glen Waverley |

The fourth quote does the work of explaining the invoicing model in a customer's own
words — it's doing more than social proof, so don't drop it in a trim.

### 5.8 Service area — sky band

Container: horizontal, gap 64, top-aligned.

**Left** (fill), vertical gap 24:

- Eyebrow `navy/500` — `SERVICE AREA`
- H2 `navy/900` — **We cover Melbourne's eastern suburbs**
- Body `muted` — "If you're inside the ring below, we'll pick up from your door. Not
  sure? Pop your postcode in and we'll tell you straight away."
- Postcode row: input 260×56 + Button `gold/500` **Check**
- Chip list, wrap, gap 8 — Chip: fill white, `radius/pill`, pad `8 16`, `Meta` `ink`:
  Box Hill · Camberwell · Doncaster · Ringwood · Glen Waverley · Blackburn · Balwyn ·
  Mount Waverley · Kew · Nunawading · Vermont · Burwood

**Right** — `IMG / service-map / 560×420` (4:3).
Label: "MAP — Melbourne east with service radius highlighted".

### 5.9 FAQ teaser — white band

- H2 centred `navy/900` — **Questions we get a lot**
- Accordion list, max-width 860, centred

Row: horizontal auto-layout, pad `24 0`, 1px `line` bottom border, space-between —
question `Sub/H3` `navy/900`, chevron 24px `navy/500`. First row expanded with its
answer in `Body` `muted`.

1. **How does the deposit work?** *(expanded)* — "You pay 50% when you book, based on
   your estimate. Once we've collected and assessed the real job we send a final
   invoice for the balance — which is often less than the estimate. You settle that on
   delivery."
2. How long does laundry take?
3. Which suburbs do you cover?
4. Are your products safe for sensitive skin?
5. Can I book a regular fortnightly clean?

Below, centred: **See all FAQs →** `Button` style, `navy/500`.

### 5.10 Closing CTA — navy band

Pad `140 80`, centred, max-width 760, gap 24.

- H2 white — **Ready for your last laundry day?**
- Body/Large `sky/100` — "Get a price in under two minutes. Free pickup and delivery
  right across the eastern suburbs."
- Button `gold/500`, `radius/pill`, pad `18 44`, label `navy/900` — **Get my estimate**
- Meta `sky/100` — "Or call us on [PHONE — TBC], 7am to 7pm, seven days."

### 5.11 Footer — navy

Pad `80 80 40 80`. 4 columns, gap 24. Column heads `Eyebrow` `gold/500`, links `Body`
`sky/100`.

- **Col 1** (fill 400) — logo lockup; Body `sky/100` "Family-run laundry and cleaning,
  looking after Melbourne's eastern suburbs since 2023."; Meta ABN line *(TBC)*
- **Col 2 · SERVICES** — Laundry · Cleaning · End of lease · Shop · Pricing
- **Col 3 · COMPANY** — About us · How it works · Service area · FAQ · Contact
- **Col 4 · GET IN TOUCH** — phone *(TBC)*, email, hours; newsletter input + `gold/500`
  **Sign up** button

Bottom bar: 1px `navy/700` top border, pad `24 0`, space-between —
Meta `sky/100` "© 2026 Brilliance Care Pty Ltd. All prices AUD, GST included."
and "Privacy · Terms".

### 5.12 Sticky side CTA rail (desktop only)

Floating layer, right edge, vertically centred, vertical auto-layout gap 8. Three
pills only, fill `navy/900`, `radius/pill`, pad `14 18`, icon `gold/500` + label white
`Meta`: **Book online** · **Pricing** · **Contact**. Draw it as a detached frame
labelled "OVERLAY — sticky rail" so it doesn't disturb the page auto-layout.

---

## 6. Mobile 390 — deltas only

Frame W 390, vertical auto-layout, band pad `64 20`, container fills.
Type swaps to the ` Mobile` style set throughout.

| Section | Change |
|---|---|
| Nav | H 64 — logo left, hamburger right. Plus the app's bottom tab bar, H 64, pinned. |
| Hero | Single column. Text first, then `IMG / hero-doorstep / 350×280`. Postcode input full width, button full width beneath it. |
| Credibility | Navy card becomes a 2×2 grid, gap 24, pad 32. Overlap reduced to -40. |
| Why choose us | 1 column, 4 full-width cards, gap 16. |
| Services | Horizontal scroll carousel — cards W 300, gap 16, 24px peek on the right edge. |
| How it works | Vertical stack, full-width cards, STEP pill inline with the title. |
| Reviews | Horizontal scroll carousel, cards W 300. |
| Service area | Text first, then `IMG / service-map / 350×260`. Chips wrap. |
| FAQ | Full width, all rows collapsed including the first. |
| Closing CTA | Pad `80 20`. Button full width. |
| Footer | Columns collapse into stacked accordions; bottom bar wraps to two lines. |
| Side rail | Removed — the bottom tab bar covers it. |

---

## 7. Placeholder image convention

No photography exists yet, so every image slot is a labelled frame:

- Name: `IMG / <subject> / <w>×<h>`
- Fill `sky/50`, 1.5px **dashed** `line` stroke, `radius/image`
- Centred `Meta` `muted` label: subject description + aspect ratio

Seven slots this pass: hero-doorstep, service-laundry, service-cleaning, service-shop,
service-map, and the two mobile re-crops. Group them under a Figma section named
`📷 To swap` so the whole set is findable when photos land.

---

## 8. Build order for `use_figma`

1. Variables collection + all colour/number variables
2. Text styles (desktop set, then mobile set)
3. `shadow/card` effect style
4. Components: ImagePlaceholder → IconBadge → Chip → Button → StatItem → StepCard →
   ServiceCard → TestimonialCard → FaqRow
5. Desktop frame, band by band, top to bottom
6. Mobile frame, reusing the same component instances
7. `get_screenshot` on both, verify against §5 and the band sequence

Do steps 1–3 in a single `use_figma` call; they're independent of each other and
round-trips are the expensive part.

---

## 9. Open items — need a decision before sign-off

1. **Credibility strip contrast.** Spec said gold numerals on the white band; that
   fails AA at 2.04:1. Plan puts them in a navy card instead (7.56:1). Needs a yes.
2. **Phone number.** Three slots reference it — hero nav, closing CTA, footer — and
   it's still TBC. Same for the ABN in the footer.
3. **Public "from" prices.** $24.99/load and $89/visit come from the seed data. Confirm
   they're the right public anchors and not internal test values.

Still outstanding from `design-direction-v2.md` §9 and unchanged: real photography,
and any B2B client logos for a trust row.
