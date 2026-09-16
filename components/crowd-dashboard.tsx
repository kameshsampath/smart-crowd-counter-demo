"use client"

import { useState, useCallback, useRef } from "react"
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query"
import { Upload, Trash2, ImageIcon, Users, HandMetal, TrendingUp, Loader2, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EngagementDonut } from "@/components/engagement-donut"

interface ImageData {
    relativePath: string
    size: number
    lastModified: string | null
    fileUrl: string
    totalAttendees: number
    raisedHands: number
    percentageWithHandsUp: number
    caption: string
}

type FileInput = FileList | File[]

const TIPS = [
    "Cortex AI is analyzing each photo for attendee count and engagement...",
    "Looking for raised hands to measure audience participation...",
    "Generating captions that describe the scene...",
    "AI vision models process each image individually for accuracy...",
    "This may take 15-30 seconds per image — hang tight!",
]

export function CrowdDashboard() {
    const queryClient = useQueryClient()
    const [selectedRow, setSelectedRow] = useState<string | null>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const [analyzeStartTime, setAnalyzeStartTime] = useState<number | null>(null)
    const [tipIndex, setTipIndex] = useState(0)
    const tipInterval = useRef<ReturnType<typeof setInterval> | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [dragOver, setDragOver] = useState(false)

    const { data: images = [], isLoading } = useQuery<ImageData[]>({
        queryKey: ["images"],
        queryFn: async () => {
            const res = await fetch("/api/images")
            if (!res.ok) throw new Error("Failed to fetch images")
            return res.json()
        },
    })

    const startTipRotation = useCallback(() => {
        setTipIndex(0)
        if (tipInterval.current) clearInterval(tipInterval.current)
        tipInterval.current = setInterval(() => {
            setTipIndex((prev) => (prev + 1) % TIPS.length)
        }, 5000)
    }, [])

    const stopTipRotation = useCallback(() => {
        if (tipInterval.current) {
            clearInterval(tipInterval.current)
            tipInterval.current = null
        }
    }, [])

    const handleUpload = useCallback(async (files: FileInput) => {
        const fileArray = Array.from(files)
        if (fileArray.length === 0) return

        setIsUploading(true)
        try {
            const formData = new FormData()
            fileArray.forEach((f) => formData.append("files", f))
            const res = await fetch("/api/upload", { method: "POST", body: formData })
            if (!res.ok) throw new Error("Upload failed")

            setIsUploading(false)
            setIsAnalyzing(true)
            setAnalyzeStartTime(Date.now())
            startTipRotation()

            await queryClient.refetchQueries({ queryKey: ["images"] })
        } catch (e) {
            console.error("Upload error:", e)
        } finally {
            setIsUploading(false)
            setIsAnalyzing(false)
            setAnalyzeStartTime(null)
            stopTipRotation()
        }
    }, [queryClient, startTipRotation, stopTipRotation])

    const resetMutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/reset", { method: "POST" })
            if (!res.ok) throw new Error("Reset failed")
        },
        onMutate: () => setIsResetting(true),
        onSettled: async () => {
            setSelectedRow(null)
            await queryClient.refetchQueries({ queryKey: ["images"] })
            setIsResetting(false)
        },
    })

    const selected = images.find((img) => img.relativePath === selectedRow)

    const totalPhotos = images.length
    const totalAttendees = images.reduce((sum, img) => sum + img.totalAttendees, 0)
    const totalHands = images.reduce((sum, img) => sum + img.raisedHands, 0)
    const avgEngagement = totalAttendees > 0
        ? Math.round((totalHands / totalAttendees) * 1000) / 10
        : 0

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Status banners */}
            {isUploading && (
                <Banner icon={<Loader2 className="h-4 w-4 animate-spin" />} color="blue">
                    Uploading photos...
                </Banner>
            )}
            {isAnalyzing && (
                <Banner icon={<Loader2 className="h-4 w-4 animate-spin" />} color="blue">
                    <span>Analyzing with Cortex AI... </span>
                    {analyzeStartTime && <ElapsedTimer start={analyzeStartTime} />}
                    <span className="ml-2 text-xs opacity-75">{TIPS[tipIndex]}</span>
                </Banner>
            )}
            {isResetting && (
                <Banner icon={<Loader2 className="h-4 w-4 animate-spin" />} color="amber">
                    Clearing all photos...
                </Banner>
            )}

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<ImageIcon className="h-4 w-4" />} label="Photos" value={totalPhotos} />
                <StatCard icon={<Users className="h-4 w-4" />} label="Total Attendees" value={totalAttendees} />
                <StatCard icon={<HandMetal className="h-4 w-4" />} label="Raised Hands" value={totalHands} />
                <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Avg Engagement" value={`${avgEngagement}%`} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                            handleUpload(e.target.files)
                            e.target.value = ""
                        }
                    }}
                />
                <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading || isAnalyzing || isResetting}
                >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Photos
                </Button>
                <Button
                    variant="destructive"
                    onClick={() => resetMutation.mutate()}
                    disabled={isUploading || isAnalyzing || isResetting || images.length === 0}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                </Button>
            </div>

            {/* Drop zone + table + detail */}
            <div
                className={`rounded-lg border-2 border-dashed transition-colors ${dragOver ? "border-primary bg-primary/5" : "border-border"
                    }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    if (e.dataTransfer.files.length > 0) handleUpload(e.dataTransfer.files)
                }}
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Loading...
                    </div>
                ) : images.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                        <Upload className="h-10 w-10 mb-3 opacity-40" />
                        <p className="text-sm font-medium">Drop conference photos here or click Upload</p>
                        <p className="text-xs mt-1 opacity-60">Supports JPG and PNG</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {/* Image table */}
                        <div className="overflow-auto rounded-lg border">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="text-left p-3 font-medium">Photo</th>
                                        <th className="text-right p-3 font-medium">Attendees</th>
                                        <th className="text-right p-3 font-medium">Raised Hands</th>
                                        <th className="text-right p-3 font-medium">Engagement</th>
                                        <th className="text-left p-3 font-medium">Caption</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {images.map((img) => (
                                        <tr
                                            key={img.relativePath}
                                            onClick={() => setSelectedRow(
                                                selectedRow === img.relativePath ? null : img.relativePath
                                            )}
                                            className={`border-b cursor-pointer transition-colors hover:bg-muted/50 ${selectedRow === img.relativePath ? "bg-primary/10" : ""
                                                }`}
                                        >
                                            <td className="p-3 font-mono text-xs">{img.relativePath}</td>
                                            <td className="p-3 text-right tabular-nums">{img.totalAttendees}</td>
                                            <td className="p-3 text-right tabular-nums">{img.raisedHands}</td>
                                            <td className="p-3 text-right tabular-nums">{img.percentageWithHandsUp.toFixed(1)}%</td>
                                            <td className="p-3 text-muted-foreground max-w-[300px] truncate">{img.caption}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Detail panel */}
                        {selected && (
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base flex items-center gap-2">
                                        <Info className="h-4 w-4" />
                                        {selected.relativePath}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left: image + caption */}
                                        <div className="space-y-3">
                                            <div className="rounded-lg overflow-hidden border bg-muted aspect-video relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={`/api/stage-image?path=${encodeURIComponent(selected.relativePath)}`}
                                                    alt={selected.caption}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <p className="text-sm text-muted-foreground italic">
                                                {selected.caption}
                                            </p>
                                        </div>

                                        {/* Right: metrics + donut */}
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-3">
                                                <MetricBox label="Attendees" value={selected.totalAttendees} />
                                                <MetricBox label="Raised Hands" value={selected.raisedHands} />
                                                <MetricBox
                                                    label="Engagement"
                                                    value={`${selected.percentageWithHandsUp.toFixed(1)}%`}
                                                />
                                                <MetricBox
                                                    label="Others"
                                                    value={selected.totalAttendees - selected.raisedHands}
                                                />
                                            </div>
                                            <EngagementDonut
                                                raisedHands={selected.raisedHands}
                                                others={selected.totalAttendees - selected.raisedHands}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    {icon}
                    <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
            </CardContent>
        </Card>
    )
}

function MetricBox({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border p-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">{label}</p>
            <p className="text-lg font-semibold tabular-nums">{value}</p>
        </div>
    )
}

function Banner({ icon, color, children }: { icon: React.ReactNode; color: string; children: React.ReactNode }) {
    const colorMap: Record<string, string> = {
        blue: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
        amber: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
    }
    return (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm ${colorMap[color] ?? ""}`}>
            {icon}
            <div className="flex items-center flex-wrap gap-1">{children}</div>
        </div>
    )
}

function ElapsedTimer({ start }: { start: number }) {
    const [, setTick] = useState(0)
    useState(() => {
        const id = setInterval(() => setTick((t) => t + 1), 1000)
        return () => clearInterval(id)
    })
    const elapsed = Math.floor((Date.now() - start) / 1000)
    const m = Math.floor(elapsed / 60)
    const s = elapsed % 60
    return (
        <span className="font-mono text-xs">
            ({m > 0 ? `${m}m ${s}s` : `${s}s`})
        </span>
    )
}
