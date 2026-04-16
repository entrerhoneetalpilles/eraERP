// Skeleton primitives for portal loading states
// Uses the portal's warm cream/gold design language

export function Bone({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#D9C5B8]/40 ${className}`}
      aria-hidden="true"
    />
  )
}

export function PortalSkeletonHeader() {
  return (
    <div className="space-y-1 mb-6">
      <Bone className="h-8 w-48" />
      <Bone className="h-4 w-32" />
    </div>
  )
}

export function PortalSkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-[#D9C5B8]/40 bg-white p-5 space-y-3 ${className}`}>
      <div className="flex items-start justify-between">
        <Bone className="h-5 w-32" />
        <Bone className="h-5 w-16 rounded-full" />
      </div>
      <Bone className="h-4 w-full" />
      <Bone className="h-4 w-3/4" />
    </div>
  )
}

export function PortalSkeletonSoldeCard() {
  return (
    <div className="rounded-2xl bg-[#1a2744] p-6 space-y-4">
      <div className="flex justify-between items-start">
        <Bone className="h-4 w-28 bg-white/10" />
        <Bone className="h-8 w-8 rounded-full bg-white/10" />
      </div>
      <Bone className="h-10 w-40 bg-white/10" />
      <Bone className="h-3 w-32 bg-white/10" />
    </div>
  )
}

export function PortalSkeletonEventCard() {
  return (
    <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white p-4 space-y-2">
      <div className="flex items-center gap-3">
        <Bone className="h-10 w-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Bone className="h-4 w-3/4" />
          <Bone className="h-3 w-1/2" />
        </div>
      </div>
    </div>
  )
}

export function PortalSkeletonListItem() {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-[#D9C5B8]/30">
      <Bone className="h-10 w-10 rounded-xl shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Bone className="h-4 w-2/3" />
        <Bone className="h-3 w-1/3" />
      </div>
      <Bone className="h-5 w-16 rounded-full shrink-0" />
    </div>
  )
}

export function PortalSkeletonDashboard() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <div className="space-y-1">
        <Bone className="h-7 w-44" />
        <Bone className="h-4 w-28" />
      </div>
      <PortalSkeletonSoldeCard />
      <div className="space-y-3">
        <Bone className="h-5 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <PortalSkeletonEventCard key={i} />
        ))}
      </div>
    </div>
  )
}

export function PortalSkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <PortalSkeletonHeader />
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white overflow-hidden">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="px-4">
            <PortalSkeletonListItem />
          </div>
        ))}
      </div>
    </div>
  )
}

export function PortalSkeletonDetail() {
  return (
    <div className="space-y-5 pb-24 lg:pb-8">
      <PortalSkeletonHeader />
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white p-5 space-y-4">
        <Bone className="h-6 w-1/2" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Bone className="h-3 w-16" />
              <Bone className="h-5 w-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-[#D9C5B8]/40 bg-white p-5 space-y-3">
        <Bone className="h-5 w-32" />
        <Bone className="h-4 w-full" />
        <Bone className="h-4 w-5/6" />
        <Bone className="h-4 w-4/6" />
      </div>
    </div>
  )
}
