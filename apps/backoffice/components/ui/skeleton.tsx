// Reusable skeleton primitives for loading states
// Boneyard <Skeleton> wraps these as fixture content so the CLI
// can scan dimensions. They also serve as immediate visual fallback.

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-muted/60 ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={`h-4 ${className}`} />
}

export function SkeletonPageHeader() {
  return (
    <div className="flex items-start justify-between pb-4 border-b border-border">
      <div className="space-y-2">
        <SkeletonBlock className="h-7 w-48" />
        <SkeletonBlock className="h-4 w-32" />
      </div>
      <SkeletonBlock className="h-9 w-36 rounded-md" />
    </div>
  )
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/50">
      <SkeletonBlock className="h-4 w-4 shrink-0" />
      <SkeletonBlock className="h-4 flex-1" />
      <SkeletonBlock className="h-4 w-28 shrink-0" />
      <SkeletonBlock className="h-4 w-20 shrink-0" />
      <SkeletonBlock className="h-4 w-24 shrink-0" />
      <SkeletonBlock className="h-6 w-16 rounded-full shrink-0" />
      <SkeletonBlock className="h-7 w-7 rounded-md shrink-0" />
    </div>
  )
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/30 border-b border-border">
        <SkeletonBlock className="h-3.5 w-4 shrink-0" />
        <SkeletonBlock className="h-3.5 w-20 shrink-0" />
        <SkeletonBlock className="h-3.5 flex-1" />
        <SkeletonBlock className="h-3.5 w-24 shrink-0" />
        <SkeletonBlock className="h-3.5 w-20 shrink-0" />
        <SkeletonBlock className="h-3.5 w-16 shrink-0" />
        <SkeletonBlock className="h-3.5 w-8 shrink-0" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonTableRow key={i} />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`rounded-lg border border-border p-4 space-y-3 ${className}`}>
      <div className="flex items-start justify-between">
        <SkeletonBlock className="h-5 w-36" />
        <SkeletonBlock className="h-5 w-16 rounded-full" />
      </div>
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-3/4" />
      <div className="flex gap-2 pt-1">
        <SkeletonBlock className="h-4 w-20" />
        <SkeletonBlock className="h-4 w-20" />
      </div>
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="rounded-lg border border-border p-5 space-y-3">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-4 w-28" />
        <SkeletonBlock className="h-8 w-8 rounded-md" />
      </div>
      <SkeletonBlock className="h-8 w-32" />
      <SkeletonBlock className="h-3 w-24" />
    </div>
  )
}

export function SkeletonDetailSection() {
  return (
    <div className="rounded-lg border border-border p-5 space-y-4">
      <SkeletonBlock className="h-5 w-32" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-5 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonListPage({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <SkeletonTable rows={rows} />
    </div>
  )
}

export function SkeletonDetailPage() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <SkeletonDetailSection />
          <SkeletonDetailSection />
        </div>
        <div className="space-y-4">
          <SkeletonDetailSection />
          <SkeletonDetailSection />
        </div>
      </div>
    </div>
  )
}

export function SkeletonFormPage() {
  return (
    <div className="space-y-6">
      <SkeletonPageHeader />
      <div className="rounded-lg border border-border p-6 space-y-5 max-w-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-9 w-full rounded-md" />
          </div>
        ))}
        <div className="flex justify-end gap-3 pt-2">
          <SkeletonBlock className="h-9 w-24 rounded-md" />
          <SkeletonBlock className="h-9 w-32 rounded-md" />
        </div>
      </div>
    </div>
  )
}
