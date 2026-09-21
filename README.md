# Smart Crowd Counter

A prompt-first demo for building an AI-powered conference photo app with [Cortex Code](https://docs.snowflake.com/en/user-guide/cortex-code/cortex-code), [Snowflake App Runtime](https://docs.snowflake.com/en/developer-guide/snowflake-apps/about-snowflake-apps), and [Cortex AI](https://docs.snowflake.com/en/guides-overview-ai-features).

The `get-started` branch contains prompts, agent instructions, and infrastructure scripts. `smart-crowd-counter/` is a git submodule tracking a prebuilt reference app for a quick check; regenerate your own app there via the prompt sequence, or reuse the pinned submodule as-is. Start with v1, then optionally choose one v2 extension.

## Prerequisites

- Cortex Code Desktop with access to your target Snowflake account.
- Snowflake CLI (`snow`) configured with a named connection and access to App Runtime and Cortex AI.
- Node.js and npm for the generated app. The optional [mise](https://mise.jdx.dev/) configuration selects Node.js 24.
- Only for the Postgres v2 option: access to an existing Snowflake Postgres instance or permission and budget to create one. No Postgres setup or checks are needed for v1 or the Snowflake-tables option.

**UI recommendation:** Select **OpenAI GPT 6 Astra** (`openai-gpt-6-astra`) in Cortex Code for a stunning, polished UI. This is the coding model used to generate the app; photo analysis still uses the `claude-4-sonnet` Cortex model specified in the prompts.

## Quick Check (Prebuilt App)

`smart-crowd-counter/` is a git submodule pointing at the [smart-crowd-counter](https://github.com/kameshsampath/smart-crowd-counter) repo (tracking its `main` branch). Use this path to deploy a working reference app without running the prompt sequence yourself:

```sh
git clone --recurse-submodules -b get-started https://github.com/kameshsampath/smart-crowd-counter-demo.git
cd smart-crowd-counter-demo/smart-crowd-counter
```

If you already cloned without `--recurse-submodules`, run `git submodule update --init` from the repo root first.

```sh
npm ci
snow app validate --connection YOUR_CONNECTION
snow app deploy --connection YOUR_CONNECTION
```

Review `app.yml` first: it ships with placeholder/example values (e.g. `PGHOST`) that must match your account's resources before deploying. To pull in the latest reference app later, run `mise run submodule-update` (or `git submodule update --remote --merge smart-crowd-counter`).

## Quick Start (Generate Your Own)

```sh
git clone -b get-started https://github.com/kameshsampath/smart-crowd-counter-demo.git
cd smart-crowd-counter-demo
```

Open this folder in Cortex Code Desktop. Replace `YOUR_CONNECTION` in the chat requests below with your configured Snowflake connection name. Ask Cortex Code to preserve the prompt repository and generate source in the ignored subfolder.

## Prompt Sequence

```text
PROMPT-v1.md
    -> PROMPT-v2-snowflake.md       (Snowflake location table)
    OR
    -> PROMPT-v2-postgres-map.md    (Postgres location table)
```

### Step 1: Build And Deploy V1

Use [PROMPT-v1.md](PROMPT-v1.md) in a Cortex Code chat:

```text
Use Snowflake connection YOUR_CONNECTION to build @PROMPT-v1.md.
Generate the app in smart-crowd-counter/, preserve the repository files,
and do not commit generated code. Verify and deploy when done.
```

V1 is deliberately map-free. It includes photo uploads, estimated attendee and raised-hand counts, captions, a photo-first dashboard, a hands-up donut, light/dark themes, visible progress, and an Under the hood drawer with SQL and result JSON. Verify the deployed v1 before extending it.

### Step 2: Choose One V2

Both options add a session map from photo EXIF GPS and link map pins to the selected photo. Photos without GPS remain usable. Choose one storage approach for the completed v1 app, not both prompts in sequence.

**Option A: Snowflake tables only**

Use [PROMPT-v2-snowflake.md](PROMPT-v2-snowflake.md):

```text
Use Snowflake connection YOUR_CONNECTION to extend smart-crowd-counter/
using @PROMPT-v2-snowflake.md. Keep location metadata in Snowflake tables,
not Postgres. Preserve v1 features, verify, and deploy.
```

GPS metadata lives in `CROWD_COUNTER_DB.CONFERENCES.SESSION_LOCATIONS` and is left-joined to analysis results. Photos remain in the Snowflake stage. No Postgres instance, credentials, dependencies, or connectivity checks are required.

**Option B: Postgres tables for GPS metadata**

Use [PROMPT-v2-postgres-map.md](PROMPT-v2-postgres-map.md):

```text
Use Snowflake connection YOUR_CONNECTION to extend smart-crowd-counter/
using @PROMPT-v2-postgres-map.md. Use Snowflake Postgres for GPS metadata
only. Ask whether to reuse or create an instance; obtain approval for
billable resources and networking. Preserve v1 features, verify, and deploy.
```

GPS metadata lives in Postgres `session_locations`, keyed by fully qualified stage and exact generated photo path. Photos and the Cortex view stay in Snowflake unchanged; the server merges location metadata without storing analysis results in Postgres. This option requires secure secrets, verified TLS, separate Postgres ingress and app egress, and verification from the deployed runtime. Follow the conditional Postgres rules in [AGENTS.md](AGENTS.md).

## Run And Verify The Generated App

These commands apply **after** Cortex Code has generated the Node.js app and its lockfile:

```sh
cd smart-crowd-counter
npm ci
SNOWFLAKE_CONNECTION_NAME=YOUR_CONNECTION SNOWFLAKE_DATABASE=CROWD_COUNTER_DB SNOWFLAKE_SCHEMA=CONFERENCES npm run dev
```

Use the actual URL printed by the dev server. For the Postgres variant, also follow the generated app's README for secure local credential and CA configuration. Never put passwords in chat or source files.

From the generated app directory, verify before deployment:

```sh
npm test
npm run build
snow app validate --connection YOUR_CONNECTION
snow app deploy --connection YOUR_CONNECTION
```

Review and confirm the generated deployment manifest's account, database, schema, warehouse, and integrations. Deployment storage can differ from the data database: preserve `SNOWFLAKE_DATABASE=CROWD_COUNTER_DB` and `SNOWFLAKE_SCHEMA=CONFERENCES`. Do not assume another demo's account-specific warehouse or service settings exist in your account.

## Data And Safety

- Photos live in `@CROWD_COUNTER_DB.CONFERENCES.SNAPS`, an internal stage with a directory table and `SNOWFLAKE_SSE` encryption.
- `CROWD_COUNTER_DB.CONFERENCES.SMART_CROWD_COUNTER` runs Cortex image analysis. Each photo uses separate estimate and caption calls, incurs costs, and can take tens of seconds.
- JPG, JPEG, and PNG extensions are case-insensitive. Validate the Claude image limits: 3.75 MB and 8000 pixels per dimension.
- Counts are AI estimates, not attendance records. Totals across photos are not unique attendees; hands-up percentage is not a general engagement score. Unavailable estimates must remain distinct from zero.
- This is a shared demo. App users see the same photo library, and confirmed reset affects all users. Restrict access and obtain approval before destructive smoke tests.

## Infrastructure And Cleanup

Let the build workflow inspect and provision what it needs. For manual v1 setup, first review `scripts/setup-infra.sql`: it creates missing database/schema/stage objects and replaces the analysis view. It does not convert the encryption of an existing stage.

```sh
snow sql --connection YOUR_CONNECTION -f scripts/setup-infra.sql
```

Root `mise` tasks use the CLI's selected/default connection. The existing `mise run dev` and `mise run build` tasks assume a root-level generated app; for the recommended subfolder layout, use the commands above instead. `mise run reset` is stage-only and is not a complete v2 metadata reset. Prefer the generated app's confirmed reset and recovery workflow.

Review `scripts/teardown-infra.sql` before running any teardown: it is destructive and does not substitute for removing deployed app services or Postgres resources. For the Postgres variant, follow the generated cleanup instructions separately. Suspending Postgres stops compute charges, but storage charges continue. Never drop a reused instance or another application's metadata.

## License

[Apache License 2.0](LICENSE)