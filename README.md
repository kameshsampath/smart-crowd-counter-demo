# Smart Crowd Counter

AI-powered conference photo analysis app built on Snowflake App Runtime. Upload session photos and get real-time attendee counts, raised-hand detection, engagement metrics, and AI-generated captions — all powered by Snowflake Cortex AI (Claude 4 Sonnet).

> [!NOTE]
> This app was generated from [`PROMPT.md`](PROMPT.md) using the `snowflake-apps` skill in [Cortex Code](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code).

## How it works

1. **Upload** conference session photos (JPG/PNG) via drag-and-drop or file picker
2. **Cortex AI** analyzes each image using `AI_COMPLETE` with `TO_FILE()` to count attendees, detect raised hands, calculate engagement percentage, and generate a caption
3. **Dashboard** displays summary stats, an interactive table, and a detail panel with the image, caption, metrics, and a donut chart

## Data layer

All data lives in `CROWD_COUNTER_DB.CONFERENCES`:

- **Stage** `SNAPS` — internal stage with directory table for uploaded photos
- **View** `SMART_CROWD_COUNTER` — reads `DIRECTORY('@SNAPS')`, filters image extensions, calls `AI_COMPLETE(claude-4-sonnet)` twice per image (once for JSON metrics via `TRY_PARSE_JSON`, once for a caption)

> [!IMPORTANT]
> Run `scripts/setup-infra.sql` to create the database, schema, stage, and view before running or deploying the app.

## API routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/upload` | POST | Multipart upload → PUT to stage |
| `/api/images` | GET | SELECT from `SMART_CROWD_COUNTER` view (long-running) |
| `/api/file-count` | GET | COUNT from `DIRECTORY('@SNAPS')` |
| `/api/stage-image?path=` | GET | Proxy stage image via `GET` command (decrypts) |
| `/api/reset` | POST | `REMOVE` stage + `ALTER STAGE REFRESH` |

## Local development

```bash
npm install
npm run dev
```

> [!TIP]
> Requires a configured Snowflake CLI connection (`~/.snowflake/config.toml`). Use `SNOWFLAKE_CONNECTION_NAME=myconn npm run dev` to select a specific connection.

## Deploy

```bash
snow app deploy
```

Deploys to Snowflake App Runtime as `SMART_CROWD_COUNTER` in `SNOWFLAKE_APPS.PUBLIC`.
