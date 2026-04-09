import { notFound } from "next/navigation"
import Link from "next/link"
import { getWorkOrderWithMandate } from "@/lib/dal/travaux"
import { DevisForm } from "./devis-form"
import { PageHeader } from "@/components/ui/page-header"
import { StatusBadge } from "@/components/ui/status-badge"
import { updateWorkOrderStatutAction } from "./actions"
import { AlertTriangle, Calendar, Euro, Building2, User, Wrench, TrendingUp, TrendingDown, Image as ImageIcon, Upload } from "lucide-react"

const NEXT_STATUTS: Record<string, Array<{ label: string; value: string; variant?: string }>> = {
  OUVERT: [
    { label: "Démarrer", value: "EN_COURS" },
    { label: "Demander devis", value: "EN_ATTENTE_DEVIS" },
    { label: "Annuler", value: "ANNULE" },
  ],
  EN_COURS: [
    { label: "Terminer", value: "TERMINE" },
    { label: "Mettre en attente", value: "EN_ATTENTE_VALIDATION" },
  ],
  EN_ATTENTE_DEVIS: [
    { label: "Valider le devis", value: "VALIDE" },
    { label: "Annuler", value: "ANNULE" },
  ],
  EN_ATTENTE_VALIDATION: [
    { label: "Valider", value: "VALIDE" },
    { label: "Refuser", value: "ANNULE" },
  ],
  VALIDE: [{ label: "Démarrer les travaux", value: "EN_COURS" }],
  TERMINE: [],
  ANNULE: [],
}

const URGENCE_STYLES: Record<string, string> = {
  CRITIQUE: "text-red-700 bg-red-50 border-red-200 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800",
  URGENTE: "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:text-amber-400 dark:border-amber-800",
  NORMALE: "text-foreground bg-card border-border",
}

function BudgetBar({ devis, facture }: { devis: number | null; facture: number | null }) {
  if (!devis && !facture) return null
  const ref = devis ?? facture ?? 0
  const actual = facture
  const pct = actual != null && ref > 0 ? Math.min(150, Math.round((actual / ref) * 100)) : null
  const over = pct != null && pct > 100
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Dévis / Facture</span>
        <span className="font-mono font-semibold">
          {devis != null ? devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" }) : "—"}
          {facture != null && <span className={`ml-2 ${over ? "text-red-600" : "text-emerald-600"}`}> → {facture.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>}
        </span>
      </div>
      {pct != null && (
        <div className="w-full bg-muted rounded-full h-2">
          <div className={`h-2 rounded-full transition-all ${over ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      )}
      {over && (
        <p className="text-xs text-red-600 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Dépassement : +{(((facture ?? 0) - (devis ?? 0)) / (devis ?? 1) * 100).toFixed(0)}%</p>
      )}
      {pct != null && !over && facture != null && (
        <p className="text-xs text-emerald-600 flex items-center gap-1"><TrendingDown className="w-3 h-3" />Dans le budget ({pct}% utilisé)</p>
      )}
    </div>
  )
}

export default async function WorkOrderDetailPage({ params }: { params: { id: string } }) {
  const wo = await getWorkOrderWithMandate(params.id)
  if (!wo) notFound()

  const actions = NEXT_STATUTS[wo.statut] ?? []
  const urgenceStyle = URGENCE_STYLES[wo.urgence] ?? URGENCE_STYLES.NORMALE
  const photos = (wo as any).photos as string[] ?? []
  const montantFacture = (wo as any).montant_facture as number | null
  const dateDebutPrevue = (wo as any).date_debut_prevue as Date | null
  const dateFinPrevue = (wo as any).date_fin_prevue as Date | null

  return (
    <div className="space-y-5 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-foreground">{wo.titre}</h1>
            <StatusBadge status={wo.statut} />
            <StatusBadge status={wo.urgence} />
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{wo.property.nom} · Créé le {new Date(wo.createdAt).toLocaleDateString("fr-FR")}</p>
        </div>
        <div className="flex items-center gap-2">
          {actions.map(action => (
            <form key={action.value} action={updateWorkOrderStatutAction.bind(null, wo.id, action.value as any)}>
              <button type="submit" className="px-3 py-1.5 text-sm rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer">
                {action.label}
              </button>
            </form>
          ))}
        </div>
      </div>

      {/* Urgence alert */}
      {wo.urgence === "CRITIQUE" && wo.statut !== "TERMINE" && wo.statut !== "ANNULE" && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium ${urgenceStyle}`}>
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Ordre de travaux CRITIQUE — intervention requise immédiatement
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Details */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Informations</p>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />Bien</span>
                <Link href={`/biens/${wo.property.id}`} className="font-medium text-primary hover:underline cursor-pointer">{wo.property.nom}</Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5"><Wrench className="w-3.5 h-3.5" />Type</span>
                <span className="font-medium text-foreground">{wo.type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Imputable à</span>
                <span className={`font-medium text-xs px-2 py-0.5 rounded-full ${wo.imputable_a === "PROPRIETAIRE" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"}`}>
                  {wo.imputable_a === "PROPRIETAIRE" ? "Propriétaire" : "Société"}
                </span>
              </div>
              {wo.contractor && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Prestataire</span>
                  <Link href={`/prestataires/${wo.contractor.id}`} className="font-medium text-primary hover:underline cursor-pointer">{wo.contractor.nom}</Link>
                </div>
              )}
              {dateDebutPrevue && (
                <div className="flex items-center justify-between border-t border-border pt-2">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Début prévu</span>
                  <span className="font-medium">{new Date(dateDebutPrevue).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
              {dateFinPrevue && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Fin prévue</span>
                  <span className="font-medium">{new Date(dateFinPrevue).toLocaleDateString("fr-FR")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Budget */}
          {(wo.montant_devis != null || montantFacture != null) && (
            <div className="bg-card rounded-lg border border-border p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><Euro className="w-3.5 h-3.5" />Budget</p>
              <BudgetBar devis={wo.montant_devis ?? null} facture={montantFacture} />
            </div>
          )}
        </div>

        {/* Center + Right: Description + notes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Description</p>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{wo.description}</p>
            {wo.notes && (
              <>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mt-4 mb-2 pt-4 border-t border-border">Notes internes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{wo.notes}</p>
              </>
            )}
          </div>

          {/* Photos */}
          <div className="bg-card rounded-lg border border-border p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />Photos ({photos.length})</p>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block aspect-square rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity cursor-pointer">
                    <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
            {/* Upload photos */}
            <form
              action={`/api/upload/travaux/${wo.id}`}
              method="POST"
              encType="multipart/form-data"
              className="mt-3"
            >
              <label className="flex items-center gap-2 px-3 py-2 text-sm border border-dashed border-border rounded-md cursor-pointer hover:bg-accent/50 transition-colors w-fit">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Ajouter une photo</span>
                <input
                  type="file"
                  name="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => e.target.form?.submit()}
                />
              </label>
            </form>
          </div>
        </div>
      </div>

      {/* Devis section */}
      {wo.statut === "EN_ATTENTE_DEVIS" && (
        <DevisForm workOrderId={wo.id} montantDevisActuel={wo.montant_devis ?? null} notesDevisActuel={wo.notes_devis ?? null} seuil={wo.property.mandate?.seuil_validation_devis ?? 500} />
      )}
      {wo.montant_devis != null && wo.statut !== "EN_ATTENTE_DEVIS" && (
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Devis accepté</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Montant HT</span>
            <span className="font-semibold text-lg">{wo.montant_devis.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}</span>
          </div>
          {wo.notes_devis && <p className="text-sm text-muted-foreground mt-2 pt-2 border-t border-border">{wo.notes_devis}</p>}
        </div>
      )}
    </div>
  )
}
