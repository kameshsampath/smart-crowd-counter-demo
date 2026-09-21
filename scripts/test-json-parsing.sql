WITH examples(label, raw_response, expected_count) AS (
  SELECT * FROM VALUES
    ('bare', '{"total_attendees":12}', 12),
    ('json fence', '```json\n{"total_attendees":12}\n```', 12),
    ('plain fence', '```\n{"total_attendees":12}\n```', 12),
    ('uppercase CRLF', ' \r\n```JSON\r\n{"total_attendees":12}\r\n``` \r\n', 12),
    ('malformed', '```json\n{"total_attendees":}\n```', NULL),
    ('extra prose', 'Here is JSON:\n```json\n{"total_attendees":12}\n```', NULL),
    ('explicit null', '```json\n{"total_attendees":null}\n```', NULL)
), parsed AS (
  SELECT *, COALESCE(
    TRY_PARSE_JSON(raw_response),
    TRY_PARSE_JSON(REGEXP_SUBSTR(raw_response,
      $$^[[:space:]]*```(json)?[[:blank:]]*[\r\n]+(.*)[\r\n]+[[:blank:]]*```[[:space:]]*$$,
      1, 1, 'ise', 2))
  ) AS analysis
  FROM examples
)
SELECT label, analysis,
  EQUAL_NULL(TRY_TO_NUMBER(analysis:total_attendees::STRING), expected_count) AS passed
FROM parsed;
