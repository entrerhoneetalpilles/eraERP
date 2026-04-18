import { notFound } from "next/navigation"
import Link from "next/link"
import { getInventoryById } from "@/lib/dal/inventaires"
import { PageHeader } from "@/components/ui/page-header"
import { PiecesEditor } from "./pieces-editor"
import { ArrowLeft, CheckCircle2, Clock, User } from "lucide-react"

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
}

const TYPE_COLORS: Record<string, string> = {
  ENTREE: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  SORTIE: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400",
}

export default async function InventoryDetailPage({ params }: { params: { id: string } }) {
  const inv = await getInventoryById(params.id)
  if (!inv) notFound()

  const bothSigned = inv.signe_voyageur && inv.signe_agent
  const readOnly = bothSigned

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/etats-des-lieux" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm">
          <ArrowLeft className="w-4 h-4" />États des lieux
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-base font-semibold text-foreground">
          {inv.property.nom} — {inv.type === "ENTREE" ? "Entrée" : "Sortie"}
        </h1>
      </div>

      {/* Infos */}
      <div className="bg-card rounded-lg border border-border p-5 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${TYPE_COLORS[inv.type] ?? ""}`}>
            {inv.type === "ENTREE" ? "État des lieux d'entrée" : "État des lieux de sortie"}
          </span>
          {bothSigned ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />Signé des deux parties
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 px-2 py-0.5 rounded-full">
              <Clock className="w-3.5 h-3.5" />Signature en attente
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Bien</p>
            <Link href={`/biens/${inv.property.id}`} className="font-medium text-foreground hover:text-primary">
              {inv.property.nom}
            </Link>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Date</p>
            <p className="font-medium text-foreground">{fmtDate(inv.date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Réalisé par</p>
            <p className="font-medium text-foreground">{inv.realise_par}</p>
          </div>
          {inv.booking && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Voyageur</p>
              <Link href={`/reservations/${inv.booking.id}`} className="font-medium text-foreground hover:text-primary">
                {inv.booking.guest.prenom} {inv.booking.guest.nom}
              </Link>
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">Signatures :</p>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-xs font-medium ${inv.signe_agent ? "text-emerald-600" : "text-muted-foreground"}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${inv.signe_agent ? "text-emerald-500" : "text-muted-foreground/40"}`} />
              <User className="w-3 h-3" />Agent
            </span>
            <span className={`flex items-center gap-1.5 text-xs font-medium ${inv.signe_voyageur ? "text-emerald-600" : "text-muted-foreground"}`}>
              <CheckCircle2 className={`w-3.5 h-3.5 ${inv.signe_voyageur ? "text-emerald-500" : "text-muted-foreground/40"}`} />
              <User className="w-3 h-3" />Voyageur
            </span>
          </div>
        </div>
      </div>

      {/* Éditeur pièce par pièce */}
      <div className="bg-card rounded-lg border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">
            Pièces ({Array.isArray(inv.pieces) ? inv.pieces.length : 0})
          </h2>
          {readOnly && (
            <span className="text-xs text-muted-foreground">
              Document finalisé — modification désactivée
            </span>
          )}
        </div>
        <PiecesEditor
          inventoryId={inv.id}
          initialPieces={Array.isArray(inv.pieces) ? inv.pieces : []}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
