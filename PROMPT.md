/snowflake-apps Build a "Smart Crowd Counter" — an AI-powered conference photo analysis app using Snowflake Cortex AI. Deploy when done.

Users upload conference session photos (JPG/PNG) via drag-and-drop. Cortex AI analyzes each image to count attendees, detect raised hands, calculate engagement percentage, and generate a caption. Results display in an interactive dashboard.

Data layer (CROWD_COUNTER_DB.CONFERENCES): Stage SNAPS with directory table. View SMART_CROWD_COUNTER reads DIRECTORY('@SNAPS'), filters image extensions, calls AI_COMPLETE(claude-4-sonnet) with TO_FILE() — once for JSON {total_attendees, raised_hands, percentage_with_hands_up} via TRY_PARSE_JSON, once for a caption.

API: POST /api/upload (multipart → PUT to stage), GET /api/images (SELECT from view), GET /api/file-count (COUNT from DIRECTORY), GET /api/stage-image?path= (proxy presigned URL), POST /api/reset (clear stage).

UI (single polished page): Summary stats. Interactive table with row selection. Detail panel: image + caption on left, metrics + donut chart (raised hands vs others) on right.
