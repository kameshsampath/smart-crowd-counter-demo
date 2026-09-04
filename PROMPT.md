Build a "Smart Crowd Counter" — an AI-powered conference attendee counting and engagement analytics Next.js app that uses Snowflake Cortex AI.

This is Phase 1: a standard brownfield Next.js application (no Snowflake App Runtime, no deployment manifests). It runs locally and connects to Snowflake via `~/.snowflake/connections.toml`.

## What it does

Users upload conference session photos (JPG/PNG). Snowflake Cortex AI analyzes each image to count total attendees and raised hands, calculates engagement percentage. Results show in a rich dashboard.

## Data layer

All objects in database CROWD_COUNTER_DB, schema CONFERENCES:

- **Stage** SNAPS: internal, SNOWFLAKE_SSE encryption, directory table enabled (AUTO_REFRESH=TRUE)
- **View** SMART_CROWD_COUNTER: reads from DIRECTORY('@CROWD_COUNTER_DB.CONFERENCES.SNAPS'), filters .jpg/.jpeg/.png, calls AI_COMPLETE('claude-4-sonnet') with prompt asking for JSON {total_attendees, raised_hands, percentage_with_hands_up}. Uses TO_FILE() for file references. Also generates a brief caption via AI_COMPLETE. Parses with TRY_PARSE_JSON(). Auto-create all objects on first request if missing.

## Snowflake connection

Local-only helper in src/lib/snowflake.ts:

- Parse ~/.snowflake/connections.toml using SNOWFLAKE_DEFAULT_CONNECTION_NAME env var
- Support SNOWFLAKE_JWT and EXTERNALBROWSER authenticators

## API routes

1. GET /api/images — SELECT * FROM the view
2. POST /api/upload — multipart "files", validate types, PUT each to stage via temp file, then ALTER STAGE REFRESH
3. GET /api/file-count — COUNT(*) from DIRECTORY() for lightweight sync
4. GET /api/presigned-url?path= — GET_PRESIGNED_URL with 7-day expiry

## UI — make it visually polished, not basic

Use Next.js 16, React 19, TypeScript, Tailwind CSS v4, Recharts, SWR, snowflake-sdk.

### Design language

- Gradient header (indigo-600 to blue-500, white text) with app title and subtitle
- Card-based layout with subtle shadows, rounded-xl corners, and hover transitions
- Snowflake-blue accent color (#29B5E8) for interactive elements
- Tabular-nums for all numeric data
- Smooth animations: fade-in for cards, pulse for processing states

### Page layout (single page, max-w-7xl)

1. **Hero header**: gradient background, "Smart Crowd Counter" in bold white, subtitle about Cortex AI, subtle pattern or dots overlay

2. **FileUploader**: large drag-and-drop zone with an upload icon, dashed border that highlights on drag, upload progress with animated bar, success/error toasts

3. **Aggregate summary bar** (always visible when data exists): 4 stat cards in a row — Total Sessions Analyzed, Total Attendees Counted, Average Engagement Rate, Highest Engagement Session. Each card has an icon, large bold number, label below, and a subtle color-coded left border (blue, purple, green, amber)

4. **DataTable**: styled table with:
   - Sticky header row with gray-50 background
   - Columns: Image name, Attendees (right), Raised Hands (right), Conversion % (right, with colored badge: green >50%, amber 25-50%, red <25%)
   - Row hover effect with subtle background shift
   - Selected row with blue-50 background and left blue border
   - Empty state with illustration placeholder text

5. **Detail panel** (on row select, 2-col responsive grid):
   - Left: **ImageViewer** — image via presigned URL, caption in italic, collapsible file metadata
   - Right: **MetricsCards** (3 cards with icons and color-coded values: blue/Attendees, orange/Raised Hands, green/Conversion) + **DonutChart** (Recharts PieChart, innerRadius 70, outerRadius 100, blue #2563eb + orange #f97316, with center label showing the conversion percentage)

6. **Footer**: "Built with Next.js + Snowflake Cortex AI" with a subtle top border

### Polling

- SWR fetches /api/images; during upload, poll every 5s until row count matches expected
- SWR fetches /api/file-count every 10s; if counts diverge, revalidate main data

## Config

Env vars with defaults: SNOWFLAKE_DEFAULT_CONNECTION_NAME=default, SNOWFLAKE_DATABASE=CROWD_COUNTER_DB, SNOWFLAKE_SCHEMA=CONFERENCES, SNOWFLAKE_STAGE=SNAPS, AI_MODEL=claude-4-sonnet

## Important constraints

- next.config.ts: serverExternalPackages: ["snowflake-sdk"]
- Do NOT add sharp, exif-parser, or any image metadata/EXIF extraction — keep data simple (AI count only)
- Do NOT add maps or geolocation features
- Do NOT add any SAR/Snowflake App Runtime scaffolding (no app.yml, no snowflake.yml) — that comes in Phase 2
