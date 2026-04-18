"use client"

import { useTransition } from "react"
import Link from "next/link"
import { CheckCircle2, XCircle, Clock, Loader2, ShoppingBag } from "lucide-react"
import { updateStatutAction } from "./actions"

type Order = {
  id: string
  statut: string
  quantite: number
  montant_total: number
  createdAt: Date
  date_realisation: Date | null
  notes: string | null
  property: { id: string; nom: string }
  booking: { id: string; check_in: Date; check_out: Date } | null
  guest: { id: string; prenom: string; nom: string } | null
  service: { id: string; nom: string; categorie: string; unite: string; tarif: number }
}

const STATUT_LABELS: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  COMPLETED: "Réalisée",
  CANCELLED: "Annulée",
}
const STATUT_COLORS: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
  CANCELLED: "bg-muted text-muted-foreground border-border",
}

function fmt(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })
}
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function CommandesList({ orders }: { orders: Order[] }) {
  const [pending, startTransition] = useTransition()

  function update(id: string, statut: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED") {
    startTransition(() => { void updateStatutAction(id, statut) })
  }

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border">
        <div className="text-center py-16">
          <ShoppingBag className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Aucune commande de service</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="divide-y divide-border">
        {orders.map(order => (
          <div key={order.id} className="px-5 py-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-foreground">{order.service.nom}</span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUT_COLORS[order.statut] ?? ""}`}>
                    {STATUT_LABELS[order.statut] ?? order.statut}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{order.service.categorie}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                  <Link href={`/biens/${order.property.id}`} className="hover:text-foreground">{order.property.nom}</Link>
                  {order.guest && (
                    <Link href={`/voyageurs/${order.guest.id}`} className="hover:text-foreground">
                      {order.guest.prenom} {order.guest.nom}
                    </Link>
                  )}
                  {order.booking && (
                    <span>{fmtDate(order.booking.check_in)} → {fmtDate(order.booking.check_out)}</span>
                  )}
                  <span className="font-medium text-foreground">
                    {order.quantite} × {fmt(order.service.tarif)} = {fmt(order.montant_total)}
                  </span>
                </div>
                {order.notes && (
                  <p className="text-xs text-muted-foreground mt-1 italic">{order.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {order.statut === "PENDING" && (
                  <>
                    <button
                      onClick={() => update(order.id, "CONFIRMED")}
                      disabled={pending}
                      title="Confirmer"
                      className="p-1.5 rounded-md text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Clock className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => update(order.id, "CANCELLED")}
                      disabled={pending}
                      title="Annuler"
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </>
                )}
                {order.statut === "CONFIRMED" && (
                  <button
                    onClick={() => update(order.id, "COMPLETED")}
                    disabled={pending}
                    title="Marquer réalisée"
                    className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Commandée le {fmtDate(order.createdAt)}
              {order.date_realisation && ` · Réalisée le ${fmtDate(order.date_realisation)}`}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
