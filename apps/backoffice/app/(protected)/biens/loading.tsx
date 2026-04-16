import { Skeleton } from "boneyard-js/react"
import { SkeletonListPage } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Skeleton name="backoffice-biens" loading={true} fixture={<SkeletonListPage />} fallback={<SkeletonListPage />}>
      <SkeletonListPage />
    </Skeleton>
  )
}
