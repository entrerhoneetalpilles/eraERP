import Link from "next/link"
import { getManagementReports } from "@/lib/dal/crg"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { CrgTable } from "./crg-table"

export default async function CrgPage() {
  const reports = await getManagementReports()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comptes rendus de gestion"
        description={`${reports.length} CRG généré${reports.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/crg/new">
            <Button size="sm" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Générer un CRG
            </Button>
          </Link>
        }
      />
      <CrgTable data={reports} />
    </div>
  )
}
