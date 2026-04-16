import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getWorkOrderForOwner } from "@/lib/dal/travaux"
import { validateDevisAction, refuseDevisAction } from "../actions"
import { Building2, Wrench, Phone, CheckCircle2, XCircle } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n)

export default async function DevisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const { id } = await params
  const wo = await getWorkOrderForOwner(session.user.ownerId, id)

  if (!wo) redirect("/devis")
  if (wo.statut !== "EN_ATTENTE_VALIDATION") redirect("/devis")

  const id_ = wo.id
  async function validateWithId() {
    "use server"
    await validateDevisAction(id_)
  }
  async function refuseWithId() {
    "use server"
    await refuseDevisAction(id_)
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <div>
        <a href="/devis" className="text-xs text-garrigue-400 hover:text-garrigue-900 transition-fast mb-4 inline-block">
          ← Retour aux devis
        </a>
        <h1 className="font-serif text-3xl text-garrigue-900 font-light italic leading-tight">
          {wo.titre}
        </h1>
        <p className="text-sm text-garrigue-400 mt-1">
          {format(wo.createdAt, "d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {/* Property */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">Bien concerné</h2>
        <div className="flex items-start gap-3">
          <Building2 size={16} className="text-garrigue-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-garrigue-900">{wo.property.nom}</p>
          </div>
        </div>
      </section>

      {/* Work description */}
      <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
        <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">Description des travaux</h2>
        <p className="text-sm text-garrigue-700 leading-relaxed">{wo.description}</p>
        {wo.notes_devis && (
          <div className="mt-4 pt-4 border-t border-argile-100">
            <p className="text-[10px] font-semibold text-garrigue-400 uppercase tracking-wide mb-2">Notes prestataire</p>
            <p className="text-sm text-garrigue-600">{wo.notes_devis}</p>
          </div>
        )}
      </section>

      {/* Contractor */}
      {wo.contractor && (
        <section className="bg-white rounded-2xl shadow-luxury-card border border-argile-200/40 p-5">
          <h2 className="text-[11px] font-semibold text-garrigue-400 uppercase tracking-[0.12em] mb-4">Prestataire</h2>
          <div className="flex items-center gap-3">
            <Wrench size={16} className="text-garrigue-400 shrink-0" />
            <div>
              <p className="text-sm font-medium text-garrigue-900">{wo.contractor.nom}</p>
              <p className="text-xs text-garrigue-400">{wo.contractor.metier}</p>
            </div>
            {wo.contractor.telephone && (
              <a
                href={`tel:${wo.contractor.telephone}`}
                className="ml-auto flex items-center gap-1.5 text-xs text-garrigue-500 hover:text-garrigue-900 transition-fast"
              >
                <Phone size={12} />
                {wo.contractor.telephone}
              </a>
            )}
          </div>
        </section>
      )}

      {/* Amount */}
      {wo.montant_devis !== null && (
        <section className="bg-garrigue-900 rounded-2xl p-5 shadow-luxury">
          <p className="text-xs text-garrigue-400 mb-2 uppercase tracking-wide">Montant du devis</p>
          <p className="font-serif text-3xl text-white font-light">{fmt(wo.montant_devis)}</p>
          <p className="text-xs text-garrigue-400 mt-2">
            Ce montant sera imputé sur votre compte mandant si vous validez.
          </p>
        </section>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form action={validateWithId} className="flex-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-olivier-700 hover:bg-olivier-800 text-white rounded-xl px-5 py-3.5 text-sm font-medium transition-smooth cursor-pointer"
          >
            <CheckCircle2 size={16} strokeWidth={2} />
            Valider le devis
          </button>
        </form>
        <form action={refuseWithId} className="flex-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-5 py-3.5 text-sm font-medium transition-smooth cursor-pointer"
          >
            <XCircle size={16} strokeWidth={2} />
            Refuser le devis
          </button>
        </form>
      </div>
    </div>
  )
}
