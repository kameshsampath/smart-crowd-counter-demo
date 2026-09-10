<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# SAR Tile Proxy Constraints

When proxying map tiles (or any external resource) through a same-origin API route in a SAR app:

1. **Always set a `User-Agent` header** on upstream `fetch()` calls. OpenStreetMap and other tile providers reject requests with default/missing user agents (HTTP 403). Include the app name and a contact email. See [OSM Blocked Tiles](https://wiki.openstreetmap.org/wiki/Blocked_tiles) for the full policy.

2. **Never cache error responses.** Only set `cache-control: public, max-age=...` on successful (2xx) responses. Return `cache-control: no-store` on errors. Browsers cache by the proxy request URL, not the upstream URL — a cached 403 persists even after fixing the proxy or switching providers.

3. **Spread load across subdomains.** OSM provides `a/b/c.tile.openstreetmap.org`. Randomize across them to comply with their usage policy.

4. **SAR's CSP is `default-src 'self'`.** All external resources (tiles, images, fonts) must be proxied through same-origin API routes. The proxy route handles the server-side `fetch()`; the EAI + network rule handles SPCS egress. Both are required.
