# RVCE Campus Events

IEEE RVCE Frontend Hiring Challenge submission.

## Setup

```bash
npm install
```

Create `.env.local`:
```
VITE_DATA_SOURCE=events.json
```
Place `events.json` in the `public/` directory.

```bash
npm run dev
```

For production / remote dataset:
```
VITE_DATA_SOURCE=https://pub-d6db99c9b68842a5b6f527e86583f256.r2.dev/events.json
```

## Features

- **Dual data-source mode** — `VITE_DATA_SOURCE` accepts a local filename (`events.json`) or a full `https://` URL. Both produce identical behaviour.
- **Runtime data normalization** — handles 20+ field variants, missing/null fields, mixed date formats, inconsistent location shapes, and bad emails gracefully. Never crashes on dirty data.
- **3 pages** — Event Feed (`/events`), Event Detail (`/event/:id`), Bookmarks (`/bookmarks`)
- **Search** — searches title + description + location + host club simultaneously
- **Dynamic filters** — event type options are derived from the actual dataset at runtime (never hardcoded) + date range chips (Today / This Week / This Month)
- **Load More pagination** — renders 30 events at a time instead of all ~12k at once
- **Bookmark persistence** — saved to `localStorage`, survives page refresh. Clear All button available.
- **GSAP animations** — entrance animations on EventCard and EventDetail page
- **Cancelled / Full badges** — shown on cards and detail page
- **Responsive grid** — 1 / 2 / 3 columns based on viewport
