/snowflake-apps Add a session location map to the completed, map-free Smart Crowd Counter v1. Follow AGENTS.md and preserve existing features.

Extract GPS from photo EXIF server-side and store nullable lat/lng in CROWD_COUNTER_DB.CONFERENCES.SESSION_LOCATIONS, keyed by the exact staged-file relative path. Use Snowflake tables only, not Postgres. Left-join location metadata to analysis results without changing the Cortex AI calls.

Add a client-only react-leaflet map with pins per geotagged session; clicking a pin selects the matching table row. Non-GPS photos remain in the results and work normally, without a pin. Verify the changes, confirm deployment settings, and deploy to Snowflake.