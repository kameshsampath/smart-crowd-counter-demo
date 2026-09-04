import { NextResponse } from "next/server";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { executeQuery } from "@/lib/snowflake";
import { config } from "@/lib/config";

export async function GET() {
    try {
        await ensureBootstrapped();

        const rows = await executeQuery(
            `SELECT * FROM ${config.database}.${config.schema}.SMART_CROWD_COUNTER`
        );

        return NextResponse.json(rows);
    } catch (error) {
        console.error("Error fetching images:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
