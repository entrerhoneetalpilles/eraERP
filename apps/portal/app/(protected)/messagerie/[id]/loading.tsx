import { Skeleton } from "boneyard-js/react"
import { Bone } from "@/components/ui/skeleton"

function ThreadFixture() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8 rounded-lg" />
        <Bone className="h-5 w-48" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <Bone className="h-8 w-8 rounded-full shrink-0" />
            <div className={`space-y-1.5 max-w-xs ${i % 2 === 0 ? "" : "items-end"}`}>
              <Bone className="h-4 w-16" />
              <Bone className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-56" : "w-48"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="portal-thread-detail" loading={true} fixture={<ThreadFixture />} fallback={<ThreadFixture />}>
      <ThreadFixture />
    </Skeleton>
  )
}
