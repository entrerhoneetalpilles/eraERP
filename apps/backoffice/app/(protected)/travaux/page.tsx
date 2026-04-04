import Link from "next/link"
import { getWorkOrders } from "@/lib/dal/travaux"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { TravauxTable } from "./travaux-table"

export default async function TravauxPage() {
  const workOrders = await getWorkOrders()

  return (
    <div>
      <PageHeader
        title="Travaux"
        description={`${workOrders.length} ordre${workOrders.length !== 1 ? "s" : ""} de service`}
        actions={
          <Link href="/travaux/new">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau travail
            </Button>
          </Link>
        }
      />
      <TravauxTable data={workOrders} />
    </div>
  )
}
