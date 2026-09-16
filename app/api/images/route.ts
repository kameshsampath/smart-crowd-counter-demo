import { querySnowflakeLongRunning } from "@/lib/snowflake"

export const dynamic = "force-dynamic"

function toIso(val: unknown): string | null {
    if (!val) return null
    if (val instanceof Date) return val.toISOString()
    return String(val)
}

export async function GET() {
    try {
        const rows = await querySnowflakeLongRunning(
            "SELECT * FROM CROWD_COUNTER_DB.CONFERENCES.SMART_CROWD_COUNTER"
        )

        const images = rows.map((row) => ({
            relativePath: String(row.RELATIVE_PATH ?? ""),
            size: Number(row.SIZE ?? 0),
            lastModified: toIso(row.LAST_MODIFIED),
            fileUrl: String(row.FILE_URL ?? ""),
            totalAttendees: Number(row.TOTAL_ATTENDEES ?? 0),
            raisedHands: Number(row.RAISED_HANDS ?? 0),
            percentageWithHandsUp: Number(row.PERCENTAGE_WITH_HANDS_UP ?? 0),
            caption: String(row.CAPTION ?? ""),
        }))

        return Response.json(images)
    } catch (e) {
        console.error(new Date().toISOString(), "[images]", e)
        return Response.json(
            { error: e instanceof Error ? e.message : "Failed to fetch images" },
            { status: 500 }
        )
    }
}
