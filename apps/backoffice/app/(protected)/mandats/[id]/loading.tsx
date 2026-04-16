"use client"
import { Skeleton } from "boneyard-js/react"
import { SkeletonDetailPage } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Skeleton name="backoffice-mandat-detail" loading={true} fixture={<SkeletonDetailPage />} fallback={<SkeletonDetailPage />}>
      <SkeletonDetailPage />
    </Skeleton>
  )
}
