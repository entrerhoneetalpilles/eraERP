"use client"
import { Skeleton } from "boneyard-js/react"
import { Bone, PortalSkeletonHeader, PortalSkeletonEventCard } from "@/components/ui/skeleton"

function PlanningFixture() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <PortalSkeletonHeader />
      {/* Month navigation */}
      <div className="flex items-center justify-between rounded-2xl border border-[#D9C5B8]/40 bg-white p-4">
        <Bone className="h-8 w-8 rounded-xl" />
        <Bone className="h-5 w-32" />
        <Bone className="h-8 w-8 rounded-xl" />
      </div>
      {/* Events */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <PortalSkeletonEventCard key={i} />
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="portal-planning" loading={true} fixture={<PlanningFixture />} fallback={<PlanningFixture />}>
      <PlanningFixture />
    </Skeleton>
  )
}
