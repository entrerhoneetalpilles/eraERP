import { Skeleton } from "boneyard-js/react"
import { SkeletonBlock, SkeletonPageHeader } from "@/components/ui/skeleton"

function DocumentsFixture() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      {/* Filter bar */}
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
      {/* Document rows */}
      <div className="rounded-lg border border-border overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0">
            <SkeletonBlock className="h-9 w-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1">
              <SkeletonBlock className="h-4 w-48" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
            <SkeletonBlock className="h-5 w-20 rounded-full shrink-0" />
            <SkeletonBlock className="h-3 w-16 shrink-0" />
            <SkeletonBlock className="h-7 w-7 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="backoffice-documents" loading={true} fixture={<DocumentsFixture />} fallback={<DocumentsFixture />}>
      <DocumentsFixture />
    </Skeleton>
  )
}
