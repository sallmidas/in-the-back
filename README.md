# In the Back

Anonymous, **room-level** back-of-house workplace review board. Kitchens, dish pits, walk-ins, staff bathrooms, break rooms, docks, stock, overnight.

**Cleanliness, safety, dignity — scored.**

The public sees the room, the score, the shift context, and the writing. **Never the reviewer.** This is not Glassdoor and not a résumé site.

Phase 1 is a seeded board you can run in the browser and wrap as an installable app. Same TypeScript UI both times.

## One codebase, two doors

There is **one** Vite + React + TypeScript app. Capacitor is a shell around the production `dist/` build — not a second native UI.

| Door | Command | What you get |
| --- | --- | --- |
| Browser | `npm run dev` | Dev server at `http://127.0.0.1:43173` |
| Installable app | `npm run build` then Capacitor (below) | iOS / Android WebView running the same routes |
| Add to Home Screen | production `dist/` over HTTPS | PWA manifest, icons, and installable meta (see below) |

On native platforms the app uses `HashRouter` so file / Capacitor URLs still route. In the browser it uses `BrowserRouter`.

## Run (browser)

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43173](http://127.0.0.1:43173). Use **Walk the demo** on the home board, or **Open demo** in the header (Harbor & Rye walk-in, disputed). Tap a room tile to filter excerpts. **How it works** sells the product without hiring-board language.

```bash
npm run build    # production bundle into dist/
npm run preview  # serve that bundle on the same port
```

## Capacitor (installable shell)

Capacitor is initialized (`capacitor.config.ts`, app id `com.intheback.app`, `webDir: dist`). Native project folders are **not** committed until you add them on a machine with Xcode / Android Studio.

```bash
# after any UI change, rebuild and copy into the native projects
npm run cap:sync

# first time only, on a machine with the SDKs
npm run cap:add:android
npm run cap:add:ios          # macOS + Xcode

npm run cap:open:android
npm run cap:open:ios
```

`cap:sync` runs `npm run build` first. Live reload against `npm run dev` is optional later (`server.url` in Capacitor config) and is not required for Phase 1.

## Add to Home Screen (PWA basics)

The web build ships a Web App Manifest, PNG icons (192 / 512 / maskable), Apple touch icon, and installable meta tags (`apple-mobile-web-app-*`, `theme-color`, `viewport-fit=cover`). A tiny production-only service worker (`public/sw.js`) registers from `src/main.tsx` so Chromium can treat the site as installable. It is network-only — it does not cache — so a `VITE_DEMO_SEED=0` build cannot serve a stale seeded board.

Icons are generated with `python3 scripts/generate-pwa-icons.py` from the door wordmark.

Add to Home Screen still needs HTTPS (or localhost). Capacitor remains the native store path; this PWA layer is for the browser door.

## Strip the demo seed (empty directory for launch)

The ten workplaces are **labeled DEMO**. They must not ship as if they were live reviews.

When the seed is off, home, directory, workplace 404, staff queue, and write CTAs use a stronger empty catalog (restore steps + How it works). Demo-only links (Harbor & Rye, Walk the demo) hide.

**Fast path (keeps the sample data in git, hides it at runtime):**

1. Copy `.env.example` to `.env.local`
2. Set `VITE_DEMO_SEED=0`
3. Restart `npm run dev`

The home feed and directory render empty states. Restore with `VITE_DEMO_SEED=1` (or unset — default is on).

**Hard path (data gone from the bundle):**

1. In `src/data/seed.ts`, set `DEMO_WORKPLACES` and `DEMO_REPORTS` to `[]`
2. Leave `isDemoSeedEnabled()` alone, or still set `VITE_DEMO_SEED=0`

Switch lives in `src/data/demo-flag.ts`. Catalog helpers in `src/data/catalog.ts` already return empty arrays when the flag is off.

## Phase 1 routes

| Path | What it is |
| --- | --- |
| `/` | Home / recent reports |
| `/how-it-works` | Product walkthrough — rooms, scores, anonymity, disputes, staff chair |
| `/workplaces` | Directory with search + industry / room / score filters |
| `/workplaces/:slug` | Rooms, scores, anonymous excerpts, dispute badges |
| `/plans` | Free / Watch ($129 + $3/report) / Respond ($249 + $5/report) |
| `/staff` | Sign-in stub + **This is my queue** claim |
| `/privacy` | Privacy placeholder |
| `/account/delete` | Delete-account placeholder |
| `/write` | File-a-report stub (disabled; pay-on-publish not live) |

Dispute copy on the board is exactly: **DISPUTED — UNDER REVIEW**.

## Labeled DEMO workplaces

Harbor & Rye · ParcelPath · Elmhurst Mercy · Red Lantern Inn · Bluebird Counter · Lumen & Co. · Maple Court · Nightshift Motors · The Copper Kettle · Northline Market.

Each has sample rooms, scores, and anonymous reports. Two seeded disputes (Harbor & Rye walk-in, Lumen & Co. kitchen) show the badge.

## Product rules this repo is teaching

- **LLC before Stripe / payouts / live publish.** Filing and billing stay off until the company exists. This repo has no Stripe.
- **Staff chair rule.** One designated staff chair per workplace may claim the official queue. The public board never shows who claimed it. GPS / digital ID to prove the chair is out of scope here.
- **Pay-on-publish.** After LLC: drafts are free; Watch / Respond pay when a report goes live. Not billed in this demo.

## Out of scope (stubs only)

Real Stripe, payouts, real OAuth, GPS, digital ID, production deploy.

## Stack

Vite, React 19, TypeScript, Tailwind v4, shadcn/ui, React Router, Capacitor 8. One web app. Two doors.

Private Origin repo: [midas-engine/in-the-back](https://cursor.com/codebase/midas-engine/in-the-back).
