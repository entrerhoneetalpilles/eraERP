import { getServiceCatalog } from "@/lib/dal/catalogue"
import { PageHeader } from "@/components/ui/page-header"
import { CatalogueTable } from "./catalogue-table"

export default async function CataloguePage() {
  const services = await getServiceCatalog()
  const activeCount = services.filter(s => s.actif).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catalogue de services"
        description={`${activeCount} service${activeCount !== 1 ? "s" : ""} actif${activeCount !== 1 ? "s" : ""} · ${services.length} total`}
      />
      <CatalogueTable services={services as any} />
    </div>
  )
}
