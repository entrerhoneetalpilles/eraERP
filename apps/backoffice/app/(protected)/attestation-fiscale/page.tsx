import { getAttestationOverview } from "@/lib/dal/attestations"
import { PageHeader } from "@/components/ui/page-header"
import { AttestationRow } from "./attestation-row"
import { FileCheck2, AlertCircle, CheckCircle2, Users } from "lucide-react"

export default async function AttestationFiscalePage({
  searchParams,
}: {
  searchParams: { annee?: string }
}) {
  const currentYear = new Date().getFullYear()
  const annee = parseInt(searchParams.annee ?? String(currentYear - 1), 10)

  const rows = await getAttestationOverview(annee)

  const nbGenerated = rows.filter(r => r.attestationGenerated).length
  const nbAGenerer = rows.filter(r => r.hasData && !r.attestationGenerated).length
  const nbSansData = rows.filter(r => !r.hasData).length

  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attestations fiscales"
        description="Génération et envoi des attestations annuelles aux propriétaires"
      />

      {/* Sélecteur d'année */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Année fiscale :</span>
        <div className="flex gap-1.5">
          {years.map(y => (
            <a
              key={y}
              href={`?annee=${y}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                y === annee
                  ? "bg-primary text-primary-foreground"
                  : "border border-border hover:bg-accent text-foreground"
              }`}
            >
              {y}
            </a>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Propriétaires</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-foreground">{rows.length}</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Générées</p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{nbGenerated}</p>
        </div>
        <div className={`rounded-lg border p-4 ${nbAGenerer > 0 ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800" : "bg-card border-border"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <AlertCircle className={`w-3.5 h-3.5 ${nbAGenerer > 0 ? "text-amber-600" : "text-muted-foreground"}`} />
            <p className="text-xs text-muted-foreground">À générer</p>
          </div>
          <p className={`text-2xl font-bold tabular-nums ${nbAGenerer > 0 ? "text-amber-600" : "text-foreground"}`}>{nbAGenerer}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Attestations {annee}
            </p>
          </div>
          {nbSansData > 0 && (
            <span className="text-xs text-muted-foreground">{nbSansData} sans CRG cette année</span>
          )}
        </div>
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">Aucun propriétaire</p>
        ) : (
          <div className="divide-y divide-border">
            {rows.map(row => (
              <AttestationRow key={row.id} row={row} annee={annee} />
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        L&apos;attestation fiscale est générée automatiquement chaque année (1er février) pour tous les propriétaires ayant des CRG dans l&apos;année. Vous pouvez déclencher la génération manuellement ici.
      </p>
    </div>
  )
}
