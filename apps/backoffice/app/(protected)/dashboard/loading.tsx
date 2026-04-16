"use client"
import { Skeleton } from "boneyard-js/react"
import { SkeletonStatCard, SkeletonTable } from "@/components/ui/skeleton"

function DashboardFixture() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 rounded-md bg-muted/60 animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonTable rows={6} />
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="backoffice-dashboard" loading={true} fixture={<DashboardFixture />} fallback={<DashboardFixture />}>
      <DashboardFixture />
    </Skeleton>
  )
}
