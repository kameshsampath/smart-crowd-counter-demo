<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Smart Crowd Counter App Rules

1. **Data layer lives in CROWD_COUNTER_DB.CONFERENCES** — set SNOWFLAKE_DATABASE and SNOWFLAKE_SCHEMA as environment_variables in app.yml (data DB ≠ deploy DB).

2. **Proxy stage images via `GET`, not `GET_PRESIGNED_URL`.** Files on internal stages are encrypted at rest by Snowflake. `GET_PRESIGNED_URL` returns a raw S3 URL that serves the encrypted bytes — not a usable image. Use the SQL `GET '@STAGE/file' 'file:///tmp/dir'` command instead, which downloads and decrypts the file through Snowflake. The `/api/stage-image` route GETs to a temp directory, reads the decrypted file, and serves it as a same-origin response (required by App Runtime CSP `default-src 'self'`).

3. **File extensions are case-insensitive.** Cameras produce `.JPG`, `.JPEG`, `.PNG` etc. Always normalize to lowercase before comparing. The view SQL uses `LOWER(RELATIVE_PATH)`, the upload route uses `.toLowerCase()`, and the client-side filter should avoid regex in favor of explicit extension checks (Turbopack's SWC parser can fail on certain regex patterns in arrow functions).

4. **Every slow operation needs visible progress.** Never leave the user staring at a blank or stale screen. Specifically:
   - **Upload**: Show an "Uploading N photos…" banner while files transfer to the stage.
   - **AI analysis**: `AI_COMPLETE` takes 15-30s per image. Show an analyzing banner with elapsed time and rotating tips. Use `querySnowflakeLongRunning` for the `/api/images` endpoint. Bridge upload→analyze seamlessly (use `refetchQueries` not `invalidateQueries` so the `await` holds until results arrive).
   - **Reset/Clear**: Show a "Clearing…" banner while `REMOVE` and `ALTER STAGE REFRESH` run.
   - **General pattern**: Track distinct `isUploading`/`isAnalyzing`/`isResetting` states so the UI always reflects what's happening. Use `await refetchQueries()` (not `invalidateQueries`) after mutations so state transitions are seamless.

# Turbopack/SWC Constraints

**SDK file-transfer exception:** Execute `PUT` and `GET` using `querySnowflake`, which waits for the SDK completion callback. Do not use `querySnowflakeLongRunning` (`asyncExec: true`) for file transfers: transfer metadata can be missing and async result retrieval fails. Keep upload/download progress visible while awaiting the callback. AI analysis still uses the long-running helper.

- **Do not use union types directly in arrow function parameters** inside `useCallback`. Turbopack's SWC parser can fail with "Parsing ecmascript source code failed". Use a named `type` alias instead: `type FileInput = FileList | File[]` then `async (files: FileInput) => {...}`.
- **Do not use bare `catch {}`** (catch without binding). Always use `catch (_e)`.

# Tile Proxy Constraints

When proxying map tiles (or any external resource) through a same-origin API route:

1. **Always set a `User-Agent` header** on upstream `fetch()` calls. OpenStreetMap and other tile providers reject requests with default/missing user agents (HTTP 403). Include the app name and a contact email. See [OSM Blocked Tiles](https://wiki.openstreetmap.org/wiki/Blocked_tiles) for the full policy.

2. **Never cache error responses.** Only set `cache-control: public, max-age=...` on successful (2xx) responses. Return `cache-control: no-store` on errors. Browsers cache by the proxy request URL, not the upstream URL — a cached 403 persists even after fixing the proxy or switching providers.

3. **Follow the provider's current tile policy.** For OpenStreetMap standard raster tiles, use `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, not randomized `a/b/c` subdomains. Show visible attribution, send a stable identifying User-Agent and valid app-origin Referer without sensitive query parameters, and honor upstream cache headers and conditional requests. Do not prefetch or bulk-download tiles. See the [OSM Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/).

# Postgres Deployment Rules (Only When Using Postgres)

**Apply this section only when the selected application iteration explicitly uses Postgres.** For v1 or a Snowflake-only iteration, skip Postgres discovery, provisioning, connection checks, dependencies, secrets, network rules, and migrations. Do not add Postgres merely to satisfy these rules.

1. **Use `psql` for Postgres administration and verification.** Use named profiles in `~/.pg_service.conf` and passwords in `~/.pgpass`: `psql "service=<name> connect_timeout=10" -X -v ON_ERROR_STOP=1`. Reserve credential-safe helpers for instance provisioning and secret handling. Verify the actual saved profile name rather than assuming it matches the instance identifier. Runtime application queries still use the server-side Postgres driver.

2. **Preserve certificate verification.** Saved service profiles must retain `sslrootcert` and a certificate-verifying SSL mode. Mount runtime credentials and the CA certificate through Snowflake secrets; never expose passwords in chat, browser responses, source files, or command arguments. Use server-only pooling, parameterized queries, and connection/query timeouts. Do not disable TLS verification to work around DNS or network failures.

3. **Configure ingress and egress separately.** App EAIs permit outbound connections; Snowflake Postgres requires its own instance-attached ingress policy. Keep Postgres and tile EAIs separate, allow only approved hosts/ports and source ranges, and never use `0.0.0.0/0` as a shortcut. Confirm billable provisioning, role changes, and network changes before applying them; do not alter the account-wide network policy for this app.

4. **Discover current network ranges.** Retrieve Snowflake egress ranges and their expiration dates rather than copying addresses from a previous deployment. Regional ranges are shared infrastructure, not exclusive to this app. Review and refresh approved ingress rules before expiration. Keep deployment-specific hosts, IPs, instance names, and certificate paths in deployment documentation, not reusable rules.

5. **Keep GPS metadata independent of analysis.** In the Postgres-map iteration, store GPS metadata keyed by fully qualified stage plus exact generated PUT relative path, never original filename. Provision the table outside request handling with least-privilege runtime access. Metadata-write failures must not undo successful photo uploads; lookup failures must retain all analysis rows with a distinct location warning. Map interactions and location-only refreshes must not rerun Cortex. Do not add analysis-result storage, replication, or automatic backfill.

6. **Make cross-store cleanup retry-safe.** Scope metadata deletion to this application/stage and retry the original reset snapshot, not newer uploads. Report stage and metadata failures separately. A process-level mutation lock is valid only for a single replica; add distributed coordination before scaling. Document retry-token lifetime, secret-rotation effects, and external stage mutation limitations.

7. **Verify from the deployed runtime.** Local `psql` success does not prove that app secret mounts, TLS, Postgres ingress, or EAI egress work. Verify runtime connectivity and graceful metadata-outage handling after deployment. Report skipped live upload, pin-selection, and reset checks explicitly; never clear shared photos just to complete a smoke test without approval.
