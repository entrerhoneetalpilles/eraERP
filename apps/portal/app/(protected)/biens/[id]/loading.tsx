"use client"
import { Skeleton } from "boneyard-js/react"
import { PortalSkeletonDetail } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Skeleton name="portal-bien-detail" loading={true} fixture={<PortalSkeletonDetail />} fallback={<PortalSkeletonDetail />}>
      <PortalSkeletonDetail />
    </Skeleton>
  )
}
