"use client"
import { Skeleton } from "boneyard-js/react"
import { SkeletonListPage, SkeletonStatCard } from "@/components/ui/skeleton"

function ComptabiliteFixture() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-48 rounded-md bg-muted/60 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonListPage rows={6} />
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="backoffice-comptabilite" loading={true} fixture={<ComptabiliteFixture />} fallback={<ComptabiliteFixture />}>
      <ComptabiliteFixture />
    </Skeleton>
  )
}
