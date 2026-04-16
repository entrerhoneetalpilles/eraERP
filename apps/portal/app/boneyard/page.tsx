"use client"
// Dev-only scan target for `npx boneyard-js build http://localhost:3001/boneyard`
// Must be a client component so <Skeleton> can mount and register __BONEYARD_SNAPSHOT.
import { notFound } from "next/navigation"
import { Skeleton } from "boneyard-js/react"
import {
  PortalSkeletonDashboard,
  PortalSkeletonList,
  PortalSkeletonDetail,
  PortalSkeletonHeader,
  PortalSkeletonListItem,
  Bone,
  PortalSkeletonEventCard,
} from "@/components/ui/skeleton"

function RevenusFixture() {
  return (
    <div className="space-y-5 pb-8">
      <PortalSkeletonHeader />
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white p-5">
        <Bone className="h-5 w-32 mb-4" />
        <Bone className="h-48 w-full rounded-xl" />
      </div>
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4"><PortalSkeletonListItem /></div>
        ))}
      </div>
    </div>
  )
}

function DocumentsFixture() {
  return (
    <div className="space-y-5 pb-8">
      <PortalSkeletonHeader />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3 border-b border-[#D9C5B8]/30 last:border-0">
            <Bone className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Bone className="h-4 w-48" /><Bone className="h-3 w-24" />
            </div>
            <Bone className="h-7 w-16 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

function MessagerieFixture() {
  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center justify-between">
        <PortalSkeletonHeader />
        <Bone className="h-9 w-32 rounded-xl" />
      </div>
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-4 border-b border-[#D9C5B8]/30 last:border-0">
            <Bone className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="flex justify-between">
                <Bone className="h-4 w-40" /><Bone className="h-3 w-16" />
              </div>
              <Bone className="h-3 w-full" /><Bone className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ThreadFixture() {
  return (
    <div className="space-y-5 pb-8">
      <div className="flex items-center gap-3">
        <Bone className="h-8 w-8 rounded-lg" />
        <Bone className="h-5 w-48" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "" : "flex-row-reverse"}`}>
            <Bone className="h-8 w-8 rounded-full shrink-0" />
            <div className="space-y-1.5">
              <Bone className="h-4 w-16" />
              <Bone className={`h-16 rounded-2xl ${i % 2 === 0 ? "w-56" : "w-48"}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PlanningFixture() {
  return (
    <div className="space-y-5 pb-8">
      <PortalSkeletonHeader />
      <div className="flex items-center justify-between rounded-2xl border border-[#D9C5B8]/40 bg-white p-4">
        <Bone className="h-8 w-8 rounded-xl" />
        <Bone className="h-5 w-32" />
        <Bone className="h-8 w-8 rounded-xl" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => <PortalSkeletonEventCard key={i} />)}
      </div>
    </div>
  )
}

function DevisFixture() {
  return (
    <div className="space-y-5 pb-8">
      <PortalSkeletonHeader />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-[#D9C5B8]/40 bg-white p-5 space-y-3">
            <div className="flex items-start justify-between">
              <Bone className="h-5 w-40" />
              <Bone className="h-6 w-24 rounded-full" />
            </div>
            <Bone className="h-4 w-full" /><Bone className="h-4 w-2/3" />
            <div className="flex gap-3 pt-1">
              <Bone className="h-9 flex-1 rounded-xl" />
              <Bone className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ParametresFixture() {
  return (
    <div className="space-y-5 pb-8">
      <PortalSkeletonHeader />
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-[#D9C5B8]/30 last:border-0">
            <div className="space-y-1">
              <Bone className="h-4 w-32" /><Bone className="h-3 w-48" />
            </div>
            <Bone className="h-8 w-16 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

const SKELETONS = [
  { name: "portal-dashboard",      fixture: <PortalSkeletonDashboard /> },
  { name: "portal-biens",          fixture: <PortalSkeletonList /> },
  { name: "portal-bien-detail",    fixture: <PortalSkeletonDetail /> },
  { name: "portal-revenus",        fixture: <RevenusFixture /> },
  { name: "portal-documents",      fixture: <DocumentsFixture /> },
  { name: "portal-messagerie",     fixture: <MessagerieFixture /> },
  { name: "portal-thread-detail",  fixture: <ThreadFixture /> },
  { name: "portal-planning",       fixture: <PlanningFixture /> },
  { name: "portal-devis",          fixture: <DevisFixture /> },
  { name: "portal-devis-detail",   fixture: <PortalSkeletonDetail /> },
  { name: "portal-parametres",     fixture: <ParametresFixture /> },
]

export default function BoneyardPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound()

  return (
    <div className="min-h-screen bg-[#F4EFEA] p-4 space-y-12">
      {SKELETONS.map(({ name, fixture }) => (
        <section key={name} data-boneyard-section={name}>
          <p className="text-xs font-mono text-[#8C7566] mb-3 opacity-60">{name}</p>
          {/* loading={false} so boneyard CLI can measure the fixture layout */}
          <Skeleton name={name} loading={false}>
            {fixture}
          </Skeleton>
        </section>
      ))}
    </div>
  )
}
