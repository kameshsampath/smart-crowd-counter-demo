<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Smart Crowd Counter App Rules

1. **Data layer lives in CROWD_COUNTER_DB.CONFERENCES** — set SNOWFLAKE_DATABASE and SNOWFLAKE_SCHEMA as environment_variables in app.yml (data DB ≠ deploy DB).

2. **Proxy stage images via same-origin /api/stage-image.** Runtime App CSP is `default-src 'self'` — presigned URLs and any external resources must be proxied through same-origin API routes.

3. **File extensions are case-insensitive.** Cameras produce `.JPG`, `.JPEG`, `.PNG` etc. Always normalize to lowercase before comparing. The view SQL uses `LOWER(RELATIVE_PATH)`, the upload route uses `.toLowerCase()`, and the client-side filter should avoid regex in favor of explicit extension checks (Turbopack's SWC parser can fail on certain regex patterns in arrow functions).

4. **AI analysis is slow — always show progress.** `AI_COMPLETE` in the `SMART_CROWD_COUNTER` view takes 15-30s per image. The `/api/images` endpoint uses `querySnowflakeLongRunning`. The UI must show an analyzing banner with elapsed time and rotating tips while waiting for results. Never leave the user staring at a blank or stale screen.

# Turbopack/SWC Constraints

- **Do not use union types directly in arrow function parameters** inside `useCallback`. Turbopack's SWC parser can fail with "Parsing ecmascript source code failed". Use a named `type` alias instead: `type FileInput = FileList | File[]` then `async (files: FileInput) => {...}`.
- **Do not use bare `catch {}`** (catch without binding). Always use `catch (_e)`.

# Tile Proxy Constraints

When proxying map tiles (or any external resource) through a same-origin API route:

1. **Always set a `User-Agent` header** on upstream `fetch()` calls. OpenStreetMap and other tile providers reject requests with default/missing user agents (HTTP 403). Include the app name and a contact email. See [OSM Blocked Tiles](https://wiki.openstreetmap.org/wiki/Blocked_tiles) for the full policy.

2. **Never cache error responses.** Only set `cache-control: public, max-age=...` on successful (2xx) responses. Return `cache-control: no-store` on errors. Browsers cache by the proxy request URL, not the upstream URL — a cached 403 persists even after fixing the proxy or switching providers.

3. **Spread load across subdomains.** OSM provides `a/b/c.tile.openstreetmap.org`. Randomize across them to comply with their usage policy.
