"use client";

import { ImageRow } from "@/app/page";
import DonutChart from "./DonutChart";
import { useEffect, useState } from "react";

interface DetailPanelProps {
    row: ImageRow;
}

export default function DetailPanel({ row }: DetailPanelProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [showMeta, setShowMeta] = useState(false);

    useEffect(() => {
        setImageUrl(null);
        fetch(
            `/api/presigned-url?path=${encodeURIComponent(row.RELATIVE_PATH)}`
        )
            .then((r) => r.json())
            .then((d) => setImageUrl(d.url))
            .catch(() => setImageUrl(null));
    }, [row.RELATIVE_PATH]);

    const attendees = row.TOTAL_ATTENDEES ?? 0;
    const raisedHands = row.RAISED_HANDS ?? 0;
    const engagement = row.PERCENTAGE_WITH_HANDS_UP ?? 0;

    const metricCards = [
        {
            label: "Total Attendees",
            value: attendees.toString(),
            color: "text-blue-600",
            bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
            ring: "ring-blue-200/50",
            icon: (
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            ),
        },
        {
            label: "Raised Hands",
            value: raisedHands.toString(),
            color: "text-orange-600",
            bg: "bg-gradient-to-br from-orange-50 to-orange-100/50",
            ring: "ring-orange-200/50",
            icon: (
                <svg className="h-5 w-5 text-orange-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15" />
                </svg>
            ),
        },
        {
            label: "Engagement",
            value: `${engagement.toFixed(1)}%`,
            color: "text-green-600",
            bg: "bg-gradient-to-br from-green-50 to-green-100/50",
            ring: "ring-green-200/50",
            icon: (
                <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
            ),
        },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <div className="animate-fade-in grid grid-cols-1 gap-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-100 md:grid-cols-2">
                <div>
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={row.RELATIVE_PATH}
                            className="w-full rounded-xl object-cover shadow-sm"
                        />
                    ) : (
                        <div className="flex aspect-video items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100">
                            <svg className="h-10 w-10 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        </div>
                    )}
                    {row.CAPTION && (
                        <p className="mt-4 text-sm italic leading-relaxed text-gray-600">
                            {row.CAPTION}
                        </p>
                    )}
                    <button
                        onClick={() => setShowMeta(!showMeta)}
                        className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#29B5E8] transition-colors hover:text-indigo-600"
                    >
                        <svg className={`h-3 w-3 transition-transform ${showMeta ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                        File metadata
                    </button>
                    {showMeta && (
                        <div className="mt-2 space-y-1.5 rounded-xl bg-gray-50 p-4 text-xs text-gray-600">
                            <p>
                                <span className="font-semibold text-gray-700">File:</span>{" "}
                                {row.RELATIVE_PATH}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-700">Size:</span>{" "}
                                {row.SIZE ? `${(row.SIZE / 1024).toFixed(1)} KB` : "N/A"}
                            </p>
                            <p>
                                <span className="font-semibold text-gray-700">Modified:</span>{" "}
                                {row.LAST_MODIFIED
                                    ? new Date(row.LAST_MODIFIED).toLocaleString()
                                    : "N/A"}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-5">
                    {metricCards.map((m) => (
                        <div
                            key={m.label}
                            className={`flex items-center gap-4 rounded-xl ${m.bg} p-5 ring-1 ${m.ring}`}
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                                {m.icon}
                            </div>
                            <div>
                                <p className={`text-3xl font-extrabold tabular-nums ${m.color}`}>
                                    {m.value}
                                </p>
                                <p className="text-sm font-medium text-gray-500">{m.label}</p>
                            </div>
                        </div>
                    ))}

                    <div className="flex flex-col items-center rounded-xl bg-gradient-to-br from-gray-50 to-white p-6 ring-1 ring-gray-100">
                        <p className="mb-4 text-sm font-semibold text-gray-700">
                            Engagement Breakdown
                        </p>
                        <DonutChart
                            raisedHands={raisedHands}
                            totalAttendees={attendees}
                        />
                        <div className="mt-4 flex gap-6 text-xs text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                                Raised Hands
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-[#f97316]" />
                                Others
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
