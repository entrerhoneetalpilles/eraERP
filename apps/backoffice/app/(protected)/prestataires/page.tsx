import Link from "next/link"
import { getPrestataires } from "@/lib/dal/prestataires"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { PrestatairesTable } from "./prestataires-table"

export default async function PrestatairesPage() {
  const prestataires = await getPrestataires()

  return (
    <div>
      <PageHeader
        title="Prestataires"
        description={`${prestataires.length} prestataire${prestataires.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/prestataires/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau prestataire
            </Button>
          </Link>
        }
      />
      <PrestatairesTable data={prestataires} />
    </div>
  )
}
