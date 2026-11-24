# notes-web

React SPA (Vite) served from a Cloudflare Worker. Requests to `/api/*` are
forwarded to the `notes-api` Worker through a service binding.

## Scripts

- `npm run dev` starts the Vite dev server (Worker runs in workerd).
- `npm run build` builds the SPA and the Worker.
- `npm run preview` previews the build locally.
- `npm run typecheck` type-checks app and Worker.
- `npm run deploy` deploys with the Wrangler.
