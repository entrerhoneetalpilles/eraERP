"use client"
import { Skeleton } from "boneyard-js/react"
import { PortalSkeletonList } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Skeleton name="portal-biens" loading={true} fixture={<PortalSkeletonList />} fallback={<PortalSkeletonList />}>
      <PortalSkeletonList />
    </Skeleton>
  )
}
