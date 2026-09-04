import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/snowflake";
import { config } from "@/lib/config";

export async function POST() {
    try {
        const fqStage = `${config.database}.${config.schema}.${config.stage}`;

        await executeQuery(`REMOVE @${fqStage}`);
        await executeQuery(`ALTER STAGE ${fqStage} REFRESH`);

        return NextResponse.json({ status: "ok", message: "Stage cleared" });
    } catch (error) {
        console.error("Reset error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
