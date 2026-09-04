"use client";

import { ImageRow } from "@/app/page";

interface DataTableProps {
    data: ImageRow[];
    selectedRow: string | null;
    onSelectRow: (path: string | null) => void;
    isLoading?: boolean;
    isRefreshing?: boolean;
}

function engagementBadge(pct: number) {
    if (pct > 50)
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 ring-1 ring-green-600/10">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {pct.toFixed(1)}%
            </span>
        );
    if (pct >= 25)
        return (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-600/10">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                {pct.toFixed(1)}%
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-600/10">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {pct.toFixed(1)}%
        </span>
    );
}

function SkeletonRows() {
    return (
        <>
            {[1, 2, 3].map((i) => (
                <tr key={i} className="border-b border-gray-50">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 animate-pulse rounded-lg bg-gray-100" />
                            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="ml-auto h-4 w-10 animate-pulse rounded bg-gray-100" />
                    </td>
                    <td className="px-6 py-4 text-right">
                        <div className="ml-auto h-6 w-16 animate-pulse rounded-full bg-gray-100" />
                    </td>
                </tr>
            ))}
        </>
    );
}

export default function DataTable({
    data,
    selectedRow,
    onSelectRow,
    isLoading,
    isRefreshing,
}: DataTableProps) {
    if (isLoading) {
        return (
            <div className="mx-auto w-full max-w-7xl px-6 py-6">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                    <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/80 px-6 py-3">
                        <svg className="h-4 w-4 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-xs font-medium text-indigo-600">
                            Loading sessions...
                        </span>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Image Name</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Attendees</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Raised Hands</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Engagement</th>
                            </tr>
                        </thead>
                        <tbody>
                            <SkeletonRows />
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="mx-auto w-full max-w-7xl px-6 py-8">
                <div className="rounded-2xl bg-white p-16 text-center shadow-sm ring-1 ring-gray-100">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100">
                        <svg
                            className="h-10 w-10 text-gray-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        No sessions analyzed yet
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                        Upload conference photos above to get started with AI-powered crowd
                        analysis and engagement metrics.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
                {isRefreshing && (
                    <div className="flex items-center gap-2 border-b border-indigo-100 bg-indigo-50/50 px-6 py-2">
                        <svg className="h-3.5 w-3.5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-xs font-medium text-indigo-600">
                            Loading sessions...
                        </span>
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/80">
                                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Image Name
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Attendees
                                </th>
                                <th className="px-6 4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Raised Hands
                                </th>
                                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    Engagement
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, i) => {
                                const isSelected = selectedRow === row.RELATIVE_PATH;
                                return (
                                    <tr
                                        key={row.RELATIVE_PATH}
                                        onClick={() =>
                                            onSelectRow(isSelected ? null : row.RELATIVE_PATH)
                                        }
                                        className={`cursor-pointer border-b border-gray-50 transition-all duration-150 ${isSelected
                                            ? "border-l-[3px] border-l-blue-500 bg-blue-50/60"
                                            : i % 2 === 0
                                                ? "hover:bg-gray-50/60"
                                                : "bg-gray-50/20 hover:bg-gray-50/60"
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm font-medium text-gray-900">
                                                    {row.RELATIVE_PATH}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-gray-800">
                                            {row.TOTAL_ATTENDEES ?? 0}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-semibold tabular-nums text-gray-800">
                                            {row.RAISED_HANDS ?? 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {engagementBadge(row.PERCENTAGE_WITH_HANDS_UP ?? 0)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
