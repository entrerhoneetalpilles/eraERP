import { PageHeader } from "@/components/ui/page-header"
import { getDocuments, getDocumentCounts } from "@/lib/dal/documents"
import { DocumentsBrowser } from "./documents-browser"

export default async function DocumentsPage() {
  const [docs, counts] = await Promise.all([
    getDocuments(),
    getDocumentCounts(),
  ])

  return (
    <div className="space-y-4 h-[calc(100vh-4rem)]">
      <PageHeader
        title="Documents"
        description={`${counts.total} document${counts.total !== 1 ? "s" : ""}`}
      />
      <DocumentsBrowser initialDocs={docs} counts={counts} />
    </div>
  )
}
