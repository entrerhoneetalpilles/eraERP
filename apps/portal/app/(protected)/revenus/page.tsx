import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerReports } from "@/lib/dal/revenus"
import { RevenusTable } from "@/components/revenus/revenus-table"
import { RevenusChart } from "@/components/revenus/revenus-chart"
import { YearFilter } from "@/components/revenus/year-filter"

export default async function RevenusPage({
  searchParams,
}: {
  searchParams: Promise<{ annee?: string }>
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const { annee } = await searchParams
  const currentYear = new Date().getFullYear()
  const selectedYear = annee ? Number(annee) : currentYear
  const years = [currentYear, currentYear - 1, currentYear - 2]

  const reports = await getOwnerReports(session.user.ownerId, selectedYear)

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-start justify-between gap-4">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Vos revenus.</h1>
          <p className="text-sm text-garrigue-400 mt-1">Comptes-rendus de gestion</p>
        </div>
        <YearFilter years={years} selected={selectedYear} />
      </div>
      <RevenusChart reports={reports} />
      <RevenusTable reports={reports} year={selectedYear} />
    </div>
  )
}
