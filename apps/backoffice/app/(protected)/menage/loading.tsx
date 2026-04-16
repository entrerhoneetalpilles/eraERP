import { Skeleton } from "boneyard-js/react"
import { SkeletonListPage, SkeletonStatCard } from "@/components/ui/skeleton"

function MenageFixture() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-36 rounded-md bg-muted/60 animate-pulse" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonListPage rows={7} />
    </div>
  )
}

export default function Loading() {
  return (
    <Skeleton name="backoffice-menage" loading={true} fixture={<MenageFixture />} fallback={<MenageFixture />}>
      <MenageFixture />
    </Skeleton>
  )
}
