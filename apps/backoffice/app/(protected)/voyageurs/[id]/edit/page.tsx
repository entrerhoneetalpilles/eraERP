import { notFound, redirect } from "next/navigation"
import { getGuestById } from "@/lib/dal/guests"
import { PageHeader } from "@/components/ui/page-header"
import { Button, Input, Label } from "@conciergerie/ui"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { updateGuestAction } from "../actions"

const ALL_TAGS = [
  { value: "VIP", label: "VIP" },
  { value: "REGULIER", label: "Régulier" },
  { value: "BLACKLIST", label: "Blacklist" },
  { value: "AVEC_ANIMAL", label: "Avec animal" },
  { value: "FAMILLE", label: "Famille" },
  { value: "SANS_CONTACT", label: "Sans contact" },
]

const LANGUES = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" },
  { value: "nl", label: "Nederlands" },
  { value: "pt", label: "Português" },
  { value: "ru", label: "Русский" },
  { value: "zh", label: "中文" },
  { value: "ar", label: "العربية" },
]

export default async function EditGuestPage({ params }: { params: { id: string } }) {
  const guest = await getGuestById(params.id)
  if (!guest) notFound()

  const tags = (guest as any).tags as string[] ?? []

  async function handleSubmit(formData: FormData) {
    "use server"
    const res = await updateGuestAction(params.id, formData)
    if (res.success) redirect(`/voyageurs/${params.id}`)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`Modifier — ${guest.prenom} ${guest.nom}`}
        actions={
          <Link href={`/voyageurs/${guest.id}`}>
            <Button variant="ghost" size="sm" className="cursor-pointer gap-1.5"><ArrowLeft className="w-4 h-4" />Retour</Button>
          </Link>
        }
      />
      <form action={handleSubmit} className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="px-6 py-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Identité</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prenom">Prénom</Label>
              <Input id="prenom" name="prenom" defaultValue={guest.prenom} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nom">Nom</Label>
              <Input id="nom" name="nom" defaultValue={guest.nom} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={guest.email ?? ""} className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input id="telephone" name="telephone" defaultValue={guest.telephone ?? ""} className="h-9" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nationalite">Nationalité</Label>
              <Input id="nationalite" name="nationalite" defaultValue={(guest as any).nationalite ?? ""} placeholder="Française, Espagnole..." className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="langue">Langue préférée</Label>
              <select id="langue" name="langue" defaultValue={guest.langue} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer">
                {LANGUES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Tags internes</h2>
          <div className="flex flex-wrap gap-2">
            {ALL_TAGS.map(t => (
              <label key={t.value} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" name="tags" value={t.value} defaultChecked={tags.includes(t.value)} className="rounded" />
                <span className="text-sm text-foreground">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 border-t border-border space-y-4">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">Évaluation & Notes internes</h2>
          <div className="space-y-1.5">
            <Label htmlFor="note_interne">Note interne (1–5)</Label>
            <select id="note_interne" name="note_interne" defaultValue={(guest as any).note_interne?.toString() ?? ""} className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer">
              <option value="">— Sans note —</option>
              <option value="1">1 — Mauvais</option>
              <option value="2">2 — Passable</option>
              <option value="3">3 — Correct</option>
              <option value="4">4 — Bien</option>
              <option value="5">5 — Excellent</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes_internes">Notes internes (non visibles par le voyageur)</Label>
            <textarea
              id="notes_internes" name="notes_internes"
              defaultValue={(guest as any).notes_internes ?? ""}
              rows={4}
              placeholder="Comportement, incidents, préférences particulières..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-muted/30">
          <Link href={`/voyageurs/${guest.id}`}>
            <Button type="button" variant="outline" size="sm" className="cursor-pointer">Annuler</Button>
          </Link>
          <Button type="submit" size="sm" className="cursor-pointer">Enregistrer</Button>
        </div>
      </form>
    </div>
  )
}
