"use client"

import { useState, useEffect, useRef, useCallback, useTransition } from "react"
import Link from "next/link"
import {
  ArrowLeft, Save, RefreshCw, Palette, FileText, AlignLeft,
  Table2, Footprints, Type, ChevronDown, Check, Loader2, Eye, Code2,
  Star, Building2,
} from "lucide-react"
import type { TemplateConfig, PdfTemplateType } from "@/lib/pdf/template-types"
import { TYPE_LABELS, VARIABLES_BY_TYPE } from "@/lib/pdf/template-types"
import { saveTemplateAction } from "./actions"

interface Props {
  id: string
  nom: string
  type: PdfTemplateType
  initialConfig: TemplateConfig
}

// ─── Primitive controls ────────────────────────────────────────

function Toggle({ label, desc, value, onChange }: {
  label: string; desc?: string; value: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-checked={value}
        role="switch"
        className={`shrink-0 relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary ${value ? "bg-primary" : "bg-muted-foreground/30"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${value ? "translate-x-4" : ""}`} />
      </button>
    </div>
  )
}

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div
            className="w-7 h-7 rounded-md border-2 border-border shadow-sm cursor-pointer"
            style={{ backgroundColor: value }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value) }}
          className="w-24 h-7 rounded-md border border-input bg-background px-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm text-foreground font-medium">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-8 rounded-md border border-input bg-background px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
    />
  )
}

function TextArea({ value, onChange, placeholder, rows = 3, id, type, onRef }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
  id?: string; type: PdfTemplateType; onRef?: (el: HTMLTextAreaElement | null) => void
}) {
  const vars = VARIABLES_BY_TYPE[type]
  const [open, setOpen] = useState(false)
  const taRef = useRef<HTMLTextAreaElement | null>(null)

  function insertVar(v: string) {
    const el = taRef.current
    setOpen(false)
    if (!el) { onChange(value + v); return }
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + v + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + v.length, start + v.length)
    })
  }

  return (
    <div className="space-y-1.5">
      <div className="relative">
        <textarea
          id={id}
          ref={(el) => { taRef.current = el; onRef?.(el) }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none pr-28"
        />
        <div className="absolute top-1.5 right-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer border border-border/60"
            >
              <Code2 className="w-2.5 h-2.5" />
              Variable
              <ChevronDown className={`w-2.5 h-2.5 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                <div className="absolute right-0 top-6 z-20 w-52 bg-popover border border-border rounded-lg shadow-lg py-1 max-h-48 overflow-y-auto">
                  {vars.map((v) => (
                    <button
                      key={v.value}
                      type="button"
                      onClick={() => insertVar(v.value)}
                      className="w-full flex items-start gap-2 px-3 py-1.5 hover:bg-muted text-left cursor-pointer"
                    >
                      <span className="text-xs font-medium text-foreground truncate">{v.label}</span>
                      <span className="ml-auto text-[10px] text-muted-foreground font-mono shrink-0">{v.value}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Accordion Section ─────────────────────────────────────────

function Section({ title, icon: Icon, children, defaultOpen = false }: {
  title: string; icon: React.ElementType; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5 text-sm font-medium text-foreground">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {title}
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  )
}

function SectionDivider({ label }: { label: string }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground pt-2 pb-1">{label}</p>
}

// ─── Table Style Picker ────────────────────────────────────────

function TableStylePicker({ value, onChange }: { value: string; onChange: (v: "minimal" | "striped" | "bordered") => void }) {
  const options = [
    { value: "minimal" as const, label: "Minimal", desc: "Sans bordures" },
    { value: "striped" as const, label: "Rayé", desc: "Lignes alternées" },
    { value: "bordered" as const, label: "Bordé", desc: "Toutes bordures" },
  ]
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex flex-col items-center gap-1.5 p-2.5 rounded-lg border-2 text-center cursor-pointer transition-all ${
            value === o.value ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
          }`}
        >
          <TablePreviewIcon style={o.value} active={value === o.value} />
          <p className="text-[11px] font-medium text-foreground">{o.label}</p>
          <p className="text-[10px] text-muted-foreground">{o.desc}</p>
        </button>
      ))}
    </div>
  )
}

function TablePreviewIcon({ style, active }: { style: string; active: boolean }) {
  const color = active ? "fill-primary/20 stroke-primary" : "fill-muted stroke-muted-foreground/40"
  const rows = [0, 1, 2]
  return (
    <svg width="40" height="30" viewBox="0 0 40 30" className="block">
      <rect x="1" y="1" width="38" height="7" rx="1" className={`${active ? "fill-primary/80" : "fill-muted-foreground/30"}`} />
      {rows.map((i) => (
        <rect
          key={i}
          x="1" y={10 + i * 7} width="38" height="6" rx="0.5"
          className={style === "striped" && i % 2 === 0 ? (active ? "fill-primary/10" : "fill-muted/60") : "fill-transparent"}
          stroke={style === "bordered" ? (active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)") : "none"}
          strokeWidth={style === "bordered" ? "0.5" : "0"}
        />
      ))}
    </svg>
  )
}

// ─── Font Picker ───────────────────────────────────────────────

function FontPicker({ value, onChange }: { value: string; onChange: (v: "Helvetica" | "Times-Roman" | "Courier") => void }) {
  const options = [
    { value: "Helvetica" as const, label: "Helvetica", sample: "Aa" },
    { value: "Times-Roman" as const, label: "Times New Roman", sample: "Aa" },
    { value: "Courier" as const, label: "Courier", sample: "Aa" },
  ]
  const fontMap: Record<string, string> = {
    Helvetica: "font-sans",
    "Times-Roman": "font-serif",
    Courier: "font-mono",
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border-2 cursor-pointer transition-all ${
            value === o.value ? "border-primary bg-primary/5" : "border-border hover:border-border/80"
          }`}
        >
          <span className={`text-xl font-bold ${fontMap[o.value]}`}>{o.sample}</span>
          <span className="text-[10px] text-muted-foreground text-center leading-tight">{o.label}</span>
          {value === o.value && <Check className="w-3 h-3 text-primary" />}
        </button>
      ))}
    </div>
  )
}

// ─── Main Editor ───────────────────────────────────────────────

export function TemplateEditor({ id, nom: initialNom, type, initialConfig }: Props) {
  const [nom, setNom] = useState(initialNom)
  const [config, setConfig] = useState<TemplateConfig>(initialConfig)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [isPending, startTransition] = useTransition()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevBlobRef = useRef<string | null>(null)

  // ── Patchers ──────────────────────────────────────────────────
  function patch<K extends keyof TemplateConfig>(section: K, updates: Partial<TemplateConfig[K]>) {
    setConfig((prev) => ({ ...prev, [section]: { ...prev[section], ...updates } }))
  }

  // ── Live preview with debounce ─────────────────────────────
  const refreshPreview = useCallback(async (cfg: TemplateConfig) => {
    setPreviewLoading(true)
    try {
      const res = await fetch("/api/pdf/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: cfg, type }),
      })
      if (!res.ok) throw new Error("Preview failed")
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPreviewUrl((prev) => {
        if (prevBlobRef.current) URL.revokeObjectURL(prevBlobRef.current)
        prevBlobRef.current = url
        return url
      })
    } catch {
      // keep previous preview
    } finally {
      setPreviewLoading(false)
    }
  }, [type])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => refreshPreview(config), 1200)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [config, refreshPreview])

  // Initial preview
  useEffect(() => { refreshPreview(initialConfig) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Save ──────────────────────────────────────────────────────
  async function handleSave() {
    setSaveState("saving")
    const result = await saveTemplateAction(id, nom, config)
    if (result?.error) {
      setSaveState("error")
      setTimeout(() => setSaveState("idle"), 3000)
    } else {
      setSaveState("saved")
      setTimeout(() => setSaveState("idle"), 2000)
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] -mx-6 -mt-6">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-border bg-card/80 backdrop-blur shrink-0 z-10">
        <Link
          href="/modeles"
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-5 w-px bg-border" />

        <input
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          className="flex-1 max-w-xs h-8 px-2.5 rounded-md border border-transparent hover:border-border focus:border-input bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
        />

        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-muted-foreground">
          {TYPE_LABELS[type]}
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 768 && previewUrl) {
                window.open(previewUrl, "_blank", "noopener,noreferrer")
              } else {
                refreshPreview(config)
              }
            }}
            disabled={previewLoading && typeof window !== "undefined" && window.innerWidth >= 768}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${previewLoading ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">Aperçu</span>
            <span className="md:hidden">Ouvrir aperçu</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saveState === "saving" || isPending}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${
              saveState === "saved"
                ? "bg-emerald-500 text-white"
                : saveState === "error"
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            } disabled:opacity-60`}
          >
            {saveState === "saving" ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Enregistrement…</>
            ) : saveState === "saved" ? (
              <><Check className="w-3.5 h-3.5" /> Enregistré</>
            ) : saveState === "error" ? (
              "Erreur"
            ) : (
              <><Save className="w-3.5 h-3.5" /> Enregistrer</>
            )}
          </button>
        </div>
      </div>

      {/* ── Split pane ──────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* ─── LEFT PANEL: Editor ─────────────────────────── */}
        <div className="w-full md:w-[400px] shrink-0 md:border-r border-border overflow-y-auto bg-card">

          {/* ── Identité visuelle ── */}
          <Section title="Identité visuelle" icon={Palette} defaultOpen>
            <SectionDivider label="Couleurs" />
            <ColorInput label="Couleur principale" value={config.branding.primaryColor} onChange={(v) => patch("branding", { primaryColor: v })} />
            <ColorInput label="Couleur d'accent" value={config.branding.accentColor} onChange={(v) => patch("branding", { accentColor: v })} />

            <SectionDivider label="Typographie" />
            <FontPicker value={config.branding.fontFamily} onChange={(v) => patch("branding", { fontFamily: v })} />

            <SectionDivider label="Coordonnées société" />
            <Field label="Raison sociale">
              <TextInput value={config.branding.companyName} onChange={(v) => patch("branding", { companyName: v })} placeholder="Nom de votre société" />
            </Field>
            <Field label="Accroche">
              <TextInput value={config.branding.companyTagline} onChange={(v) => patch("branding", { companyTagline: v })} placeholder="Slogan ou activité" />
            </Field>
            <Field label="Adresse">
              <TextInput value={config.branding.companyAddress} onChange={(v) => patch("branding", { companyAddress: v })} placeholder="Ville, code postal" />
            </Field>
            <Field label="SIRET">
              <TextInput value={config.branding.companySiret} onChange={(v) => patch("branding", { companySiret: v })} placeholder="000 000 000 00000" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Téléphone">
                <TextInput value={config.branding.companyPhone} onChange={(v) => patch("branding", { companyPhone: v })} placeholder="+33 …" />
              </Field>
              <Field label="Email">
                <TextInput value={config.branding.companyEmail} onChange={(v) => patch("branding", { companyEmail: v })} placeholder="contact@…" />
              </Field>
            </div>
          </Section>

          {/* ── En-tête ── */}
          <Section title="En-tête du document" icon={Building2}>
            <Toggle label="Informations société" desc="Affiche la raison sociale et les coordonnées" value={config.header.showCompanyInfo} onChange={(v) => patch("header", { showCompanyInfo: v })} />
            <Toggle label="Référence du document" value={config.header.showDocumentRef} onChange={(v) => patch("header", { showDocumentRef: v })} />
            <Toggle label="Date d'émission" value={config.header.showDate} onChange={(v) => patch("header", { showDate: v })} />
            <Toggle label="Bloc destinataire" value={config.header.showRecipientBlock} onChange={(v) => patch("header", { showRecipientBlock: v })} />
            <Field label="Titre personnalisé (optionnel)">
              <TextInput
                value={config.header.titleOverride}
                onChange={(v) => patch("header", { titleOverride: v })}
                placeholder={`Laissez vide pour "${TYPE_LABELS[type].toUpperCase()}"`}
              />
            </Field>
          </Section>

          {/* ── Corps ── */}
          <Section title="Corps du document" icon={AlignLeft}>
            <Field label="Texte d'introduction">
              <TextArea
                value={config.body.introText}
                onChange={(v) => patch("body", { introText: v })}
                placeholder="Texte affiché avant le tableau des prestations…"
                type={type}
              />
            </Field>
            <Toggle label="Tableau des prestations" value={config.body.showLineItems} onChange={(v) => patch("body", { showLineItems: v })} />
            <Toggle label="Bloc totaux" value={config.body.showTotals} onChange={(v) => patch("body", { showTotals: v })} />
            <Toggle label="Notes et conditions" value={config.body.showNotes} onChange={(v) => patch("body", { showNotes: v })} />
            <Field label="Texte de conclusion">
              <TextArea
                value={config.body.outroText}
                onChange={(v) => patch("body", { outroText: v })}
                placeholder="Texte affiché après le tableau…"
                type={type}
              />
            </Field>
            <Toggle
              label="Bloc de signature"
              desc="Affiche une zone de signature en bas du document"
              value={config.body.showSignatureBlock}
              onChange={(v) => patch("body", { showSignatureBlock: v })}
            />
            {config.body.showSignatureBlock && (
              <Field label="Libellé signature">
                <TextInput value={config.body.signatureLabel} onChange={(v) => patch("body", { signatureLabel: v })} placeholder="Signature autorisée" />
              </Field>
            )}
          </Section>

          {/* ── Tableau ── */}
          <Section title="Tableau des lignes" icon={Table2}>
            <Field label="Style du tableau">
              <TableStylePicker value={config.table.style} onChange={(v) => patch("table", { style: v })} />
            </Field>
            <ColorInput label="Fond en-tête" value={config.table.headerBg} onChange={(v) => patch("table", { headerBg: v })} />
            <ColorInput label="Texte en-tête" value={config.table.headerTextColor} onChange={(v) => patch("table", { headerTextColor: v })} />
            <ColorInput label="Couleur des bordures" value={config.table.borderColor} onChange={(v) => patch("table", { borderColor: v })} />
            {config.table.style === "striped" && (
              <ColorInput label="Fond lignes alternées" value={config.table.stripeBg} onChange={(v) => patch("table", { stripeBg: v })} />
            )}
          </Section>

          {/* ── Pied de page ── */}
          <Section title="Pied de page" icon={Footprints}>
            <Toggle label="Numérotation des pages" value={config.footer.showPageNumbers} onChange={(v) => patch("footer", { showPageNumbers: v })} />
            <Field label="Mention légale">
              <TextInput value={config.footer.legalText} onChange={(v) => patch("footer", { legalText: v })} placeholder="TVA non applicable, art. 293 B CGI" />
            </Field>
            <Toggle
              label="Coordonnées bancaires"
              desc="Affiche votre IBAN en pied de page"
              value={config.footer.showBankInfo}
              onChange={(v) => patch("footer", { showBankInfo: v })}
            />
            {config.footer.showBankInfo && (
              <Field label="IBAN / RIB">
                <TextInput value={config.footer.bankInfo} onChange={(v) => patch("footer", { bankInfo: v })} placeholder="FR76 … | BIC : …" />
              </Field>
            )}
          </Section>
        </div>

        {/* ─── RIGHT PANEL: Preview (desktop only) ────────── */}
        <div className="hidden md:flex flex-1 min-w-0 bg-muted/20 flex-col">
          <div className="flex items-center justify-between px-5 h-10 border-b border-border/60 bg-card/50 shrink-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Eye className="w-3.5 h-3.5" />
              Aperçu du PDF — données d&apos;exemple
            </div>
            {previewLoading && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                Actualisation…
              </div>
            )}
          </div>

          <div className="flex-1 relative min-h-0 p-4">
            {previewUrl ? (
              <iframe
                key={previewUrl}
                src={previewUrl}
                className="w-full h-full rounded-lg shadow-luxury-card border border-border/50 bg-white"
                title="Aperçu du modèle PDF"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
                <FileText className="w-12 h-12 opacity-20" />
                <p className="text-sm">Chargement de l&apos;aperçu…</p>
              </div>
            )}
            {previewLoading && previewUrl && (
              <div className="absolute inset-4 rounded-lg bg-background/40 backdrop-blur-[1px] flex items-center justify-center">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-card/90 border border-border shadow text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mise à jour…
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
