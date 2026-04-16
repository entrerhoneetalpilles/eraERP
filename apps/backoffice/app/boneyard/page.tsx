"use client"
// Dev-only scan target for `npx boneyard-js build http://localhost:3000/boneyard`
// Must be a client component so <Skeleton> can mount and register __BONEYARD_SNAPSHOT.
import { notFound } from "next/navigation"
import { Skeleton } from "boneyard-js/react"
import {
  SkeletonListPage,
  SkeletonDetailPage,
  SkeletonFormPage,
  SkeletonStatCard,
  SkeletonBlock,
  SkeletonPageHeader,
  SkeletonTable,
} from "@/components/ui/skeleton"

function DashboardFixture() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-40 rounded-md bg-muted/60" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonTable rows={6} />
    </div>
  )
}

function ComptabiliteFixture() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-48 rounded-md bg-muted/60" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonTable rows={6} />
    </div>
  )
}

function MenageFixture() {
  return (
    <div className="space-y-6">
      <div className="h-7 w-36 rounded-md bg-muted/60" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)}
      </div>
      <SkeletonTable rows={7} />
    </div>
  )
}

function PlanningFixture() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border p-3 space-y-1.5">
            <SkeletonBlock className="h-3.5 w-20" />
            <SkeletonBlock className="h-6 w-12" />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-8 m-2 rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="grid grid-cols-7 border-b border-border/50 last:border-0">
            {Array.from({ length: 7 }).map((_, col) => (
              <div key={col} className="h-24 p-1 border-r border-border/50 last:border-0">
                <SkeletonBlock className="h-3 w-6 mb-1" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentsFixture() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>
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

const SKELETONS = [
  { name: "backoffice-dashboard",          fixture: <DashboardFixture /> },
  { name: "backoffice-proprietaires",      fixture: <SkeletonListPage /> },
  { name: "backoffice-proprietaire-detail",fixture: <SkeletonDetailPage /> },
  { name: "backoffice-proprietaire-new",   fixture: <SkeletonFormPage /> },
  { name: "backoffice-biens",              fixture: <SkeletonListPage /> },
  { name: "backoffice-bien-detail",        fixture: <SkeletonDetailPage /> },
  { name: "backoffice-bien-new",           fixture: <SkeletonFormPage /> },
  { name: "backoffice-mandats",            fixture: <SkeletonListPage /> },
  { name: "backoffice-mandat-detail",      fixture: <SkeletonDetailPage /> },
  { name: "backoffice-mandat-new",         fixture: <SkeletonFormPage /> },
  { name: "backoffice-reservations",       fixture: <SkeletonListPage /> },
  { name: "backoffice-reservation-detail", fixture: <SkeletonDetailPage /> },
  { name: "backoffice-voyageurs",          fixture: <SkeletonListPage /> },
  { name: "backoffice-voyageur-detail",    fixture: <SkeletonDetailPage /> },
  { name: "backoffice-crg",               fixture: <SkeletonListPage /> },
  { name: "backoffice-facturation",        fixture: <SkeletonListPage /> },
  { name: "backoffice-facture-detail",     fixture: <SkeletonDetailPage /> },
  { name: "backoffice-comptabilite",       fixture: <ComptabiliteFixture /> },
  { name: "backoffice-prestataires",       fixture: <SkeletonListPage /> },
  { name: "backoffice-prestataire-detail", fixture: <SkeletonDetailPage /> },
  { name: "backoffice-travaux",            fixture: <SkeletonListPage /> },
  { name: "backoffice-travaux-detail",     fixture: <SkeletonDetailPage /> },
  { name: "backoffice-menage",             fixture: <MenageFixture /> },
  { name: "backoffice-menage-detail",      fixture: <SkeletonDetailPage /> },
  { name: "backoffice-planning",           fixture: <PlanningFixture /> },
  { name: "backoffice-documents",          fixture: <DocumentsFixture /> },
]

export default function BoneyardPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound()

  return (
    <div className="min-h-screen bg-background p-6 space-y-12">
      {SKELETONS.map(({ name, fixture }) => (
        <section key={name} data-boneyard-section={name}>
          <p className="text-xs font-mono text-muted-foreground mb-3 opacity-60">{name}</p>
          {/* loading={false} so boneyard CLI can measure the fixture layout */}
          <Skeleton name={name} loading={false}>
            {fixture}
          </Skeleton>
        </section>
      ))}
    </div>
  )
}
