import { querySnowflake } from "@/lib/snowflake"

export const dynamic = "force-dynamic"

export async function POST() {
    try {
        await querySnowflake("REMOVE @CROWD_COUNTER_DB.CONFERENCES.SNAPS")
        await querySnowflake("ALTER STAGE CROWD_COUNTER_DB.CONFERENCES.SNAPS REFRESH")
        return Response.json({ success: true })
    } catch (e) {
        console.error(new Date().toISOString(), "[reset]", e)
        return Response.json(
            { error: e instanceof Error ? e.message : "Failed to reset" },
            { status: 500 }
        )
    }
}
