# Smart Crowd Counter

An AI-powered conference photo analysis app built on [Snowflake App Runtime](https://docs.snowflake.com/en/developer-guide/snowflake-apps/about-snowflake-apps) using [Cortex AI](https://docs.snowflake.com/en/guides-overview-ai-features). Upload conference session photos and get instant crowd analytics — attendee counts, raised-hand detection, engagement percentages, and AI-generated captions.

Built with [Cortex Code](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code) from a single prompt.

## How it works

1. Upload conference session photos (JPG/PNG) via drag-and-drop
2. Cortex AI (`claude-4-sonnet`) analyzes each image to count attendees, detect raised hands, and generate a caption
3. Results display in an interactive dashboard with summary stats, a sortable table, and a detail panel with a donut chart

## Prerequisites

- [Snowflake CLI](https://docs.snowflake.com/en/developer-guide/snowflake-cli/index) (`snow`) configured with a connection
- [mise](https://mise.jdx.dev/) task runner
- [Cortex Code](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code) desktop IDE

## Quick start

```bash
# 1. Clone the get-started branch (prompt + infra scripts only)
git clone -b get-started https://github.com/kameshsampath/smart-crowd-counter-demo.git
cd smart-crowd-counter-demo

# 2. Create Snowflake infrastructure (database, schema, stage, view)
mise run setup
```

## Build App

Open Snowflake Coco Desktop Chat session and say:

```text
build @PROMPT.md
```

## Snowflake objects

| Object | Description |
|--------|-------------|
| `CROWD_COUNTER_DB` | Database |
| `CROWD_COUNTER_DB.CONFERENCES` | Schema |
| `@CROWD_COUNTER_DB.CONFERENCES.SNAPS` | Internal stage with directory table |
| `CROWD_COUNTER_DB.CONFERENCES.SMART_CROWD_COUNTER` | View — runs AI_COMPLETE on staged images |

## Clean up

```bash
# 3. Teardown when done
mise run teardown
```
## License

[Apache License 2.0](LICENSE)
