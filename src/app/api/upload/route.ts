import { NextRequest, NextResponse } from "next/server";
import { ensureBootstrapped } from "@/lib/bootstrap";
import { getConnection } from "@/lib/snowflake";
import { config } from "@/lib/config";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

const ALLOWED_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/jpg",
]);

export async function POST(request: NextRequest) {
    try {
        await ensureBootstrapped();

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];

        if (files.length === 0) {
            return NextResponse.json({ error: "No files provided" }, { status: 400 });
        }

        for (const file of files) {
            if (!ALLOWED_TYPES.has(file.type)) {
                return NextResponse.json(
                    { error: `Invalid file type: ${file.type}. Only JPG and PNG are allowed.` },
                    { status: 400 }
                );
            }
        }

        const conn = await getConnection();
        const fqStage = `@${config.database}.${config.schema}.${config.stage}`;
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "crowd-upload-"));
        let uploadCount = 0;

        try {
            for (const file of files) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const tmpPath = path.join(tmpDir, file.name);
                fs.writeFileSync(tmpPath, buffer);

                await new Promise<void>((resolve, reject) => {
                    conn.execute({
                        sqlText: `PUT file://${tmpPath} ${fqStage} AUTO_COMPRESS=FALSE OVERWRITE=TRUE`,
                        complete: (err) => {
                            if (err) reject(err);
                            else resolve();
                        },
                    });
                });

                fs.unlinkSync(tmpPath);
                uploadCount++;
            }

            await new Promise<void>((resolve, reject) => {
                conn.execute({
                    sqlText: `ALTER STAGE ${config.database}.${config.schema}.${config.stage} REFRESH`,
                    complete: (err) => {
                        if (err) reject(err);
                        else resolve();
                    },
                });
            });
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true });
        }

        return NextResponse.json({ uploaded: uploadCount });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
