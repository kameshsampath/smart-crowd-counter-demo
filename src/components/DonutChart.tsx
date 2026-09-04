"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartProps {
    raisedHands: number;
    totalAttendees: number;
}

const COLORS = ["#2563eb", "#f97316"];

export default function DonutChart({
    raisedHands,
    totalAttendees,
}: DonutChartProps) {
    const notRaised = Math.max(0, totalAttendees - raisedHands);
    const percentage =
        totalAttendees > 0 ? ((raisedHands / totalAttendees) * 100).toFixed(1) : "0";

    const data = [
        { name: "Raised Hands", value: raisedHands },
        { name: "Not Raised", value: notRaised },
    ];

    return (
        <div className="relative h-52 w-52">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={100}
                        dataKey="value"
                        strokeWidth={0}
                    >
                        {data.map((_entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold tabular-nums text-gray-900">
                    {percentage}%
                </span>
                <span className="text-xs text-gray-500">Engagement</span>
            </div>
        </div>
    );
}
