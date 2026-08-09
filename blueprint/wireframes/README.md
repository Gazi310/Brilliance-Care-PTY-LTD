# Brilliance Care — Wireframes v2

Open **`index.html`** in a browser. Everything else is reachable from the page
switcher in the dark toolbar at the top.

## What's here

24 pages sharing one stylesheet, in the approved navy `#041E60` / gold `#EAAA22`
direction from `../design-direction-v2.md`.

| Group | Pages |
|---|---|
| **Marketing** | index · laundry · cleaning · services · pricing · how-it-works · faq · contact · products · product-detail |
| **Booking & checkout** | book (4 steps) · cart · checkout · confirmed |
| **Customer account** | account-orders · invoice · profile · login |
| **Admin** | admin-dashboard · admin-orders · admin-assess · admin-schedule · admin-customers · admin-settings |

## The toolbar

- **Page switcher** — jump anywhere; your view settings follow you.
- **Desktop / Mobile** — reflows the layout in place. Mobile is a true 390px
  render, not a scaled screenshot.
- **Show what each section answers** — overlays the question each marketing
  section exists to answer. This is the argument for the new homepage order:
  nothing is sold until the fourth question.

## How it's built

- **`kit.css`** — every token and component. The `:root` block at the top drops
  straight into `client/src/index.css`.
- **`shell.js`** — injects the toolbar, site nav, breadcrumb hero, footer, tab bar
  and admin sidebar, so each page file is content only (~114 lines average).
- Responsive via **CSS container queries**, not media queries — that's what lets
  the mobile toggle reflow a 390px frame inside a desktop window. When porting to
  React, convert `@container (max-width:900px)` to a normal media query.

Pages declare themselves with `body` data attributes:

```html
<body data-page="laundry" data-title="Laundry — service page" data-nav="laundry"
      data-crumb="Home / Laundry" data-hero-title="Laundry, collected and returned"
      data-hero-sub="…" data-hero-img="laundry bags being loaded">
```

`data-shell="admin"` swaps the footer and rail for the admin chrome.

## Conventions

- **Image placeholders** are dashed frames labelled with subject and aspect ratio.
  There are 30+ across the set — search `class="imgph"` to find them all.
- **Copy and prices are real**, pulled from `server/data/*Seed.js`: Wash & Fold
  $24.99/load, Standard Clean $89 base, and the 12 shop products.
- **Gold is never used for text on white** — it measures 2.04:1 and fails WCAG.
  Gold on navy is 7.56:1. That's why the homepage stat strip is a navy card.

## Open before build

1. Phone number and ABN — placeholders in the nav, footer, contact and invoice.
2. Photography — every image slot is still a labelled frame.
3. Confirm the public "from" prices are the seed values.
