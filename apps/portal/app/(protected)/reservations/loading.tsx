export default function Loading() {
  return (
    <div className="space-y-6 max-w-3xl animate-pulse">
      <div>
        <div className="h-10 w-48 bg-argile-200/60 rounded-xl mb-2" />
        <div className="h-4 w-32 bg-argile-200/40 rounded" />
      </div>
      <div className="h-4 w-28 bg-argile-200/40 rounded" />
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-argile-200/40 space-y-3">
          <div className="flex justify-between">
            <div className="space-y-1.5">
              <div className="h-5 w-36 bg-argile-200/60 rounded" />
              <div className="h-3 w-24 bg-argile-200/40 rounded" />
            </div>
            <div className="h-6 w-20 bg-argile-200/40 rounded-full" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(j => <div key={j} className="h-14 bg-argile-100/60 rounded-xl" />)}
          </div>
        </div>
      ))}
    </div>
  )
}
