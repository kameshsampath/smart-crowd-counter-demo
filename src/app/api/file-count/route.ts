import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/snowflake";
import { config } from "@/lib/config";

export async function GET() {
    try {
        const rows = await executeQuery<{ COUNT: number }>(
            `SELECT COUNT(*) AS COUNT FROM DIRECTORY('@${config.database}.${config.schema}.${config.stage}')`
        );

        return NextResponse.json({ count: rows[0]?.COUNT ?? 0 });
    } catch (error) {
        console.error("File count error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
