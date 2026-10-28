# In the Back

Anonymous, **room-level** back-of-house workplace review board. Kitchens, dish pits, walk-ins, staff bathrooms, break rooms, docks, stock, overnight.

**Cleanliness, safety, dignity — scored.**

The public sees the room, the score, the shift context, and the writing. **Never the reviewer.** This is not Glassdoor and not a résumé site.

Phase 1 is a board you can run in the browser and wrap as an installable app. Same TypeScript UI both times. Sample workplaces are off unless you opt in.

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

Open the app. With the demo off, the board starts empty and the primary action is **File a report**. **How it works** explains back of house and that a moderator reviews reports.

To walk the labeled sample workplaces, opt in and restart:

```bash
cp .env.example .env.local
# set VITE_DEMO_SEED=1 in .env.local
npm run dev
```

File a report. It is written to the server and shows on the home board and that workplace. The chair is not in the public nav. On a public host, set `ITB_CHAIR_EMAIL` (see [DEPLOY.md](DEPLOY.md)) to Saul’s chair account. That account opens `/staff`, signs in, and claims **This is my queue** once. Later accounts are refused. With the variable unset in local development, the first reader account can still claim it for testing. That account can hide a filing and put it back.

To serve the production bundle and the API together, leave `VITE_DEMO_SEED` unset:

```bash
npm run build
ITB_STATIC=dist ITB_PORT=43173 npm start
```

Hosting notes, including the persistent disk for `data/board.json` and public-record imports, are in [DEPLOY.md](DEPLOY.md).

Public records are official files, separate from worker reports. Import a citations CSV with `npm run records:import -- --source ma-ag --file citations.csv`. OSHA and Wage and Hour need `DOL_API_KEY`, or a bulk CSV you already downloaded: `npm run records:dol -- --osha-csv osha.csv --whd-csv whd.csv`. Without a key and without those files, the DOL script writes nothing. Test fixtures are not loaded onto the board.

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

**Network-only on purpose.** The SW has a fetch handler (required for installability) but does not put the board in Cache Storage. A last-seen / offline cache could keep serving sample workplaces after a build that left the demo off. Install still works over HTTPS (or localhost); there is no offline board. UI copy must not claim last-seen or offline caching.

Install stays optional: the browser's native Add to Home Screen UI only. This app does not intercept `beforeinstallprompt` and does not show a custom install nag.

Icons are generated with `python3 scripts/generate-pwa-icons.py` from the door wordmark.

Capacitor remains the native store path; this PWA layer is for the browser door.

## Demo seed

The ten workplaces are **labeled DEMO**. They are not live reviews.

They appear only when `VITE_DEMO_SEED=1` at dev-server or build time. Unset is off. A production build aliases the seed module to an empty file, so sample names are not in `dist/`.

When the seed is off, the board shows only filings stored by the API. An empty board's primary action is **File a report**.

Switch lives in `src/data/demo-flag.ts`. The Vite alias is in `vite.config.ts`.

## Phase 1 routes

| Path | What it is |
| --- | --- |
| `/` | Home / recent reports |
| `/how-it-works` | Product walkthrough — rooms, scores, anonymity, a moderator reviews reports |
| `/workplaces` | Directory with search + industry / room / score filters |
| `/workplaces/:slug` | Rooms, scores, anonymous excerpts, dispute badges |
| `/plans` | Redirects to `/stores/plans`. Reader pages do not list store prices. |
| `/stores` | For stores. What a verified store would see, and a claim call to action. |
| `/stores/plans` | Watch and Respond, labeled as a later model the store would pay. Nothing is charged now. |
| `/stores/login` | Store sign-in. Separate from a reader account. |
| `/stores/dashboard` | Claim a store, or see its rooms, scores, and anonymous filings after a moderator approves. |
| `/staff` | Platform chair. Not in the public nav. The `ITB_CHAIR_EMAIL` account signs in and claims **This is my queue** once. That account can hide and unhide a filing, and approve or refuse a store claim. |
| `/privacy` | Draft privacy notice. Pending legal review. |
| `/terms` | Draft terms of use. Pending legal review. |
| `/content` | Content policy. Rooms, not people. The moderator can hide a filing. The filer can retract. |
| `/account/delete` | Delete an account. Does not retract a file. Cannot delete the moderator account. |
| `/write` | File a report. Open to anyone. Saved on the server. Retract with a receipt or the account that filed it. |

Dispute copy on the board is exactly: **DISPUTED — UNDER REVIEW**. A flag leads to uphold or retract — never delete.

## Labeled DEMO workplaces

Harbor & Rye · ParcelPath · Elmhurst Mercy · Red Lantern Inn · Bluebird Counter · Lumen & Co. · Maple Court · Nightshift Motors · The Copper Kettle · Northline Market.

Each has sample rooms, scores, and anonymous reports. Two seeded disputes (Harbor & Rye walk-in, Lumen & Co. kitchen) show the badge.

## Product rules this repo is teaching

- **No payments during the preview.** The company is not formed. This repo has no payment code and no card form. Nothing is charged and nothing is paid. The Plans page is a preview of a later model, not a promise and not a date: Watch $129/mo for near-real-time alerts, Respond $249/mo which would add a response or dispute and a faster way to recover a rating. Planned: reporters earn a small reward once their report passes review ($3 on Watch, $5 on Respond). Reports shown to be false after a dispute earn nothing. Filing alone would not earn the reward.
- **Platform chair.** One seat, stored on the server, and it does not reopen. On a public host only the `ITB_CHAIR_EMAIL` account can claim it. The Chair link is shown only to that signed-in account. Reader and store pages say “a moderator.” The chair can hide a published filing and put it back. Hiding is not a delete, and it is not the filer's retract.
- **Watch / Respond.** Planned only. Watch: near-real-time alerts. Respond: alerts plus a response or dispute and a faster recovery of the rating. A flag, if that plan arrives, leads to uphold or retract — never delete. Those plans are not wired to billing.
- **Share cards.** Static OG/Twitter title and description use the slogan. Tab titles follow the route (works with HashRouter). No reviewer or chair identity in share payloads.

## Store

There was no backend. The launch store is a Node HTTP API (`server/`) and one JSON file, `data/board.json`, with a lock around writes. Passwords are scrypt hashes. Sessions are httpOnly cookies. One process owns the file. That is enough for a single-server launch; more than one server would need a shared disk or a different store.

Name checks on a filing are a heuristic (common first names, a single capitalized first name, initials, titles, “my name is”, emails). They still miss all-lowercase names, names outside the list, and a few ordinary words that are also names (Mark, Grace, Long). They can mistake a First Last phrase. They block the submit. They do not rewrite the writing. Filing also asks for a required checkbox, “I was in this room.” That is the filer’s word. It is not checked, stored, or shown on the board.

## Out of scope

Payment code, wages, GPS, OAuth providers, a Resolve action, tips, a bullying or witness lane, an employment wall, and ghostwritten files. Facility flagging stays a planned Respond behavior, not something the preview charges for. The contact address on the legal pages is `inthebackcontact@gmail.com`.

## Stack

Vite, React 19, TypeScript, Tailwind v4, shadcn/ui, React Router, Capacitor 8. One web app. Two doors.

Private Origin repo: [midas-engine/in-the-back](https://cursor.com/codebase/midas-engine/in-the-back).
