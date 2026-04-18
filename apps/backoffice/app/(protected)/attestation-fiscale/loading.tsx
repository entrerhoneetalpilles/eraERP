export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-72 bg-muted rounded animate-pulse" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-card rounded-lg border border-border p-4 h-20 animate-pulse" />
        ))}
      </div>
      <div className="bg-card rounded-lg border border-border h-80 animate-pulse" />
    </div>
  )
}
