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

## Contact

The address on the privacy, terms, and content policy pages is inthebackcontact@gmail.com. The privacy and terms pages stay marked draft until legal review.

## Back up `board.json`

Copy `ITB_STORE_PATH` (the `board.json` file) on a schedule, and again before you upgrade the app. Restoring that file restores accounts, the chair, and filings. There is no second database.

Ignore `board.json.lock` and any `board.json.*.tmp` files. They are the write lock and in-progress writes, not the backup.

## Hosts that fit

These three can run one Node service, attach a disk, and terminate HTTPS. Prices change; check them before signing up. This repo does not create the accounts.

1. **Render** — a web service plus a persistent disk mounted into the service. Set `ITB_STORE_PATH` to a file on that disk. Render sets `PORT` and sends `X-Forwarded-For`.
2. **Railway** — a service plus a volume. Same idea: one replica, the JSON file on the volume, `ITB_TRUST_PROXY=1`.
3. **Fly.io** — one machine and a volume. Fly terminates TLS and forwards the client address. Keep the machine count at one.

A platform that only offers ephemeral disk will forget the board every time it restarts. Don't use that for the public preview.
