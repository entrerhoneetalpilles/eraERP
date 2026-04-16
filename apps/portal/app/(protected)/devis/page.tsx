import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getPendingDevisForOwner } from "@/lib/dal/travaux"
import Link from "next/link"
import { ClipboardList, Building2, Wrench } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n)

export default async function DevisPage() {
  const session = await auth()
  if (!session?.user?.ownerId) redirect("/login")

  const devis = await getPendingDevisForOwner(session.user.ownerId)

  return (
    <div className="space-y-5 max-w-3xl animate-fade-up">
      <div>
        <h1 className="font-serif text-4xl text-garrigue-900 font-light italic">Devis.</h1>
        <p className="text-sm text-garrigue-400 mt-1">
          {devis.length === 0
            ? "Aucun devis en attente de votre validation"
            : `${devis.length} devis en attente de votre validation`}
        </p>
      </div>

      {devis.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-garrigue-400">
          <ClipboardList size={40} />
          <p className="text-sm">Aucun devis à valider</p>
        </div>
      ) : (
        <div className="space-y-3">
          {devis.map((wo) => (
            <Link
              key={wo.id}
              href={`/devis/${wo.id}`}
              className="block bg-white rounded-2xl p-5 shadow-luxury-card border border-argile-200/40 hover:shadow-luxury transition-smooth cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg text-garrigue-900 font-light leading-tight">{wo.titre}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={12} className="text-garrigue-400 shrink-0" />
                    <p className="text-xs text-garrigue-400">{wo.property.nom}</p>
                  </div>
                </div>
                {wo.montant_devis !== null && (
                  <div className="shrink-0 text-right">
                    <p className="font-serif text-xl text-garrigue-900 font-light">{fmt(wo.montant_devis)}</p>
                    <p className="text-[10px] text-garrigue-400">montant HT</p>
                  </div>
                )}
              </div>
              {wo.contractor && (
                <div className="flex items-center gap-2 text-xs text-garrigue-400">
                  <Wrench size={11} className="shrink-0" />
                  <span>{wo.contractor.nom} — {wo.contractor.metier}</span>
                </div>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-argile-100">
                <p className="text-[10px] text-garrigue-300">
                  {format(wo.createdAt, "d MMM yyyy", { locale: fr })}
                </p>
                <span className="text-xs font-semibold text-or-600 bg-or-300/15 border border-or-300/40 px-3 py-1 rounded-full">
                  En attente de validation
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
