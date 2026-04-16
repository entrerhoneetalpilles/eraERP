import { Skeleton } from "boneyard-js/react"
import { Bone, PortalSkeletonHeader } from "@/components/ui/skeleton"

function MessagerieFixture() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <div className="flex items-center justify-between">
        <PortalSkeletonHeader />
        <Bone className="h-9 w-32 rounded-xl" />
      </div>
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-4 border-b border-[#D9C5B8]/30 last:border-0">
            <Bone className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between">
                <Bone className="h-4 w-40" />
                <Bone className="h-3 w-16" />
              </div>
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="portal-messagerie" loading={true} fixture={<MessagerieFixture />} fallback={<MessagerieFixture />}>
      <MessagerieFixture />
    </Skeleton>
  )
}
