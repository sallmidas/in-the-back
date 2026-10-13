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

`npm run dev` starts the API on `http://127.0.0.1:43174` and the Vite app on [http://127.0.0.1:43173](http://127.0.0.1:43173). Vite proxies `/api` to the API. Filings, accounts, and the platform-chair claim are stored in `data/board.json` (gitignored).

Open the app. Use **Walk the demo** on the home board, or **Open demo** in the header (Harbor & Rye walk-in, disputed). Tap a room tile to filter excerpts. **How it works** explains back of house and the chair.

Empty launch catalog, no sample workplaces:

```bash
cp .env.example .env.local
# set VITE_DEMO_SEED=0 in .env.local
npm run dev
```

File a report. It is written to the server and shows on the home board and that workplace. The first account to claim **This is my queue** on `/staff` holds the chair; later accounts are refused.

To serve the production bundle and the API together:

```bash
VITE_DEMO_SEED=0 npm run build
ITB_STATIC=dist ITB_PORT=43173 npm start
```

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

The web build ships a Web App Manifest, PNG icons (192 / 512 / maskable), Apple touch icon, and installable meta tags (`apple-mobile-web-app-*`, `theme-color`, `viewport-fit=cover`). A tiny production-only service worker (`public/sw.js`) registers from `src/main.tsx` so Chromium can treat the site as installable.

**Network-only on purpose.** The SW has a fetch handler (required for installability) but does not put the board in Cache Storage. A last-seen / offline cache would keep serving a stale seeded catalog after `VITE_DEMO_SEED=0`. Install still works over HTTPS (or localhost); there is no offline board. That is a demo-seed safety tradeoff, not a missing feature. UI copy must not claim last-seen or offline caching.

Install stays optional: the browser's native Add to Home Screen UI only. This app does not intercept `beforeinstallprompt` and does not show a custom install nag.

Icons are generated with `python3 scripts/generate-pwa-icons.py` from the door wordmark.

Capacitor remains the native store path; this PWA layer is for the browser door.

## Strip the demo seed (empty directory for launch)

The ten workplaces are **labeled DEMO**. They must not ship as if they were live reviews.

When the seed is off, sample workplaces hide. The board shows only filings stored by the API. An empty board's primary action is **File a report**. Demo-only links (Harbor & Rye, Walk the demo) hide.

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
| `/how-it-works` | Product walkthrough — rooms, scores, anonymity, flags, platform chair |
| `/workplaces` | Directory with search + industry / room / score filters |
| `/workplaces/:slug` | Rooms, scores, anonymous excerpts, dispute badges |
| `/plans` | Free / Watch / Respond. Flat monthly price. Reporter pay is included, not a per-file toll. Billing held until the LLC. |
| `/staff` | Platform chair. Email and password. **This is my queue** once, on the server, for the whole platform. |
| `/privacy` | What the public board stores, and what an account is |
| `/account/delete` | Delete an account. Does not retract a file. Cannot delete the chair. |
| `/write` | File a report. Open to anyone. Saved on the server. Retract with a receipt or the account that filed it. |

Dispute copy on the board is exactly: **DISPUTED — UNDER REVIEW**. A flag leads to uphold or retract — never delete.

## Labeled DEMO workplaces

Harbor & Rye · ParcelPath · Elmhurst Mercy · Red Lantern Inn · Bluebird Counter · Lumen & Co. · Maple Court · Nightshift Motors · The Copper Kettle · Northline Market.

Each has sample rooms, scores, and anonymous reports. Two seeded disputes (Harbor & Rye walk-in, Lumen & Co. kitchen) show the badge.

## Product rules this repo is teaching

- **LLC before payouts / Watch billing.** Filing stays open. Pay stays off until the company exists. This repo has no payment code and no card form. Watch is $129/mo flat and Respond is $249/mo flat. The $3 and $5 figures are reporter pay taken from that subscription, not an extra charge to the kitchen.
- **Platform chair.** The first real account to claim **This is my queue** holds it. The claim is stored on the server and does not reopen. It is not a per-workplace claim. The public board never shows who claimed it.
- **Watch / Respond.** Watch: the kitchen can see new files as they land. Respond: the kitchen can flag a report. A flag leads to uphold or retract — never delete. Those plans are not wired to billing.
- **Share cards.** Static OG/Twitter title and description use the slogan. Tab titles follow the route (works with HashRouter). No reviewer or chair identity in share payloads.

## Store

There was no backend. The launch store is a Node HTTP API (`server/`) and one JSON file, `data/board.json`, with a lock around writes. Passwords are scrypt hashes. Sessions are httpOnly cookies. One process owns the file. That is enough for a single-server launch; more than one server would need a shared disk or a different store.

Name checks on a filing are a heuristic (common first names, a single capitalized first name, initials, titles, “my name is”, emails). They still miss all-lowercase names, names outside the list, and a few ordinary words that are also names (Mark, Grace, Long). They can mistake a First Last phrase. They block the submit. They do not rewrite the writing. Filing also asks for a required checkbox, “I was in this room.” That is the filer’s word. It is not checked, stored, or shown on the board.

## Out of scope

Payment code, payouts, wages, GPS, OAuth providers, a Resolve action, tips, a bullying or witness lane, an employment wall, and ghostwritten files. Kitchen flagging stays a product rule, not a billed feature, until the LLC exists.

## Stack

Vite, React 19, TypeScript, Tailwind v4, shadcn/ui, React Router, Capacitor 8. One web app. Two doors.

Private Origin repo: [midas-engine/in-the-back](https://cursor.com/codebase/midas-engine/in-the-back).
