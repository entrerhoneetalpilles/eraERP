import Link from "next/link"
import { getFeeInvoices } from "@/lib/dal/facturation"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { FacturationTable } from "./facturation-table"

export default async function FacturationPage() {
  const invoices = await getFeeInvoices()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Facturation honoraires"
        description={`${invoices.length} facture${invoices.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/facturation/new">
            <Button size="sm" className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle facture
            </Button>
          </Link>
        }
      />
      <FacturationTable data={invoices} />
    </div>
  )
}
