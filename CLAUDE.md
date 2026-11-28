# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server; Worker runs in workerd via `@cloudflare/vite-plugin`.
- `npm run build` — builds SPA (`dist/client`) and Worker.
- `npm run typecheck` — regenerates `worker-configuration.d.ts` (`wrangler types`), then type-checks app (`tsconfig.app.json`) and Worker (`tsconfig.worker.json`) separately.
- `npm run deploy` — build + `wrangler deploy`.

No test runner or linter is configured. Use `npm run typecheck` to verify changes.

## Architecture

Two-part deploy in one Worker (`wrangler.jsonc`):

- **SPA** (`src/`): React 19 + Vite, served as static assets with `not_found_handling: single-page-application`.
- **Worker** (`worker/index.ts`): only runs for `/api/*` (`run_worker_first`). Forwards every `/api/*` request unchanged to the `notes-api` Worker via the `API` service binding. No business logic lives here.

Backend lives in sibling repo `../notes-api` (separate Worker). API contract changes (note shape, attachment endpoints, pagination) must match it. For `npm run dev` to hit the API, `notes-api` must be resolvable as a service binding (run it locally alongside, or bindings fail).

### Frontend flow

- **Auth**: `src/auth.ts` uses `better-auth` React client with `baseURL: window.location.origin`, so `/api/auth/*` goes through the same proxy. `App.tsx` gates on `useSession()`; `NotesPage` is keyed by `user.id` so state resets on account switch.
- **401 handling**: `api.ts` exposes `onUnauthorized`; `auth.ts` registers a handler that notifies better-auth's `$sessionSignal`, which refetches session and drops user to `AuthForm`. Keep this decoupling (api.ts must not import auth.ts — that would be circular).
- **API client** (`src/api.ts`): all note calls go through `call()` against `/api/notes`. Notes list uses cursor pagination (`{ data, nextCursor }`); `useNotes` hook owns list state with local optimistic `add/update/remove`.
- **Attachments**: 3-step direct upload — `POST /:noteId/attachments/presign` → XHR `PUT` file to returned presigned `uploadUrl` (R2/storage, for progress events) → `POST /:noteId/attachments` to confirm. `uploadAttachments` runs a 3-worker concurrency pool. Client-side limits (`MAX_FILE_BYTES`, `MAX_FILES_PER_NOTE`, blocked svg/html/js types) in `checkFile`/`partitionFiles` — server should enforce too.
- **PDF viewer**: `pdfjs-dist` with worker loaded via Vite `?url` import in `hooks/usePdfDocument.ts`.

### Styling

Tailwind v4 via PostCSS. Design tokens (`paper`, `ink`, `accent`, `shadow-card`, `shadow-lift`) defined in `@theme` in `src/index.css`. Shared class-string constants (buttons, icon buttons, masonry layout) in `src/ui.ts` — reuse these instead of duplicating class lists.

## Conventions

- Tabs for indentation in TS/TSX.
- Code comments were deliberately stripped (commit `8ab607a`); don't add explanatory comments unless asked.
- Repo has Wrangler config → use `wrangler`, not `cf` CLI.
- `.next/` and `next-env.d.ts` are leftovers from the old Next/vinext setup; app is now plain Vite.
