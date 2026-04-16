import { Skeleton } from "boneyard-js/react"
import { Bone, PortalSkeletonHeader } from "@/components/ui/skeleton"

function DocumentsFixture() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <PortalSkeletonHeader />
      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      {/* Document list */}
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#D9C5B8]/30 last:border-0">
            <Bone className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Bone className="h-4 w-48" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-7 w-16 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="portal-documents" loading={true} fixture={<DocumentsFixture />} fallback={<DocumentsFixture />}>
      <DocumentsFixture />
    </Skeleton>
  )
}
