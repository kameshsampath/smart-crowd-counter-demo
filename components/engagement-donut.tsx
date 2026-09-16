"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { ChartTooltip } from "@/components/chart-utils"

const COLORS = ["#29b5e8", "#94a3b8"]

interface EngagementDonutProps {
    raisedHands: number
    others: number
}

export function EngagementDonut({ raisedHands, others }: EngagementDonutProps) {
    const data = [
        { name: "Raised Hands", value: raisedHands },
        { name: "Others", value: others },
    ]

    if (raisedHands === 0 && others === 0) {
        return (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
                No data
            </div>
        )
    }

    return (
        <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value: string) => (
                            <span className="text-xs text-foreground">{value}</span>
                        )}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
