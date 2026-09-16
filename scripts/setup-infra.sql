-- Smart Crowd Counter: idempotent Snowflake infrastructure setup
-- Run with: mise run setup

CREATE DATABASE IF NOT EXISTS CROWD_COUNTER_DB;
CREATE SCHEMA IF NOT EXISTS CROWD_COUNTER_DB.CONFERENCES;

CREATE STAGE IF NOT EXISTS CROWD_COUNTER_DB.CONFERENCES.SNAPS
  DIRECTORY = (ENABLE = TRUE);

CREATE OR REPLACE VIEW CROWD_COUNTER_DB.CONFERENCES.SMART_CROWD_COUNTER AS
WITH staged_files AS (
  SELECT
    RELATIVE_PATH,
    SIZE,
    LAST_MODIFIED,
    FILE_URL
  FROM DIRECTORY('@CROWD_COUNTER_DB.CONFERENCES.SNAPS')
  WHERE LOWER(RELATIVE_PATH) LIKE '%.jpg'
     OR LOWER(RELATIVE_PATH) LIKE '%.jpeg'
     OR LOWER(RELATIVE_PATH) LIKE '%.png'
),
ai_analysis AS (
  SELECT
    sf.RELATIVE_PATH,
    sf.SIZE,
    sf.LAST_MODIFIED,
    sf.FILE_URL,
    TRY_PARSE_JSON(
      AI_COMPLETE(
        'claude-4-sonnet',
        'Analyze this conference session photo. Count the total number of attendees visible and the number of people with raised hands. Return ONLY a JSON object with these exact keys: {"total_attendees": <number>, "raised_hands": <number>, "percentage_with_hands_up": <number>}. The percentage should be raised_hands/total_attendees * 100, rounded to 1 decimal. If you cannot determine counts, use 0.',
        TO_FILE('@CROWD_COUNTER_DB.CONFERENCES.SNAPS', sf.RELATIVE_PATH)
      )
    ) AS analysis,
    AI_COMPLETE(
      'claude-4-sonnet',
      'Describe this conference session photo in one brief sentence (under 20 words). Focus on the setting, crowd size, and activity.',
      TO_FILE('@CROWD_COUNTER_DB.CONFERENCES.SNAPS', sf.RELATIVE_PATH)
    ) AS caption
  FROM staged_files sf
)
SELECT
  RELATIVE_PATH,
  SIZE,
  LAST_MODIFIED,
  FILE_URL,
  analysis:total_attendees::INT AS total_attendees,
  analysis:raised_hands::INT AS raised_hands,
  analysis:percentage_with_hands_up::FLOAT AS percentage_with_hands_up,
  caption
FROM ai_analysis;
