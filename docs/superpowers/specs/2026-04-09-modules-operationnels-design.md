# Design — Modules Opérationnels (Sous-projet B)

**Date :** 2026-04-09  
**Scope :** Planning calendrier, Ménage amélioré, Check-in/Check-out, Documents + S3  
**Stack :** Next.js 14 App Router, react-big-calendar, packages/storage (S3), packages/email (Resend)

---

## 1. Planning Calendrier

### Architecture

```
apps/backoffice/app/(protected)/planning/
  page.tsx                    ← Server Component : fetch events + stats mois courant
  planning-calendar.tsx       ← "use client" : react-big-calendar + toolbar + filtres
  planning-stats.tsx          ← Server Component : barre stats (taux occupation, arrivées, départs)

apps/backoffice/lib/dal/
  planning.ts                 ← getPlanningEvents(from, to, property_id?) → PlanningEvent[]
                              ← getPlanningStats(from, to) → { occupancy, arrivals, departures }
```

### Données affichées

| Type | Couleur | Titre affiché | Lien au click |
|------|---------|---------------|---------------|
| Réservation CONFIRMED/CHECKEDIN | Bleu `#3b82f6` | Prénom Nom — Bien | `/reservations/[id]` |
| Réservation CHECKEDOUT | Gris `#9ca3af` | Prénom Nom — Bien | `/reservations/[id]` |
| Réservation CANCELLED | Rouge clair `#fca5a5` | Annulée — Bien | `/reservations/[id]` |
| Tâche ménage PLANIFIEE | Bleu ciel `#7dd3fc` | Ménage — Bien | `/menage/[id]` |
| Tâche ménage EN_COURS | Orange `#fb923c` | Ménage en cours — Bien | `/menage/[id]` |
| Tâche ménage TERMINEE | Vert `#4ade80` | Ménage terminé — Bien | `/menage/[id]` |
| Tâche ménage PROBLEME | Rouge `#f87171` | Problème ménage — Bien | `/menage/[id]` |
| Blocage | Gris foncé `#6b7280` | Motif blocage | — |

### Interface PlanningEvent

```typescript
interface PlanningEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  url: string
  type: "booking" | "cleaning" | "blocked"
}
```

### Navigation et filtres

- Navigation mois/semaine/jour via toolbar native react-big-calendar
- Navigation entre mois via `searchParams` URL `?from=2026-04-01` (Server Component re-fetch)
- Filtre par bien : `<select>` dans le header de page, passe `?property_id=xxx` dans l'URL
- Click sur un event → `router.push(event.url)` côté client

### Barre de stats mensuelle

Affichée au-dessus du calendrier, calculée sur la période visible :
- **Taux d'occupation** : (jours réservés / jours disponibles totaux) × 100
- **Arrivées** : count bookings avec check_in dans la période
- **Départs** : count bookings avec check_out dans la période
- **Ménages planifiés** : count cleaning tasks dans la période

---

## 2. Ménage Amélioré

### Architecture

```
apps/backoffice/app/(protected)/menage/
  page.tsx                    ← Server Component : fetch tâches + prestataires
  menage-tabs.tsx             ← "use client" : switcher Liste / Calendrier
  menage-calendar.tsx         ← "use client" : react-big-calendar (réutilise le setup planning)
  menage-table.tsx            ← existant, enrichi avec bouton assignation
  assign-form.tsx             ← "use client" : select prestataire + submit

apps/backoffice/lib/dal/
  menage.ts                   ← +assignContractor(taskId, contractorId)

apps/backoffice/app/(protected)/menage/
  actions.ts                  ← +assignCleaningTaskAction(taskId, contractorId)

packages/email/src/
  templates/menage-assign.tsx ← nouveau template email
  render.ts                   ← +sendMenageAssignEmail(...)
```

### Vue calendrier ménage

Mêmes couleurs que la section Planning (par statut). Filtre additionnel : **par prestataire** (select au-dessus). Click event → `/menage/[id]`.

### Badge dépassement

Dans la liste et le détail, si `duree_reelle > duree_estimee × 1.3` : badge orange "Dépassement +X min" affiché à côté du statut. Calculé en JS pur, pas de champ DB supplémentaire.

### Assignation rapide

Dans `menage-table.tsx`, colonne "Prestataire" : si non assigné, bouton "Assigner" ouvre un `<select>` inline avec les prestataires actifs. Submit via Server Action `assignCleaningTaskAction`.

Au moment de l'assignation :
1. `db.cleaningTask.update({ contractor_id })`
2. `sendMenageAssignEmail({ to: contractor.email, contractorName, propertyName, datePrevue, notes })`
3. Log dans `AuditLog` (action: `MENAGE_ASSIGNED`)

### Template email MenageAssign

Nouveau template `packages/email/src/templates/menage-assign.tsx` avec : nom prestataire, bien concerné, date prévue, notes éventuelles, lien vers le portail ou contact.

---

## 3. Check-in / Check-out

### Architecture

```
apps/backoffice/app/(protected)/reservations/[id]/
  page.tsx                    ← existant, enrichi avec les formulaires workflow
  checkin-form.tsx            ← "use client" : checklist + submit
  checkout-form.tsx           ← "use client" : checklist + caution + observation
  actions.ts                  ← +startCheckin(id), +completeCheckout(id, data)
```

### Workflow et transitions

```
CONFIRMED   →  CHECKEDIN    : bouton "Démarrer le check-in" → checkin-form
CHECKEDIN   →  CHECKEDOUT   : bouton "Terminer le check-out" → checkout-form
```

Les boutons ne s'affichent que si le statut correspond ET si tous les items de la checklist sont cochés (validation client-side avant submit).

### Checklist check-in (4 items)

```typescript
const CHECKIN_ITEMS = [
  "Remise des clés / codes d'accès confirmée",
  "Caution encaissée",
  "État général du logement vérifié",
  "Voyageur informé des règles maison",
]
```

### Checklist check-out (4 items + caution + observation)

```typescript
const CHECKOUT_ITEMS = [
  "Clés récupérées",
  "État des lieux effectué",
  "Ménage planifié",
  "Inventaire vérifié",
]
```

Champs supplémentaires :
- **Caution** : radio "Libérée" | "Retenue partiellement" | "Retenue totalement"
- **Montant retenu** : champ numérique (si retenue partielle)
- **Motif** : texte libre (si retenue)
- **Observations** : textarea libre (état logement, comportement, dégradations)

### Stockage

Les données checklist + caution + observations sont sérialisées en JSON et stockées dans `Booking.notes_internes`. Format :

```json
{
  "checkin": { "items": [true, true, true, true], "at": "2026-04-10T14:30:00Z" },
  "checkout": {
    "items": [true, true, true, true],
    "caution": "retenue_partielle",
    "montant_retenu": 150,
    "motif": "Tache sur canapé",
    "observations": "Appartement globalement propre",
    "at": "2026-04-14T11:00:00Z"
  }
}
```

### Lien mise à jour voyageur

Après validation du check-out, lien "Mettre à jour la fiche voyageur" → `/voyageurs/[guest_id]/edit` avec `observations` pré-rempli dans le champ `notes_internes`. Implémenté via `searchParams` sur la page edit existante.

### Server Actions

```typescript
// startCheckin(id) :
// 1. updateBookingStatut(id, "CHECKEDIN")
// 2. revalidatePath

// completeCheckout(id, data: CheckoutData) :
// 1. Merge data JSON dans notes_internes
// 2. updateBookingStatut(id, "CHECKEDOUT")
// 3. revalidatePath
```

---

## 4. Documents + S3

### Architecture

```
apps/backoffice/app/(protected)/documents/
  page.tsx                        ← Server Component : liste + filtres
  upload-form.tsx                 ← "use client" : fichier + type + entité
  document-card.tsx               ← aperçu inline + badge expiration
  actions.ts                      ← uploadDocumentAction, deleteDocumentAction

apps/backoffice/app/api/documents/[id]/preview/
  route.ts                        ← GET : stream fichier depuis S3

apps/backoffice/lib/dal/
  documents.ts                    ← enrichi : +uploadDocument(), +getExpiringDocuments(days)

apps/backoffice/app/api/cron/
  document-expiry/route.ts        ← cron hebdo alertes expiration
```

### Upload

`upload-form.tsx` : `<input type="file">` + select type (DPE, Assurance, Diagnostic électrique, Bail, Mandat, Autre) + select entité liée (bien ou propriétaire) + date d'expiration optionnelle.

`uploadDocumentAction` :
1. Valide fichier (type : PDF/JPG/PNG, taille max 20 Mo)
2. `uploadFile` via `@conciergerie/storage` → S3
3. `db.document.create({ url, type, entity_type, entity_id, date_expiration })`
4. `revalidatePath("/documents")`

### Aperçu inline

Dans `document-card.tsx` :
- **PDF** : `<iframe src="/api/documents/[id]/preview" className="w-full h-64" />`
- **Image** : `<img src="/api/documents/[id]/preview" className="w-full object-cover" />`
- **Autre** : bouton "Télécharger" uniquement

La route `/api/documents/[id]/preview/route.ts` :
1. Auth check (`auth()`)
2. Récupère document en DB
3. Génère URL présignée S3 (`getPresignedDownloadUrl`) valide 5 minutes
4. Redirect vers l'URL présignée (`NextResponse.redirect`)

### Badges expiration

```typescript
const today = new Date()
const in30Days = addDays(today, 30)

// Rouge : date_expiration < today
// Orange : date_expiration >= today && date_expiration <= in30Days
// Aucun : date_expiration > in30Days || date_expiration null
```

Affichés dans `document-card.tsx` et dans la liste page.

### Cron alertes expiration

`vercel.json` : ajout `{ "path": "/api/cron/document-expiry", "schedule": "0 8 * * 1" }` (tous les lundis 08h00).

Route `/api/cron/document-expiry/route.ts` :
1. Auth `CRON_SECRET`
2. `getExpiringDocuments(30)` → documents expirant dans ≤ 30 jours
3. Grouper par gestionnaire/propriétaire
4. Envoyer un email récapitulatif par destinataire
5. Log `AuditLog`

**Template email** : réutilise `NouveauMessageEmail` ou crée `DocumentExpiryEmail` — liste des documents avec nom, type, date d'expiration, lien direct.

---

## 5. Dépendances et ordre d'implémentation

```
Task 1: react-big-calendar install + DAL planning.ts
Task 2: Planning page (Server Component + client calendar + stats)
Task 3: Ménage tabs + calendar view
Task 4: Assignation prestataire + email MenageAssign
Task 5: Check-in/Check-out forms + actions
Task 6: Documents upload + S3 + preview route
Task 7: Document badges expiration + filtres
Task 8: Cron document-expiry + vercel.json update
Task 9: Build + push
```

---

## 6. DB migrations requises

Aucune nouvelle table. Aucun nouveau champ — les données check-in/checkout sont sérialisées dans `Booking.notes_internes` (déjà `String?`).

---

## 7. Variables d'environnement

Aucune nouvelle variable — tout repose sur `S3_*`, `RESEND_API_KEY`, `CRON_SECRET` déjà en place.

---

## 8. Hors scope

- Signature électronique caution (sous-projet D)
- OCR documents (sous-projet D)
- Drag & drop tâches ménage dans le calendrier
- Notifications temps réel (WebSocket)
