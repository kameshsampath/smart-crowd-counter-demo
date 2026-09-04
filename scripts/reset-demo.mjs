#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { parse } from "toml";
import snowflake from "snowflake-sdk";

const DB = process.env.SNOWFLAKE_DATABASE || "CROWD_COUNTER_DB";
const SCHEMA = process.env.SNOWFLAKE_SCHEMA || "CONFERENCES";
const STAGE = process.env.SNOWFLAKE_STAGE || "SNAPS";
const CONN_NAME = process.env.SNOWFLAKE_DEFAULT_CONNECTION_NAME || "devrel-ent";

function loadConnection() {
    const tomlPath = path.join(process.env.HOME || "~", ".snowflake", "connections.toml");
    const parsed = parse(fs.readFileSync(tomlPath, "utf-8"));
    const conn = parsed[CONN_NAME];
    if (!conn) {
        console.error(`Connection "${CONN_NAME}" not found in connections.toml`);
        process.exit(1);
    }

    const opts = { account: conn.account, username: conn.user };
    const auth = (conn.authenticator || "").toUpperCase();

    if (auth === "SNOWFLAKE_JWT" && conn.private_key_file) {
        opts.authenticator = "SNOWFLAKE_JWT";
        opts.privateKey = fs.readFileSync(conn.private_key_file, "utf-8");
    } else if (auth === "EXTERNALBROWSER") {
        opts.authenticator = "EXTERNALBROWSER";
    } else if (conn.password) {
        opts.password = conn.password;
    }

    return opts;
}

function run(conn, sql) {
    return new Promise((resolve, reject) => {
        conn.execute({
            sqlText: sql,
            complete: (err, _stmt, rows) => (err ? reject(err) : resolve(rows)),
        });
    });
}

async function main() {
    console.log(`Connecting as ${CONN_NAME}...`);
    const opts = loadConnection();
    const conn = snowflake.createConnection(opts);

    await new Promise((resolve, reject) =>
        conn.connect((err) => (err ? reject(err) : resolve()))
    );

    const fqStage = `${DB}.${SCHEMA}.${STAGE}`;
    console.log(`Clearing stage @${fqStage}...`);
    await run(conn, `REMOVE @${fqStage}`);
    await run(conn, `ALTER STAGE ${fqStage} REFRESH`);
    console.log("Done — stage is empty.");

    conn.destroy(() => { });
}

main().catch((err) => {
    console.error("Reset failed:", err.message);
    process.exit(1);
});
