export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 w-64 bg-muted rounded" />
      {[0, 1].map((i) => (
        <div key={i} className="space-y-4">
          <div className="h-5 w-40 bg-muted rounded" />
          <div className="grid grid-cols-4 gap-4">
            {[0, 1, 2].map((j) => (
              <div key={j} className="h-48 rounded-xl bg-muted" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
