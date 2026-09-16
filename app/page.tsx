import { CrowdDashboard } from "@/components/crowd-dashboard"

export const dynamic = "force-dynamic"

export default function Page() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)]">
      <CrowdDashboard />
    </main>
  )
}
