# Deploy In the Back

This is a single Node process and one JSON file. It is enough for a small web preview. It is not a multi-server setup.

Do not create host accounts from this repo. The notes below are what to buy and which settings to fill in.

## What the host needs

- A Node 22 process that stays running (`npm start`).
- A persistent disk for `data/board.json`. The file is the whole database: reader and store accounts, password hashes, sessions, the platform-chair claim, store claims, workplaces, and filings (including retracted and hidden ones). Ephemeral container disk will wipe the board on restart.
- HTTPS on the public URL. The installable PWA needs a secure origin, and the session cookie should be marked Secure.
- One process only. The write lock is a file next to `board.json`. Two processes, even on a shared volume, can fight that lock or corrupt the file. Do not scale the service horizontally.

Build on the host, or build in CI and ship `dist/` with the server:

```bash
npm ci
npm run build
ITB_HOST=0.0.0.0 ITB_SECURE_COOKIE=1 ITB_TRUST_PROXY=1 ITB_STATIC=dist npm start
```

Leave `VITE_DEMO_SEED` unset for this build. Sample workplaces are included only when that variable is exactly `1` at build time. `npm start` serves `dist/` and the API on the same origin, which is what the PWA expects.

`VITE_*` variables are read when Vite builds. Changing them later does not change a bundle that is already built.

## Environment

| Variable | Launch value | Why |
| --- | --- | --- |
| `ITB_HOST` | `0.0.0.0` | The process listens on loopback unless this is set, so the platform proxy cannot reach it. |
| `PORT` | set by the host | The server uses `PORT`, or `ITB_PORT` if you set that instead. |
| `ITB_SECURE_COOKIE` | `1` | Marks the session cookie Secure. Use this only behind HTTPS. Leave it unset for local HTTP. |
| `ITB_TRUST_PROXY` | `1` | Trust one reverse proxy and rate-limit by the client address in `X-Forwarded-For`. Unset means the socket address is used and a caller cannot spoof the limit with that header. Use `2` only if two proxies append hops. |
| `ITB_STATIC` | `dist` | Directory of the production bundle. The same process serves the app and `/api`. |
| `ITB_STORE_PATH` | a path on the persistent disk | Example: `/var/data/board.json`. The default is `data/board.json` under the working directory, which is only safe if that directory is the persistent disk. |
| `ITB_CHAIR_EMAIL` | Saul’s chair account email | The reader account Saul signs in with. Only that email can claim the chair. Do not put the address in application code. |

Optional:

- `ITB_ORIGINS` — comma-separated extra browser origins allowed to call the API. Leave unset for the same-origin PWA.
- `VITE_API_BASE` — set at **build** time only if the static app is hosted on a different origin than the API. Leave unset for the single-process setup.
- `VITE_DEMO_SEED` — set to `1` only for a private demo build. Do not set it for the public preview.

Do not set `ITB_DISABLE_RATELIMIT` on a public host.

## The chair

Set `ITB_CHAIR_EMAIL` to the email of Saul’s chair account before the public host starts. That is the reader account he signs in with. It is not the public contact address.

On a public host (`NODE_ENV=production` or `ITB_SECURE_COOKIE=1`), a missing `ITB_CHAIR_EMAIL` means nobody can claim the chair. The server logs `ITB_CHAIR_EMAIL is unset. Nobody can claim the platform chair.` Local development with the variable unset still lets the first reader account confirm and claim, so you can test the queue. The claim still happens once. A second account cannot take it.

`/staff` is not in the public nav or footer. After that account has claimed the chair, the Chair link shows only while that account is signed in. Open `/staff` directly the first time, sign in, and confirm **This is my queue**.

Reader and store pages say “a moderator.” The `/staff` title stays Platform chair.

## Public records

Official records sit beside worker reports. They are labeled Public record. The board can filter Worker reports and Public records. A record links to a place by street address and city. Unmatched records wait on `/staff` for the chair. Records older than five years are hidden. Set `ITB_RECORD_MAX_AGE_YEARS` to change that window.

Massachusetts AG citations and later health-inspection batches are a CSV or Excel file you already have:

```bash
npm run records:import -- --source ma-ag --file citations.csv
npm run records:import -- --source health --file health.xlsx
```

OSHA and Wage and Hour use the DOL data portal. That API needs `DOL_API_KEY`. This repo does not sign you up for a key. If the key is unset, the script writes nothing. If you already downloaded a bulk CSV from the portal, pass the files:

```bash
DOL_API_KEY=your-key npm run records:dol
npm run records:dol -- --osha-csv osha.csv --whd-csv whd.csv
```

The loader keeps records for every city and town in Hampden, Hampshire, Franklin, and Berkshire counties. The town list is `WESTERN_MASS_TOWNS` in `server/launch-area.mjs`. A record still links to a place on the board only when the street and the city match. The same name in two towns stays two places.

OSHA and Wage and Hour rows also have to fall in one of these NAICS prefixes (`LAUNCH_NAICS_PREFIXES` in that same file): 722 restaurants and food service, 44 and 45 retail (including grocery 445), 48 and 49 warehousing, transport, and couriers, and 31, 32, and 33 manufacturing (food, paper, metal, plastics, and the rest of that sector). Construction and healthcare stay out.

An OSHA inspection that produced citations is kept even when a complaint triggered it. A complaint with no citation, penalty, or back-wage finding is skipped. Massachusetts complaint exports are still refused.

Running an import again updates the same record instead of adding a duplicate. Credit lines read “Data: U.S. Department of Labor” and “Data: Massachusetts Attorney General.” That is a credit, not an endorsement.

No live government file is shipped in this repo. Do not commit a DOL download. Test fixtures under `test/fixtures/` are samples and are not loaded onto the board.

On Render, copy a CSV onto the disk (for example `/var/data/osha.csv`) from the service Shell, then run the import there. The service directory already has the app and `node_modules` after the Blueprint build:

```bash
npm run records:import -- --source osha --file /var/data/osha.csv
npm run records:import -- --source whd --file /var/data/whd.csv
npm run records:import -- --source osha --file /var/data/osha-no-citations.csv
npm run records:import -- --source whd --file /var/data/whd-no-violations.csv
npm run records:dol -- --osha-csv /var/data/osha.csv --whd-csv /var/data/whd.csv
npm run records:import -- --source osha-vpp-sharp --file /var/data/vpp-sharp.csv
npm run records:import -- --source hire-vets-medallion --file /var/data/hire-vets.csv
```

The same commands work on a laptop. Point `--file` at the CSVs on your computer and set `ITB_STORE_PATH` if the board file is not `data/board.json`:

```bash
ITB_STORE_PATH=data/board.json npm run records:import -- --source osha --file osha_western_mass.csv
ITB_STORE_PATH=data/board.json npm run records:import -- --source whd --file whd_western_mass.csv
ITB_STORE_PATH=data/board.json npm run records:import -- --source osha --file osha_no_citations_western_mass.csv
ITB_STORE_PATH=data/board.json npm run records:import -- --source whd --file whd_no_violations_western_mass.csv
```

Inspections and cases with no finding are stored as good news: “OSHA inspection, YYYY-MM-DD: no citations issued.” or “Wage and Hour case, YYYY-MM-DD: no violations found.” Recognition CSVs use columns `business_name, street, city, state, zip, award, year, source_url`. A claimed store can also submit an award or one reply per record. Those wait for the moderator and do not remove the record.

Leave `DOL_API_KEY` blank unless you already have one. With a key and no CSV, `npm run records:dol` asks the DOL portal and applies the same town and industry filters. Without a key and without those files, it writes nothing.

## Contact

The address on the privacy, terms, and content policy pages is inthebackcontact@gmail.com. The privacy and terms pages stay marked draft until legal review.

## Back up `board.json`

Copy `ITB_STORE_PATH` (the `board.json` file) on a schedule, and again before you upgrade the app. Restoring that file restores accounts, the chair, and filings. There is no second database.

Ignore `board.json.lock` and any `board.json.*.tmp` files. They are the write lock and in-progress writes, not the backup.

## Render

Saul picked Render: a Starter web service (about $7 a month) and a 1 GB persistent disk. `render.yaml` is the Blueprint. It creates one web service in Virginia, on Node 22, with the disk mounted at `/var/data`. The instance count is 1. Do not raise it. Two processes can corrupt `board.json`.

The Blueprint sets `ITB_HOST`, `ITB_SECURE_COOKIE`, `ITB_TRUST_PROXY`, `ITB_STATIC`, `ITB_STORE_PATH`, and `NODE_ENV`. It leaves `VITE_DEMO_SEED` unset, so sample workplaces stay out of the build. Render fills in `PORT` itself. `ITB_CHAIR_EMAIL` and `DOL_API_KEY` are typed in the dashboard. They are not written in this repo.

### Click by click

1. Open [dashboard.render.com](https://dashboard.render.com) and sign in. This repo does not create the Render account or the GitHub connection.
2. Click **New**, then **Blueprint**.
3. If Render asks to connect GitHub, choose the GitHub account that owns `sallmidas/in-the-back` and allow Render to read that repository.
4. Select the repository **in-the-back**.
5. Select the branch **`cursor/store-accounts-e486`**. That is the PR #9 branch. After this work is merged, pick the default branch instead.
6. Render reads `render.yaml`. Before you apply it, check the preview:
   - One web service named `in-the-back`
   - Plan **Starter**, region **Virginia**
   - Instances **1**
   - Disk named `board`, mount `/var/data`, size **1 GB**
   - Build command `npm ci && npm run build`
   - Start command `npm start`
   - Health check `/api/health`
   - Node version **22**
7. Render asks for the two values it cannot see in the file:
   - **ITB_CHAIR_EMAIL** — the email of Saul’s chair account, the one he will sign in with. It is not the public contact address inthebackcontact@gmail.com.
   - **DOL_API_KEY** — leave this blank. Fill it later only if you already have a DOL open-data key. Do not sign up for one as part of this deploy.
8. Do not add `VITE_DEMO_SEED`. If a box for it appears, leave it empty.
9. Click **Deploy** (Render may label this **Apply**). Wait until the service says **Live**. The first build installs packages and builds the site. That takes a few minutes.
10. Open the `onrender.com` URL Render shows.
11. On that site, create the reader account whose email is exactly `ITB_CHAIR_EMAIL`. Use a password you will remember.
12. Open `https://<your-service>.onrender.com/staff`. Sign in if the page asks. Check the box, then click **This is my queue**. After that, the Chair link shows only while that account is signed in.
13. A custom domain can wait. When you want one: open the service, **Settings**, **Custom Domains**, add the domain, and follow the DNS records Render prints. The session cookie is already marked Secure, which is what a custom HTTPS domain needs.

### Download a backup of `board.json`

Do this before you upgrade the app, and on a schedule after the board has real accounts.

1. In the Render dashboard, open the **in-the-back** service.
2. Click **Shell**.
3. Run `ls -l /var/data/board.json` and confirm the file is there.
4. Run `cat /var/data/board.json`.
5. Select the whole output, paste it into a new file on your computer, and save that file as `board.json`. Keep it private. It holds password hashes, sessions, the chair claim, store claims, and filings.
6. Also leave a copy on the disk: `cp /var/data/board.json /var/data/board.json.bak`

Do not back up `board.json.lock` or any `board.json.*.tmp` file. Those are the write lock and an unfinished write.

To put a backup back: suspend the service in the dashboard, replace `/var/data/board.json` from the Shell with the saved file, then resume the service. One instance only.

## Other hosts

Railway (one service and a volume) and Fly.io (one machine and a volume) can run the same process. Keep the machine count at one, set `ITB_TRUST_PROXY=1`, and put `board.json` on the attached disk. A host with only ephemeral disk will forget the board on every restart. Don't use that for the public preview.
