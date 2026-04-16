import { Skeleton } from "boneyard-js/react"
import { Bone, PortalSkeletonHeader } from "@/components/ui/skeleton"

function ParametresFixture() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <PortalSkeletonHeader />
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[#D9C5B8]/30 last:border-0">
            <div className="space-y-1">
              <Bone className="h-4 w-32" />
              <Bone className="h-3 w-48" />
            </div>
            <Bone className="h-8 w-16 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="portal-parametres" loading={true} fixture={<ParametresFixture />} fallback={<ParametresFixture />}>
      <ParametresFixture />
    </Skeleton>
  )
}
