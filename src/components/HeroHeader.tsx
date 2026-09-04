"use client";

export default function HeroHeader() {
    return (
        <header className="relative overflow-hidden bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500">
            <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                    backgroundSize: "32px 32px",
                }}
            />
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="relative mx-auto max-w-7xl px-6 py-16 text-center sm:py-20">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    Powered by Snowflake Cortex AI
                </div>
                <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
                    Smart Crowd Counter
                </h1>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-blue-100/90">
                    Upload conference session photos and let AI count attendees,
                    detect raised hands, and measure real-time engagement.
                </p>
            </div>
        </header>
    );
}
