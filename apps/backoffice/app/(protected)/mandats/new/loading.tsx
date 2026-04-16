"use client"
import { Skeleton } from "boneyard-js/react"
import { SkeletonFormPage } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <Skeleton name="backoffice-mandat-new" loading={true} fixture={<SkeletonFormPage />} fallback={<SkeletonFormPage />}>
      <SkeletonFormPage />
    </Skeleton>
  )
}
