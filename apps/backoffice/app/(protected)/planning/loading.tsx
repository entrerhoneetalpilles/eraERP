import { Skeleton } from "boneyard-js/react"
import { SkeletonBlock, SkeletonPageHeader } from "@/components/ui/skeleton"

function PlanningFixture() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
            <SkeletonBlock className="h-3.5 w-20" />
            <SkeletonBlock className="h-6 w-12" />
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-8 m-2 rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 border-b border-border/50 last:border-0">
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} className="h-24 p-1 border-r border-border/50 last:border-0">
                <SkeletonBlock className="h-3 w-6 mb-1" />
                {Math.random() > 0.6 && <SkeletonBlock className="h-5 w-full rounded-sm mt-1" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="backoffice-planning" loading={true} fixture={<PlanningFixture />} fallback={<PlanningFixture />}>
      <PlanningFixture />
    </Skeleton>
  )
}
