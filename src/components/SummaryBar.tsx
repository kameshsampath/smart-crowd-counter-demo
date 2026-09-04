"use client";

import { ImageRow } from "@/app/page";

interface SummaryBarProps {
    data: ImageRow[];
}

export default function SummaryBar({ data }: SummaryBarProps) {
    if (data.length === 0) return null;

    const totalSessions = data.length;
    const totalAttendees = data.reduce((sum, r) => sum + (r.TOTAL_ATTENDEES || 0), 0);
    const avgEngagement =
        data.reduce((sum, r) => sum + (r.PERCENTAGE_WITH_HANDS_UP || 0), 0) /
        data.length;
    const highestEngagement = Math.max(
        ...data.map((r) => r.PERCENTAGE_WITH_HANDS_UP || 0)
    );

    const stats = [
        {
            label: "Sessions Analyzed",
            value: totalSessions.toString(),
            border: "border-l-blue-500",
            gradient: "from-blue-50 to-white",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                </svg>
            ),
        },
        {
            label: "Attendees Counted",
            value: totalAttendees.toLocaleString(),
            border: "border-l-purple-500",
            gradient: "from-purple-50 to-white",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
            ),
        },
        {
            label: "Avg Engagement",
            value: `${avgEngagement.toFixed(1)}%`,
            border: "border-l-green-500",
            gradient: "from-green-50 to-white",
            iconBg: "bg-green-100",
            iconColor: "text-green-600",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
            ),
        },
        {
            label: "Peak Engagement",
            value: `${highestEngagement.toFixed(1)}%`,
            border: "border-l-amber-500",
            gradient: "from-amber-50 to-white",
            iconBg: "bg-amber-100",
            iconColor: "text-amber-600",
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
            ),
        },
    ];

    return (
        <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <div
                        key={stat.label}
                        className={`animate-fade-in rounded-2xl border-l-4 bg-gradient-to-br ${stat.gradient} p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${stat.border}`}
                        style={{ animationDelay: `${i * 80}ms` }}
                    >
                        <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}>
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-extrabold tabular-nums text-gray-900">
                            {stat.value}
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
