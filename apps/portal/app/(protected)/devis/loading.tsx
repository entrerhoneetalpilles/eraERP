import { Skeleton } from "boneyard-js/react"
import { Bone, PortalSkeletonHeader } from "@/components/ui/skeleton"

function DevisFixture() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <PortalSkeletonHeader />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#D9C5B8]/40 bg-white p-5 space-y-3">
            <div className="flex items-start justify-between">
              <Bone className="h-5 w-40" />
              <Bone className="h-6 w-24 rounded-full" />
            </div>
            <Bone className="h-4 w-full" />
            <Bone className="h-4 w-2/3" />
            <div className="flex gap-3 pt-1">
              <Bone className="h-9 flex-1 rounded-xl" />
              <Bone className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="portal-devis" loading={true} fixture={<DevisFixture />} fallback={<DevisFixture />}>
      <DevisFixture />
    </Skeleton>
  )
}
