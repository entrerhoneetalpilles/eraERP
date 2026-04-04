import Link from "next/link"
import { getOwners } from "@/lib/dal/owners"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { ProprietairesTable } from "./proprietaires-table"

export default async function ProprietairesPage() {
  const owners = await getOwners()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Propriétaires"
        description={`${owners.length} propriétaire${owners.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/proprietaires/new" className="cursor-pointer">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau propriétaire
            </Button>
          </Link>
        }
      />
      <ProprietairesTable data={owners} />
    </div>
  )
}
