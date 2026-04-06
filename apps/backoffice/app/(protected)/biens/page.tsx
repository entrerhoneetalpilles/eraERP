import Link from "next/link"
import { getProperties } from "@/lib/dal/properties"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@conciergerie/ui"
import { Plus } from "lucide-react"
import { BiensTable } from "./biens-table"

export default async function BiensPage() {
  const properties = await getProperties()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biens"
        description={`${properties.length} bien${properties.length !== 1 ? "s" : ""}`}
        actions={
          <Link href="/biens/new" className="cursor-pointer">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau bien
            </Button>
          </Link>
        }
      />
      <BiensTable data={properties} />
    </div>
  )
}

