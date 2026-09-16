import { querySnowflake } from "@/lib/snowflake"
import fs from "fs"
import path from "path"
import os from "os"

export const dynamic = "force-dynamic"

const STAGE = "@CROWD_COUNTER_DB.CONFERENCES.SNAPS"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const filePath = url.searchParams.get("path")

    if (!filePath) {
        return Response.json({ error: "Missing path parameter" }, { status: 400 })
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "crowd-img-"))

    try {
        await querySnowflake(
            `GET '${STAGE}/${filePath}' 'file://${tmpDir}'`
        )

        const fileName = path.basename(filePath)
        const localPath = path.join(tmpDir, fileName)

        if (!fs.existsSync(localPath)) {
            return Response.json({ error: "File not found after GET" }, { status: 404 })
        }

        const buffer = fs.readFileSync(localPath)
        const ext = fileName.toLowerCase().split(".").pop()
        const contentType =
            ext === "png" ? "image/png" :
                ext === "jpg" || ext === "jpeg" ? "image/jpeg" :
                    "application/octet-stream"

        return new Response(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=3600",
            },
        })
    } catch (e) {
        console.error(new Date().toISOString(), "[stage-image]", e)
        return Response.json(
            { error: e instanceof Error ? e.message : "Failed to fetch image" },
            { status: 500 }
        )
    } finally {
        fs.rmSync(tmpDir, { recursive: true, force: true })
    }
}
