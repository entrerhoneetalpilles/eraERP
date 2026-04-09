# Design — Infrastructure Transversale (Sous-projet A)

**Date :** 2026-04-09  
**Scope :** PDF generation, stockage fichiers, emails automatiques, Vercel Cron jobs, pagination universelle  
**Stack :** Next.js 14 App Router, Vercel (déploiement), Prisma/PostgreSQL (Neon)

---

## 1. PDF Generation — `@react-pdf/renderer`

### Nouveau package `packages/pdf/`

```
packages/pdf/
  src/
    components/
      InvoicePDF.tsx       # Facture d'honoraires
      CrgPDF.tsx           # Compte-rendu de gestion
      QuittancePDF.tsx     # Reçu de séjour
    utils/
      render.ts            # renderToBuffer() wrapper
    index.ts
  package.json
  tsconfig.json
```

### Routes API de téléchargement

| Route | Description |
|-------|-------------|
| `GET /api/pdf/facture/[id]` | Génère et retourne le PDF de la facture |
| `GET /api/pdf/crg/[id]` | Génère et retourne le PDF du CRG |

Réponse : `Content-Type: application/pdf`, header `Content-Disposition: attachment; filename=xxx.pdf`

### Sécurité

Chaque route vérifie la session NextAuth et que l'utilisateur a accès à l'entité demandée (via DAL). Accès non autorisé → 403.

### Contenu des PDFs

**InvoicePDF :** logo conciergerie, coordonnées propriétaire, numéro facture, date, tableau lignes items (description / qté / PU HT / total HT), sous-total HT, TVA 20%, total TTC, conditions de paiement, mentions légales.

**CrgPDF :** en-tête propriétaire + période, tableau recettes (loyers perçus, frais accessoires), tableau déductions (honoraires de gestion, frais travaux, autres charges), calcul virement net, solde compte mandant avant/après.

**QuittancePDF :** bien concerné, dates séjour, montant, voyageur, récépissé de paiement.

---

## 2. Stockage Fichiers — Vercel Blob

### Nouveau package `packages/storage/`

```
packages/storage/
  src/
    index.ts     # uploadFile(), deleteFile(), getPublicUrl()
  package.json
  tsconfig.json
```

### Interface

```typescript
uploadFile(buffer: Buffer, filename: string, folder: string): Promise<{ url: string }>
deleteFile(url: string): Promise<void>
```

### Organisation des dossiers Blob

```
photos/menage/{cleaningTaskId}/{filename}
photos/travaux/{workOrderId}/{filename}
documents/{entityType}/{entityId}/{filename}
pdfs/factures/{invoiceId}.pdf
pdfs/crg/{reportId}.pdf
```

### Variable d'environnement

`BLOB_READ_WRITE_TOKEN` — fourni par Vercel dashboard.

### Upload côté client

Routes API dédiées pour l'upload (ne pas utiliser Server Actions pour les fichiers binaires) :
- `POST /api/upload/menage/[id]` — photos tâche ménage
- `POST /api/upload/travaux/[id]` — photos ordre de travaux
- `POST /api/upload/documents` — documents généraux

Limite : 10 Mo par fichier. Types acceptés : `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.

---

## 3. Emails Automatiques — Resend + React Email

### Structure templates

```
packages/emails/
  src/
    templates/
      CheckinInstructions.tsx    # Instructions d'arrivée voyageur
      InvoiceEmail.tsx           # Facture propriétaire (PDF en PJ)
      CrgEmail.tsx               # CRG mensuel (PDF en PJ)
      InvoiceReminder.tsx        # Relance facture impayée
    send.ts                      # sendEmail() wrapper Resend
    index.ts
```

### Triggers

| Email | Déclencheur | Destinataire |
|-------|-------------|--------------|
| `CheckinInstructions` | Cron J-1 avant check-in | Voyageur |
| `InvoiceEmail` | Action manuelle ou cron mensuel | Propriétaire |
| `CrgEmail` | Cron auto-CRG (1er du mois) | Propriétaire |
| `InvoiceReminder` | Cron quotidien (J+7, J+14, J+30) | Propriétaire |

### sendEmail() wrapper

```typescript
sendEmail({
  to: string,
  subject: string,
  template: ReactElement,
  attachments?: { filename: string; content: Buffer }[]
}): Promise<void>
```

Log chaque envoi dans la table `EmailLog` existante (statut, resend_id, erreur éventuelle).

---

## 4. Vercel Cron Jobs

### Configuration `vercel.json`

```json
{
  "crons": [
    { "path": "/api/cron/auto-crg",             "schedule": "0 8 1 * *"  },
    { "path": "/api/cron/invoice-reminders",     "schedule": "0 9 * * *"  },
    { "path": "/api/cron/checkin-instructions",  "schedule": "0 10 * * *" }
  ]
}
```

### Sécurité

Chaque handler vérifie :
```typescript
if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 })
}
```

### Logique par cron

**`/api/cron/auto-crg`** (1er du mois, 08h00) :
1. Lister tous les mandats `ACTIF` ayant des transactions le mois précédent
2. Pour chaque mandat, appeler `generateCrg()` DAL existant
3. Générer le PDF CRG via `packages/pdf`
4. Envoyer `CrgEmail` au propriétaire avec PDF en PJ
5. Logger résultat (succès / erreur) dans `AuditLog`

**`/api/cron/invoice-reminders`** (tous les jours, 09h00) :
1. Lister factures `EMISE` dont `date_echeance` < aujourd'hui
2. Calculer ancienneté : J+7, J+14, J+30
3. Envoyer `InvoiceReminder` uniquement aux paliers non encore notifiés (champ `derniere_relance` sur facture)
4. Mettre à jour `derniere_relance`

**`/api/cron/checkin-instructions`** (tous les jours, 10h00) :
1. Lister réservations `CONFIRMED` avec `date_arrivee` = demain
2. Pour chaque réservation, envoyer `CheckinInstructions` au voyageur (code accès, wifi, règles maison, contact urgence)
3. Marquer `instructions_envoyees = true` sur la réservation

### Nouveau champ Booking

```prisma
instructions_envoyees  Boolean   @default(false)
```

### Nouveau champ FeeInvoice

```prisma
derniere_relance  DateTime?
```

---

## 5. Pagination Universelle

### Interface DAL standardisée

Toutes les fonctions de liste DAL acceptent des paramètres de pagination optionnels et retournent un objet paginé :

```typescript
// Paramètres (tous optionnels, valeurs par défaut sûres)
interface PaginationParams {
  page?: number    // défaut: 1
  limit?: number   // défaut: 50, max: 200
}

// Retour standardisé
interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
```

### Modules concernés

Priorité 1 (listes potentiellement longues) : `getBookings`, `getGuests`, `getTransactions`, `getAuditLogs`, `getWorkOrders`, `getCleaningTasks`, `getDocuments`

Priorité 2 : `getOwners`, `getProperties`, `getMandates`, `getFeeInvoices`, `getPrestataires`

### DataTable côté serveur

Le composant `DataTable` existant reçoit `total` et `page` en props. Navigation page précédente/suivante via `searchParams` URL (`?page=2`).

---

## 6. Dépendances entre composants

```
packages/pdf      ← dépend de: @react-pdf/renderer, packages/db
packages/storage  ← dépend de: @vercel/blob
packages/emails   ← dépend de: resend, react-email, packages/pdf, packages/db
API cron routes   ← dépendent de: packages/emails, packages/pdf, packages/db (DAL)
```

---

## 7. Variables d'environnement requises

| Variable | Usage |
|----------|-------|
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob upload/delete |
| `CRON_SECRET` | Authentification cron jobs |
| `RESEND_API_KEY` | Envoi emails (déjà présent) |

---

## 8. Migrations DB requises

```sql
-- Booking: tracking envoi instructions check-in
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "instructions_envoyees" BOOLEAN NOT NULL DEFAULT false;

-- FeeInvoice: tracking relances
ALTER TABLE "fee_invoices" ADD COLUMN IF NOT EXISTS "derniere_relance" TIMESTAMP(3);
```

---

## 9. Plan d'implémentation (ordre)

1. `packages/storage` — aucune dépendance, fondation pour le reste
2. `packages/pdf` — dépend seulement de react-pdf + db
3. Routes API `/api/pdf/*` — dépendent de packages/pdf
4. Routes API `/api/upload/*` — dépendent de packages/storage
5. `packages/emails` — dépend de pdf + storage
6. Cron jobs — dépendent de emails + pdf + DAL
7. Pagination DAL — indépendant, peut se faire en parallèle

---

## 10. Hors scope (sous-projets B, C, D)

- Calendrier planning et ménage → sous-projet B
- Réconciliation bancaire → sous-projet C
- Signature Yousign → sous-projet D
- MFA setup UI → sous-projet D
