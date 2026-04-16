"use client"
import { Skeleton } from "boneyard-js/react"
import { PortalSkeletonDashboard } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Skeleton name="portal-dashboard" loading={true} fixture={<PortalSkeletonDashboard />} fallback={<PortalSkeletonDashboard />}>
      <PortalSkeletonDashboard />
    </Skeleton>
  )
}
