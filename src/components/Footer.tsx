"use client";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-gray-100 bg-white">
            <div className="mx-auto max-w-7xl px-6 py-5">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                    <span>
                        Built with <span className="font-medium text-gray-500">Next.js</span> +{" "}
                        <span className="font-medium text-gray-500">Snowflake Cortex AI</span>
                    </span>
                </div>
            </div>
        </footer>
    );
}
