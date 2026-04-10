"use client"

import { useRouter } from "next/navigation"

export function YearFilter({ years, selected }: { years: number[]; selected: number }) {
  const router = useRouter()

  return (
    <div className="flex gap-1 bg-calcaire-200 rounded-xl p-1 w-fit">
      {years.map((y) => (
        <button
          key={y}
          onClick={() => router.push(`/revenus?annee=${y}`)}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-fast cursor-pointer ${
            y === selected
              ? "bg-white shadow-luxury text-garrigue-900"
              : "text-garrigue-400 hover:text-garrigue-700"
          }`}
        >
          {y}
        </button>
      ))}
    </div>
  )
}
