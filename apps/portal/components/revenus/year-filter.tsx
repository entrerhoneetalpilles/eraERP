"use client"

import { useRouter } from "next/navigation"

export function YearFilter({ years, selected }: { years: number[]; selected: number }) {
  const router = useRouter()
  return (
    <select
      value={selected}
      onChange={(e) => router.push(`/revenus?annee=${e.target.value}`)}
      className="text-sm border border-border rounded-md px-3 py-1.5 bg-white text-garrigue-700"
      aria-label="Filtrer par année"
    >
      {years.map((y) => (
        <option key={y} value={y}>{y}</option>
      ))}
    </select>
  )
}
