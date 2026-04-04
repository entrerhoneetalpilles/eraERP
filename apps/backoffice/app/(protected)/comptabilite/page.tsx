import { getMandantAccounts } from "@/lib/dal/comptes"
import { PageHeader } from "@/components/ui/page-header"
import { ComptesTable } from "./comptes-table"

export default async function ComptabilitePage() {
  const accounts = await getMandantAccounts()

  return (
    <div>
      <PageHeader
        title="Comptabilité mandant"
        description={`${accounts.length} compte${accounts.length !== 1 ? "s" : ""} mandant`}
      />
      <ComptesTable data={accounts} />
    </div>
  )
}
