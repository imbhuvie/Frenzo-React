# FrenZo Web — Execution

## Prerequisites

- Node.js (npm) + dependencies installed.
- FrenzoAPI backend running (auth/chat endpoints) + its PostgreSQL (`frenzodb`).
- Ports used in dev: frontend `http://localhost:3000`, backend per `vite.config.ts` proxy `target`.

## Backend address (single place)

`vite.config.ts → server.proxy['/api'].target` is the only backend address in this repo
(current: `https://localhost:7172`, `secure: false` so the proxy accepts the ASP.NET dev cert).
`src/api/axios.ts` stays relative (`baseURL: '/api'`) — never hardcode host/port there.
Change backend port? Edit only the proxy `target`, then restart the dev server (proxy loads at startup).

## Run

```bash
npm install
npm run dev      # http://localhost:3000 (proxy /api/* -> target)
npm run build    # tsc -b + vite build (also the type check)
npm run preview  # serve the production build locally
```

Note: the dev proxy exists only under `npm run dev`. A production build needs its backend address
at deploy time (same-origin reverse proxy or `VITE_API_URL`-style env), not hardcoded source.

## Verify end-to-end

1. Backend up (login returns `200 { user, token, expiresAt }` in Scalar) + DB reachable.
2. `npm run dev` → open `http://localhost:3000/login`.
3. Sign up → redirected to `/login`; sign in → toast + `/chat` with profile summary.
4. DevTools Network: requests go to `:3000/api/...` (same-origin); backend `logs/` shows arrivals.
5. Expired/wrong token → API `401` → storage cleared → back to `/login`.
6. After login, `/chat` sidebar fills with live rows (or styled empty state when none);
type in search to filter; click a row to preview its header; stop the API and reload
to see the error card, then Retry after restarting.
7. Click `+` → modal lists users (search narrows server-side); **Open** selects instantly;
**+ Chat** creates-or-opens and selects the new row (same row on repeat = idempotent backend).

## Troubleshooting (seen before)

| Symptom | Cause | Fix |
|---------|-------|-----|
| Empty `text/plain` 500, no backend log line | Proxy `target` port has no listener | Start API on the proxied port, or repoint `target`; restart dev server |
| CORS / cert errors in browser | Absolute `https://...` baseURL bypassing proxy | Keep `baseURL: '/api'` (relative) |
| "Unable to connect" toast | API down / wrong port / DB down | Check API console + backend `logs/` for the request line |
| Bounced to `/login` mid-session | Expired token or API `401` | Sign in again; interceptor intentionally clears stale state |
| Port mismatch vs backend docs | Drift between repos | Source of truth: this file's proxy `target` + backend `launchSettings.json` |
