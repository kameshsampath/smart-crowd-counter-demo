import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/snowflake";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
    try {
        const filePath = request.nextUrl.searchParams.get("path");

        if (!filePath) {
            return NextResponse.json(
                { error: "Missing 'path' query parameter" },
                { status: 400 }
            );
        }

        const sanitized = filePath.replace(/'/g, "''");

        const rows = await executeQuery<{ URL: string }>(
            `SELECT GET_PRESIGNED_URL(@${config.database}.${config.schema}.${config.stage}, '${sanitized}', 604800) AS URL`
        );

        return NextResponse.json({ url: rows[0]?.URL ?? null });
    } catch (error) {
        console.error("Presigned URL error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
