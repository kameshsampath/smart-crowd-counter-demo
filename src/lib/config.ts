export const config = {
    connectionName: process.env.SNOWFLAKE_DEFAULT_CONNECTION_NAME || "default",
    database: process.env.SNOWFLAKE_DATABASE || "CROWD_COUNTER_DB",
    schema: process.env.SNOWFLAKE_SCHEMA || "CONFERENCES",
    stage: process.env.SNOWFLAKE_STAGE || "SNAPS",
    aiModel: process.env.AI_MODEL || "claude-4-sonnet",
};
