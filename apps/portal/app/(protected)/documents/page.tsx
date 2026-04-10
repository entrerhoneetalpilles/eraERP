import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getOwnerDocuments } from "@/lib/dal/documents"
import { DocumentCard } from "@/components/documents/document-card"
import { FileText } from "lucide-react"
import type { DocumentType } from "@conciergerie/db"

const FILTER_TYPES = [
  "MANDAT",
  "AVENANT",
  "FACTURE",
  "CRG",
  "ATTESTATION_FISCALE",
  "DIAGNOSTIC",
  "AUTRE",
] as const

const TYPE_LABELS: Record<string, string> = {
  MANDAT: "Mandat",
  AVENANT: "Avenant",
  FACTURE: "Facture",
  CRG: "CRG",
  ATTESTATION_FISCALE: "Fiscal",
  DIAGNOSTIC: "Diagnostic",
  AUTRE: "Autre",
}

export default async function DocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const { type } = await searchParams
  const activeType = type ?? undefined
  const documents = await getOwnerDocuments(
    session.user.ownerId,
    activeType as DocumentType | undefined
  )

  return (
    <div className="space-y-5 max-w-2xl">
      <h1 className="font-serif text-2xl text-garrigue-900">Documents</h1>

      <div className="flex gap-2 flex-wrap">
        <a
          href="/documents"
          className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !activeType
              ? "bg-olivier-600 text-white border-olivier-600"
              : "bg-white text-garrigue-500 border-border hover:border-olivier-400"
          }`}
        >
          Tous
        </a>
        {FILTER_TYPES.map((t) => (
          <a
            key={t}
            href={`/documents?type=${t}`}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeType === t
                ? "bg-olivier-600 text-white border-olivier-600"
                : "bg-white text-garrigue-500 border-border hover:border-olivier-400"
            }`}
          >
            {TYPE_LABELS[t]}
          </a>
        ))}
      </div>

      {documents.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <FileText size={40} />
          <p className="text-sm">Aucun document</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((d) => (
            <DocumentCard
              key={d.id}
              id={d.id}
              nom={d.nom}
              type={d.type}
              createdAt={d.createdAt}
              date_expiration={d.date_expiration}
            />
          ))}
        </div>
      )}
    </div>
  )
}
