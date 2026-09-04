import snowflake from "snowflake-sdk";
import * as fs from "fs";
import * as path from "path";
import * as toml from "toml";
import { config } from "./config";

interface ConnectionConfig {
    account: string;
    user: string;
    authenticator?: string;
    private_key_file?: string;
    token_file_path?: string;
    password?: string;
    role?: string;
    database?: string;
    warehouse?: string;
}

function readConnectionsToml(): Record<string, ConnectionConfig> {
    const tomlPath = path.join(
        process.env.HOME || "~",
        ".snowflake",
        "connections.toml"
    );
    const content = fs.readFileSync(tomlPath, "utf-8");
    return toml.parse(content) as Record<string, ConnectionConfig>;
}

function buildConnectionOptions(
    conn: ConnectionConfig
): snowflake.ConnectionOptions {
    const opts: snowflake.ConnectionOptions = {
        account: conn.account,
        username: conn.user,
        database: config.database,
        schema: config.schema,
    };

    if (conn.role) opts.role = conn.role;
    if (conn.warehouse) opts.warehouse = conn.warehouse;

    const auth = (conn.authenticator || "").toUpperCase();

    if (auth === "SNOWFLAKE_JWT") {
        opts.authenticator = "SNOWFLAKE_JWT";
        if (conn.private_key_file) {
            const keyPath = conn.private_key_file.replace("~", process.env.HOME || "");
            const privateKey = fs.readFileSync(keyPath, "utf-8");
            opts.privateKey = privateKey;
        }
    } else if (auth === "EXTERNALBROWSER") {
        opts.authenticator = "EXTERNALBROWSER";
    } else if (conn.password) {
        opts.password = conn.password;
    }

    return opts;
}

let cachedConnection: snowflake.Connection | null = null;

export function getConnection(): Promise<snowflake.Connection> {
    if (cachedConnection?.isUp()) {
        return Promise.resolve(cachedConnection);
    }

    return new Promise((resolve, reject) => {
        const connections = readConnectionsToml();
        const connConfig = connections[config.connectionName] as
            | ConnectionConfig
            | undefined;
        if (!connConfig) {
            reject(
                new Error(
                    `Connection "${config.connectionName}" not found in connections.toml`
                )
            );
            return;
        }

        const opts = buildConnectionOptions(connConfig);
        const conn = snowflake.createConnection(opts);

        conn.connect((err) => {
            if (err) {
                reject(err);
            } else {
                cachedConnection = conn;
                resolve(conn);
            }
        });
    });
}

export function executeQuery<T = Record<string, unknown>>(
    sql: string,
    binds?: snowflake.Binds
): Promise<T[]> {
    return new Promise(async (resolve, reject) => {
        try {
            const conn = await getConnection();
            conn.execute({
                sqlText: sql,
                binds,
                complete: (err, _stmt, rows) => {
                    if (err) reject(err);
                    else resolve((rows || []) as T[]);
                },
            });
        } catch (err) {
            reject(err);
        }
    });
}
