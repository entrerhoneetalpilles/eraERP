"use client"

import { useState, useTransition } from "react"
import { Plus, Loader2, User } from "lucide-react"
import { createInventoryAction } from "./actions"

type Property = { id: string; nom: string }
type Booking = {
  id: string
  property_id: string
  check_in: Date
  check_out: Date
  guest: { prenom: string; nom: string; email: string | null; telephone: string | null }
}

export function InventoryForm({ properties, bookings }: { properties: Property[]; bookings: Booking[] }) {
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [selectedProperty, setSelectedProperty] = useState("")
  const [selectedBookingId, setSelectedBookingId] = useState("")
  const [error, setError] = useState<string | null>(null)

  const propertyBookings = bookings.filter(b => b.property_id === selectedProperty)
  const selectedBooking = propertyBookings.find(b => b.id === selectedBookingId) ?? null

  function handlePropertyChange(id: string) {
    setSelectedProperty(id)
    setSelectedBookingId("")
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await createInventoryAction(null, fd)
      if (res?.error) { setError(res.error); return }
      setOpen(false)
      setSelectedProperty("")
      setSelectedBookingId("")
    })
  }

  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-md border border-border bg-background hover:bg-accent transition-colors cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Nouvel état des lieux
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-border bg-card p-5 space-y-4 max-w-lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Bien *</label>
              <select
                name="property_id"
                required
                value={selectedProperty}
                onChange={e => handlePropertyChange(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="">Sélectionner…</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
              <select
                name="type"
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
              >
                <option value="ENTREE">Entrée</option>
                <option value="SORTIE">Sortie</option>
              </select>
            </div>
          </div>

          {/* Réservation */}
          {selectedProperty && (
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Réservation associée</label>
              {propertyBookings.length > 0 ? (
                <select
                  name="booking_id"
                  value={selectedBookingId}
                  onChange={e => setSelectedBookingId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
                >
                  <option value="">Aucune (saisie manuelle)</option>
                  {propertyBookings.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.guest.prenom} {b.guest.nom} — {new Date(b.check_in).toLocaleDateString("fr-FR")} → {new Date(b.check_out).toLocaleDateString("fr-FR")}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-xs text-muted-foreground italic">Aucune réservation pour ce bien</p>
              )}
            </div>
          )}

          {/* Locataire : preview auto si résa, sinon saisie manuelle */}
          {selectedProperty && selectedBooking ? (
            <div className="rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-4 py-3 space-y-1">
              <div className="flex items-center gap-1.5 mb-1">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400">Locataire (depuis réservation)</p>
              </div>
              <p className="text-sm font-medium text-foreground">{selectedBooking.guest.prenom} {selectedBooking.guest.nom}</p>
              {selectedBooking.guest.email && <p className="text-xs text-muted-foreground">{selectedBooking.guest.email}</p>}
              {selectedBooking.guest.telephone && <p className="text-xs text-muted-foreground">{selectedBooking.guest.telephone}</p>}
            </div>
          ) : selectedProperty ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">Informations locataire (optionnel)</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Prénom</label>
                  <input type="text" name="locataire_prenom" placeholder="Prénom"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Nom</label>
                  <input type="text" name="locataire_nom" placeholder="Nom"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input type="email" name="locataire_email" placeholder="email@exemple.com"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Téléphone</label>
                  <input type="tel" name="locataire_tel" placeholder="+33 6 …"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Date *</label>
              <input
                type="date"
                name="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Réalisé par *</label>
              <input
                type="text"
                name="realise_par"
                placeholder="Nom du gestionnaire"
                required
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-xs rounded-md border border-border hover:bg-accent transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Créer
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
