import Link from "next/link"
import { db } from "@conciergerie/db"
import { getPropertyInventories, getInventoryStats } from "@/lib/dal/inventaires"
import { PageHeader } from "@/components/ui/page-header"
import { InventoryForm } from "./inventory-form"
import { ClipboardCheck, CheckCircle2, Clock, FileSearch } from "lucide-react"

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
}

const TYPE_COLORS: Record<string, string> = {
  ENTREE: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400",
  SORTIE: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400",
}

export default async function EtatsDesLieuxPage() {
  const [inventories, stats, properties, bookings] = await Promise.all([
    getPropertyInventories(),
    getInventoryStats(),
    db.property.findMany({ where: { statut: "ACTIF" }, select: { id: true, nom: true }, orderBy: { nom: "asc" } }),
    db.booking.findMany({
      where: { statut: { in: ["CONFIRMED", "CHECKEDIN", "CHECKEDOUT"] } },
      select: {
        id: true,
        property_id: true,
        check_in: true,
        check_out: true,
        guest: { select: { prenom: true, nom: true } },
      },
      orderBy: { check_in: "desc" },
      take: 100,
    }),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="États des lieux"
        description="Inventaires d'entrée et de sortie par bien"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <FileSearch className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{stats.total}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Signés des deux parties</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.signedBoth}</p>
        </div>
        <div className={`rounded-lg border p-4 ${stats.pendingSignature > 0 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-card border-border"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className={`w-3.5 h-3.5 ${stats.pendingSignature > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
            <p className="text-xs text-muted-foreground">En attente de signature</p>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${stats.pendingSignature > 0 ? "text-amber-600" : "text-foreground"}`}>{stats.pendingSignature}</p>
        </div>
      </div>

      <InventoryForm properties={properties} bookings={bookings} />

      {/* List */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">États des lieux</p>
          <span className="text-xs text-muted-foreground">{inventories.length} document{inventories.length !== 1 ? "s" : ""}</span>
        </div>
        {inventories.length === 0 ? (
          <div className="text-center py-16">
            <ClipboardCheck className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Aucun état des lieux</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {inventories.map(inv => {
              const bothSigned = inv.signe_voyageur && inv.signe_agent
              return (
                <Link key={inv.id} href={`/etats-des-lieux/${inv.id}`} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/50 transition-colors cursor-pointer">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-foreground">
                        {inv.property.nom}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[inv.type] ?? ""}`}>
                        {inv.type === "ENTREE" ? "Entrée" : "Sortie"}
                      </span>
                      {bothSigned ? (
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 px-1.5 py-0.5 rounded-full">
                          Signé
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 px-1.5 py-0.5 rounded-full">
                          {inv.signe_agent && !inv.signe_voyageur ? "En attente voyageur" : inv.signe_voyageur && !inv.signe_agent ? "En attente agent" : "Non signé"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {fmtDate(inv.date)} · {inv.realise_par}
                      {inv.booking && ` · ${inv.booking.guest.prenom} ${inv.booking.guest.nom}`}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                    <span className={`flex items-center gap-1 ${inv.signe_agent ? "text-emerald-600" : ""}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />Agent
                    </span>
                    <span className={`flex items-center gap-1 ${inv.signe_voyageur ? "text-emerald-600" : ""}`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />Voyageur
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
