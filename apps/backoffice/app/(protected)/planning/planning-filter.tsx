"use client"

export function PropertyFilter({ properties, defaultValue, year, month, view }: {
  properties: { id: string; nom: string }[]
  defaultValue: string
  year: number
  month: number
  view: string
}) {
  return (
    <select
      defaultValue={defaultValue}
      onChange={(e) => {
        const url = new URL(window.location.href)
        url.searchParams.set("property_id", e.target.value)
        url.searchParams.set("year", String(year))
        url.searchParams.set("month", String(month))
        url.searchParams.set("view", view)
        window.location.href = url.toString()
      }}
      className="text-sm border border-border rounded-md px-2 py-1.5 bg-background text-foreground"
    >
      <option value="">Tous les biens</option>
      {properties.map(p => (
        <option key={p.id} value={p.id}>{p.nom}</option>
      ))}
    </select>
  )
}
