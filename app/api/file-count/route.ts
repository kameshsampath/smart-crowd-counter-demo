import { querySnowflake } from "@/lib/snowflake"

export const dynamic = "force-dynamic"

export async function GET() {
    try {
        const rows = await querySnowflake(`
      SELECT COUNT(*) AS cnt
      FROM DIRECTORY('@CROWD_COUNTER_DB.CONFERENCES.SNAPS')
      WHERE LOWER(RELATIVE_PATH) LIKE '%.jpg'
         OR LOWER(RELATIVE_PATH) LIKE '%.jpeg'
         OR LOWER(RELATIVE_PATH) LIKE '%.png'
    `)
        return Response.json({ count: Number(rows[0]?.CNT ?? 0) })
    } catch (e) {
        console.error(new Date().toISOString(), "[file-count]", e)
        return Response.json(
            { error: e instanceof Error ? e.message : "Failed to get file count" },
            { status: 500 }
        )
    }
}
