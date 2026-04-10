import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerReports } from "@/lib/dal/revenus"
import { RevenusTable } from "@/components/revenus/revenus-table"
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
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl text-garrigue-900">Vos revenus</h1>
        <YearFilter years={years} selected={selectedYear} />
      </div>
      <RevenusTable reports={reports} />
    </div>
  )
}
