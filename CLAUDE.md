# ShipNative Admin

The owner's back office at **https://admin.shipnative.uz**: Next.js (App Router) + React + TypeScript (strict) +
Tailwind v4, **static export** — no server of its own; everything comes from the backend's `/api/v1/admin/*`
(`../shipnative-backend`, see its `api/openapi.yaml`).

- Login: login + password that the Telegram bot gives admins (`/panel`, `/setlogin`, `/setpassword`) →
  `POST /admin/auth/login`. Session in localStorage; `lib/api.ts` refreshes once on 401, else back to `/login/`.
- Pages: `/` overview stats, `/users/` (search, +sites/+edits, block), `/projects/`, `/runs/` (failed filter),
  `/evals/` (pick sample briefs, start an eval run — real AI cost, shown before starting — and open the built sites).
- UI text: Uzbek (only the owner uses it). Code and comments: English.
- Deploy on the dev server: `./deploy/deploy.sh` (build → `/var/www/shipnative-admin`); nginx vhost in
  `deploy/admin.shipnative.uz.conf` (TLS by certbot, strict CSP: scripts/styles self, API at api.shipnative.uz only).
- Check before committing: `npm run build` (runs `tsc --noEmit`). Commit as Muhammad <mukhammadzaripov@icloud.com>.
