import { executeQuery } from "./snowflake";
import { config } from "./config";

let bootstrapped = false;

export async function ensureBootstrapped(): Promise<void> {
    if (bootstrapped) return;

    const { database, schema, stage, aiModel } = config;
    const fqStage = `${database}.${schema}.${stage}`;

    await executeQuery(`CREATE DATABASE IF NOT EXISTS ${database}`);
    await executeQuery(`CREATE SCHEMA IF NOT EXISTS ${database}.${schema}`);
    await executeQuery(
        `CREATE STAGE IF NOT EXISTS ${fqStage}
     ENCRYPTION = (TYPE = 'SNOWFLAKE_SSE')
     DIRECTORY = (ENABLE = TRUE AUTO_REFRESH = TRUE)`
    );

    const viewSQL = `
CREATE OR REPLACE VIEW ${database}.${schema}.SMART_CROWD_COUNTER AS
WITH staged_files AS (
  SELECT
    RELATIVE_PATH,
    SIZE,
    LAST_MODIFIED,
    FILE_URL
  FROM DIRECTORY('@${fqStage}')
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
        '${aiModel}',
        'Analyze this conference session photo. Count the total number of attendees visible and the number of people with raised hands. Return ONLY a JSON object with these exact keys: {"total_attendees": <number>, "raised_hands": <number>, "percentage_with_hands_up": <number>}. The percentage should be raised_hands/total_attendees * 100, rounded to 1 decimal. If you cannot determine counts, use 0.',
        TO_FILE('@${fqStage}', sf.RELATIVE_PATH)
      )
    ) AS analysis,
    AI_COMPLETE(
      '${aiModel}',
      'Describe this conference session photo in one brief sentence (under 20 words). Focus on the setting, crowd size, and activity.',
      TO_FILE('@${fqStage}', sf.RELATIVE_PATH)
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
FROM ai_analysis`;

    await executeQuery(viewSQL);

    bootstrapped = true;
}
