import Link from "next/link"
import { getMandates } from "@/lib/dal/mandates"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { MandatsTable } from "./mandats-table"

export default async function MandatsPage() {
  const mandates = await getMandates()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mandats"
        description={`${mandates.length} mandat${mandates.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/mandats/new" className="cursor-pointer">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau mandat
            </Button>
          </Link>
        }
      />
      <MandatsTable data={mandates} />
    </div>
  )
}

