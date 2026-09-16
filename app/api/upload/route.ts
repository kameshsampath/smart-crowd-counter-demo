import { querySnowflake } from "@/lib/snowflake"
import fs from "fs"
import path from "path"
import os from "os"

export const dynamic = "force-dynamic"

const STAGE = "@CROWD_COUNTER_DB.CONFERENCES.SNAPS"

function isImageFile(name: string): boolean {
    const lower = name.toLowerCase()
    return lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".png")
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData()
        const files = formData.getAll("files")

        if (files.length === 0) {
            return Response.json({ error: "No files provided" }, { status: 400 })
        }

        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "crowd-upload-"))
        const uploaded: string[] = []

        try {
            for (const file of files) {
                if (!(file instanceof File)) continue
                if (!isImageFile(file.name)) continue

                const buffer = Buffer.from(await file.arrayBuffer())
                const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
                const filePath = path.join(tmpDir, safeName)
                fs.writeFileSync(filePath, buffer)

                await querySnowflake(
                    `PUT 'file://${filePath}' '${STAGE}' AUTO_COMPRESS=FALSE OVERWRITE=TRUE`
                )
                uploaded.push(safeName)
            }

            await querySnowflake(`ALTER STAGE CROWD_COUNTER_DB.CONFERENCES.SNAPS REFRESH`)

            return Response.json({ uploaded, count: uploaded.length })
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true })
        }
    } catch (e) {
        console.error(new Date().toISOString(), "[upload]", e)
        return Response.json(
            { error: e instanceof Error ? e.message : "Upload failed" },
            { status: 500 }
        )
    }
}
