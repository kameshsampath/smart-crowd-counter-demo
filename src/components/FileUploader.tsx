"use client";

import { useCallback, useState } from "react";

interface FileUploaderProps {
    onUploadComplete: () => void;
}

export default function FileUploader({ onUploadComplete }: FileUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState<"idle" | "uploading" | "processing" | "done" | "error">("idle");
    const [message, setMessage] = useState("");

    const handleUpload = useCallback(
        async (files: FileList | File[]) => {
            const validFiles = Array.from(files).filter((f) =>
                ["image/jpeg", "image/png"].includes(f.type)
            );

            if (validFiles.length === 0) {
                setPhase("error");
                setMessage("Only JPG and PNG files are allowed.");
                setTimeout(() => setPhase("idle"), 4000);
                return;
            }

            setPhase("uploading");
            setProgress(0);
            setMessage(`Uploading ${validFiles.length} file${validFiles.length > 1 ? "s" : ""}...`);

            const formData = new FormData();
            validFiles.forEach((f) => formData.append("files", f));

            try {
                const timer = setInterval(() => {
                    setProgress((p) => Math.min(p + 8, 85));
                }, 200);

                const res = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                clearInterval(timer);
                setProgress(100);

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Upload failed");
                }

                const data = await res.json();
                setPhase("processing");
                setMessage(
                    `${data.uploaded} file${data.uploaded > 1 ? "s" : ""} uploaded. Cortex AI is analyzing the images — this may take 30-60 seconds...`
                );
                onUploadComplete();

                setTimeout(() => {
                    setPhase("done");
                    setMessage("Analysis complete! Check the results below.");
                    setTimeout(() => setPhase("idle"), 5000);
                }, 8000);
            } catch (err) {
                setPhase("error");
                setMessage(err instanceof Error ? err.message : "Upload failed");
                setTimeout(() => setPhase("idle"), 5000);
            }
        },
        [onUploadComplete]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            handleUpload(e.dataTransfer.files);
        },
        [handleUpload]
    );

    const isActive = phase !== "idle";

    return (
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => {
                    if (isActive) return;
                    const input = document.createElement("input");
                    input.type = "file";
                    input.multiple = true;
                    input.accept = "image/jpeg,image/png";
                    input.onchange = () => {
                        if (input.files) handleUpload(input.files);
                    };
                    input.click();
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-200 ${isDragging
                        ? "border-[#29B5E8] bg-blue-50/80 shadow-lg shadow-blue-100"
                        : isActive
                            ? "pointer-events-none border-gray-200 bg-white"
                            : "border-gray-300 bg-white hover:border-[#29B5E8]/50 hover:bg-gradient-to-b hover:from-blue-50/30 hover:to-white hover:shadow-md"
                    }`}
            >
                {phase === "idle" && (
                    <>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 transition-transform group-hover:scale-110">
                            <svg
                                className="h-8 w-8 text-indigo-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                                />
                            </svg>
                        </div>
                        <p className="text-base font-semibold text-gray-800">
                            Drag & drop conference photos here
                        </p>
                        <p className="mt-1.5 text-sm text-gray-500">
                            or <span className="font-medium text-[#29B5E8]">click to browse</span> your files
                        </p>
                        <p className="mt-3 text-xs text-gray-400">
                            Supports JPG and PNG
                        </p>
                    </>
                )}

                {phase === "uploading" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                            <svg className="h-8 w-8 animate-bounce text-[#29B5E8]" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-700">{message}</p>
                        <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#29B5E8] to-indigo-500 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {phase === "processing" && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
                            <svg className="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-indigo-700">{message}</p>
                        <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" style={{ animationDelay: "0.2s" }} />
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" style={{ animationDelay: "0.4s" }} />
                        </div>
                    </div>
                )}

                {phase === "done" && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-green-700">{message}</p>
                    </div>
                )}

                {phase === "error" && (
                    <div className="flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                            <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                        </div>
                        <p className="text-sm font-medium text-red-700">{message}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
