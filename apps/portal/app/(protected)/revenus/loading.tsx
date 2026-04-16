import { Skeleton } from "boneyard-js/react"
import { Bone, PortalSkeletonHeader, PortalSkeletonListItem } from "@/components/ui/skeleton"

function RevenusFixture() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <PortalSkeletonHeader />
      {/* Chart skeleton */}
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white p-5">
        <Bone className="h-5 w-32 mb-4" />
        <Bone className="h-48 w-full rounded-xl" />
      </div>
      {/* List */}
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4"><PortalSkeletonListItem /></div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="portal-revenus" loading={true} fixture={<RevenusFixture />} fallback={<RevenusFixture />}>
      <RevenusFixture />
    </Skeleton>
  )
}
