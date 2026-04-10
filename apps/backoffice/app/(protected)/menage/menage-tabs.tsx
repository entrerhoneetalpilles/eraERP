"use client"

import { useState } from "react"
import { MenageTable } from "./menage-table"
import { MenageCalendar } from "./menage-calendar"
import type { getCleaningTasks } from "@/lib/dal/menage"

type Task = Awaited<ReturnType<typeof getCleaningTasks>>[number]
type Contractor = { id: string; nom: string }

export function MenageTabs({ tasks, contractors }: { tasks: Task[]; contractors: Contractor[] }) {
  const [view, setView] = useState<"list" | "calendar">("list")

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 bg-muted rounded-md p-1 w-fit">
        {(["list", "calendar"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-pressed={view === v}
            className={`px-4 py-1.5 text-sm rounded-sm transition-colors cursor-pointer ${
              view === v
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v === "list" ? "Liste" : "Calendrier"}
          </button>
        ))}
      </div>

      {view === "list" ? (
        <MenageTable data={tasks} contractors={contractors} />
      ) : (
        <MenageCalendar tasks={tasks} />
      )}
    </div>
  )
}
