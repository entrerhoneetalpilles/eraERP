# Spec Design — Portail Propriétaire (Sub-project C)

**Date :** 2026-04-10  
**Statut :** Draft  
**Projet :** ERP Entre Rhône et Alpilles — `apps/portal`  
**Référence :** ERP Design Spec §P1d (semaines 11–14)

---

## 1. Objectif

Fournir aux propriétaires un espace en ligne **mobile-first, premium** pour consulter leurs revenus, leurs biens, leurs documents et communiquer avec l'équipe — sans avoir besoin d'appeler ou d'envoyer des emails.

**Vocabulaire propriétaire (différent du back-office) :**

| Back-office | Portail |
|---|---|
| Compte mandant | Vos revenus |
| ManagementReport | Compte-rendu de gestion |
| FeeInvoice | Facture d'honoraires |
| Transaction REVERSEMENT | Virement |
| CleaningTask | Ménage |
| BlockedDate | Période bloquée |

---

## 2. Architecture

### Stack

- **Framework :** Next.js 14 App Router — Server Components + Server Actions
- **Auth :** NextAuth.js v5 — déjà en place (`OwnerUser`, `session.user.ownerId`)
- **DAL :** `apps/portal/lib/dal/` — fonctions scoped à `ownerId`, séparées du back-office
- **Design :** Tailwind + tokens Provence existants, mobile-first
- **Animations :** Framer Motion sur les transitions de pages et les KPI cards
- **Icônes :** Lucide React (pas d'emojis)

### Scoping de données

Toute requête DB utilise `session.user.ownerId` comme filtre racine. Les biens d'un propriétaire sont accessibles via ses mandats (`Mandate.owner_id`). Aucune donnée d'autres propriétaires n'est jamais exposée.

```
Owner
  └── Mandate → Property
        ├── Booking
        ├── CleaningTask
        └── BlockedDate
  └── MandantAccount
        ├── Transaction
        └── ManagementReport
  └── Document
  └── FeeInvoice
  └── MessageThread
        └── Message
```

---

## 3. Routes

```
apps/portal/app/
├── (auth)/
│   └── login/page.tsx          ← existant
├── (protected)/
│   ├── layout.tsx               ← à enrichir (nav + header)
│   ├── dashboard/page.tsx       ← à réécrire
│   ├── biens/
│   │   ├── page.tsx             ← liste des biens
│   │   └── [id]/page.tsx        ← détail bien
│   ├── revenus/page.tsx         ← CRG + reversements
│   ├── documents/page.tsx       ← documents filtrés par owner
│   ├── messagerie/
│   │   ├── page.tsx             ← liste threads
│   │   └── [id]/page.tsx        ← conversation
│   └── planning/page.tsx        ← calendrier biens
└── lib/dal/
    ├── owner.ts
    ├── properties.ts
    ├── revenus.ts
    ├── documents.ts
    ├── messagerie.ts
    └── planning.ts
```

---

## 4. Layout & Navigation

### Layout protégé (`(protected)/layout.tsx`)

Enrichir le layout existant avec :

```
┌─────────────────────────────────────────┐
│  HEADER (mobile)                         │
│  Logo "ERA" + Bonjour Prénom + 🔔        │
├─────────────────────────────────────────┤
│                                          │
│              {children}                  │
│                                          │
├─────────────────────────────────────────┤
│  BOTTOM NAV (mobile, 5 items)            │
│  🏠 Dashboard │ 🏡 Biens │ 💶 Revenus   │
│  📄 Docs      │ 💬 Messages              │
└─────────────────────────────────────────┘
```

**Desktop (≥ 1024px) :** sidebar fixe gauche 240px + header top.

**Tokens à utiliser :**
- Fond page : `bg-calcaire-50` (`#F4EFEA`)
- Sidebar/header : `bg-white` avec `border-argile-200`
- Accent nav actif : `text-olivier-600` + `bg-olivier-50`
- Titres : `font-serif` (Playfair Display)

### Bottom nav items

| Icône Lucide | Label | Route |
|---|---|---|
| `LayoutDashboard` | Accueil | `/dashboard` |
| `Building2` | Mes biens | `/biens` |
| `TrendingUp` | Revenus | `/revenus` |
| `FileText` | Documents | `/documents` |
| `MessageCircle` | Messages | `/messagerie` |

---

## 5. Pages — Spec détaillée

### 5.1 Dashboard (`/dashboard`)

**Données nécessaires :**
- `MandantAccount.solde_courant` (solde disponible)
- `MandantAccount.solde_sequestre` (en séquestre)
- Dernier `ManagementReport` (date + montant reversé)
- Prochain reversement prévu (date_virement du rapport en cours)
- Biens actifs : count + liste
- Prochains check-ins/check-outs (7 jours glissants)
- Alertes : documents expirant dans 30j + factures impayées

**Mise en page :**

```
┌─────────────────────────────────────────┐
│  Bonjour, Jean-Pierre          [notif]  │
│  Mardi 10 avril 2026                    │
├───────────────┬─────────────────────────┤
│  Solde        │  Dernier virement       │
│  12 450 €     │  3 200 € le 1er avril   │
├───────────────┴─────────────────────────┤
│  PROCHAINS ÉVÉNEMENTS                   │
│  ┌──────────────────────────────────┐   │
│  │ ↗ Check-out — Villa Les Alpilles │   │
│  │   Demain à 11h                   │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │ ↙ Check-in — Loft Avignon       │   │
│  │   Vendredi                       │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  ALERTES                                │
│  ⚠ DPE Villa expire dans 12 jours      │
└─────────────────────────────────────────┘
```

**Composants :**
- `SoldeCard` — balance principale avec animation Framer Motion au montage
- `EventCard` — check-in/check-out avec icône ArrowDown/ArrowUp + date relative
- `AlertBanner` — fond amber, liste des alertes

---

### 5.2 Mes biens (`/biens`)

**Données :** propriétés du propriétaire via ses mandats actifs.

**Liste de biens (cards) :**

```
┌──────────────────────────────────────┐
│  Villa Les Alpilles                  │
│  Saint-Rémy-de-Provence             │
│                                      │
│  Taux occ. ce mois  Prochaine resa   │
│       78%           15–22 avril      │
│                                      │
│  ● Actif                    Voir →   │
└──────────────────────────────────────┘
```

**Détail bien (`/biens/[id]`) :**
- Nom, adresse, type, capacité, superficie
- Mini-calendrier mois courant (react-big-calendar, view MONTH) — réservations en bleu, ménages en ciel, blocages en gris
- 3 dernières réservations avec statut badge
- Revenus du mois (somme `revenu_net_proprietaire` des bookings CHECKEDOUT)

---

### 5.3 Revenus (`/revenus`)

**Données :** `ManagementReport[]` + `Transaction[]` de type `REVERSEMENT`.

**Mise en page :**

```
┌─────────────────────────────────────────┐
│  Vos revenus                            │
├─────────────────────────────────────────┤
│  [Filtres: Année 2026 ▼]               │
├─────────────────────────────────────────┤
│  Mois       Revenus  Honoraires  Reversé│
│  Mars 2026  5 200 €   -520 €    4 680 € │
│  Fév. 2026  3 800 €   -380 €    3 420 € │
│  Jan. 2026  2 100 €   -210 €    1 890 € │
├─────────────────────────────────────────┤
│  Total 2026 11 100 €ú  -1 110 €  9 990 €│
└─────────────────────────────────────────┘
```

Chaque ligne ManagementReport ouvre une vue détail avec :
- Tableau des séjours du mois (bien, dates, montant)
- Lien "Télécharger le CRG" → route `/api/pdf/crg/[id]` existante

---

### 5.4 Documents (`/documents`)

**Données :** `Document[]` filtrés par `owner_id` (excluant `entity_type = "message"`).

Types affichés : `MANDAT`, `AVENANT`, `FACTURE`, `CRG`, `ATTESTATION_FISCALE`, `DIAGNOSTIC`, `AUTRE`.

**Filtres :** par type (chips en haut) + recherche par nom.

**Card document :**
- Icône selon `mime_type`
- Nom + type badge
- Date de création
- Badge expiration si `date_expiration` (rouge/orange — déjà implémenté en back-office)
- Bouton "Télécharger" → `getDocumentViewUrlAction` via Server Action

---

### 5.5 Messagerie (`/messagerie`)

**Données :** `MessageThread[]` filtrés par `owner_id`, avec `messages` inclus (dernier message + count non lus).

**Liste threads :**
```
┌──────────────────────────────────────┐
│  Travaux Villa Les Alpilles          │
│  "Voici le devis pour la plomberie"  │
│  Il y a 2 heures            [2]      │
├──────────────────────────────────────┤
│  CRG Décembre               ✓        │
│  "Voir le compte-rendu ci-joint"     │
│  Il y a 3 jours                      │
└──────────────────────────────────────┘
```

**Vue thread (`/messagerie/[id]`) :**
- Messages en bulles (gestionnaire à gauche en `bg-argile-100`, propriétaire à droite en `bg-olivier-100`)
- Zone de saisie + bouton Envoyer → Server Action `sendOwnerMessageAction`
- Pièces jointes : liens vers documents

---

### 5.6 Planning (`/planning`)

**Données :** bookings + cleaning tasks + blocked dates pour tous les biens du propriétaire, mois courant.

**react-big-calendar**, vue MONTH par défaut, WEEK accessible.

**Couleurs événements :**
| Type | Couleur |
|---|---|
| Booking CONFIRMED/CHECKEDIN | `#3b82f6` bleu |
| Booking CHECKEDOUT | `#9ca3af` gris |
| Booking PENDING | `#f59e0b` amber |
| CleaningTask | `#7dd3fc` ciel |
| BlockedDate | `#6b7280` gris foncé |

Click sur un booking → fiche lecture seule (voyageur, dates, montant).

---

## 6. DAL Portal (`apps/portal/lib/dal/`)

Toutes les fonctions reçoivent `ownerId: string` et ne retournent **jamais** de données hors scope.

### `owner.ts`
```typescript
getOwnerWithAccount(ownerId: string)
// → Owner + MandantAccount + solde + dernier ManagementReport
```

### `properties.ts`
```typescript
getOwnerProperties(ownerId: string)
// → Property[] via Mandate.owner_id, avec booking count + taux occupation mois courant

getOwnerPropertyById(ownerId: string, propertyId: string)
// → Property + bookings récents + revenus mois + accès sécurisé (vérifie mandate.owner_id)
```

### `revenus.ts`
```typescript
getOwnerReports(ownerId: string, year?: number)
// → ManagementReport[] via MandantAccount.owner_id, ordonnés par date desc

getOwnerReportById(ownerId: string, reportId: string)
// → ManagementReport + bookings du mois (pour détail séjours)
```

### `documents.ts`
```typescript
getOwnerDocuments(ownerId: string, type?: DocumentType)
// → Document[] filtrés owner_id + entity_type != "message", ordonnés createdAt desc
```

### `messagerie.ts`
```typescript
getOwnerThreads(ownerId: string)
// → MessageThread[] avec dernier message + count messages non lus (lu_at IS NULL)

getOwnerThread(ownerId: string, threadId: string)
// → MessageThread + Message[] + pièces jointes, vérifie thread.owner_id === ownerId

sendOwnerMessage(ownerId: string, threadId: string, contenu: string)
// → Message créé avec author_type: "OWNER", author_id: ownerId
// → revalidatePath + sendNouveauMessageEmail au gestionnaire
```

### `planning.ts`
```typescript
getOwnerPlanningEvents(ownerId: string, from: Date, to: Date)
// → { bookings, cleanings, blockedDates } pour tous les biens du propriétaire
```

---

## 7. Server Actions Portal

```
apps/portal/app/(protected)/
├── messagerie/actions.ts      ← sendOwnerMessageAction
└── preferences/actions.ts     ← updatePasswordAction, updateNotifPrefsAction
```

Pattern identique au back-office : `"use server"`, `auth()`, revalidatePath.

---

## 8. Composants partagés Portal

À créer dans `apps/portal/components/` :

| Composant | Description |
|---|---|
| `PortalLayout` | Header + BottomNav mobile + Sidebar desktop |
| `SoldeCard` | Affichage solde mandant avec animation |
| `EventCard` | Card check-in/check-out dashboard |
| `AlertBanner` | Bandeau alertes (amber) |
| `PropertyCard` | Card bien avec taux occupation |
| `RevenusTable` | Tableau ManagementReport |
| `DocumentCard` | Card document avec badge expiration |
| `MessageBubble` | Bulle message (gestionnaire / propriétaire) |
| `CalendarPortal` | react-big-calendar adapté portail |

---

## 9. Périmètre — Ce qui est exclu (P2)

- **Signature Yousign** — validation devis/avenants (complexité API externe)
- **Notifications in-app persistantes** — bell avec badge (nécessite WebSocket ou polling)
- **Export PDF/Excel** des revenus (API pdf existante pour CRG suffit)
- **MFA TOTP setup** depuis le portail (géré en back-office par l'admin)
- **PWA** (manifest + service worker)
- **Changement de mot de passe** (Préférences — simple mais non bloquant)
- **SMS Twilio** (intégration externe, P2)
- **Framer Motion** sur les transitions — présent uniquement sur SoldeCard et les stats

---

## 10. Sécurité

- Chaque Server Component vérifie `session.user.ownerId` avant toute requête
- Toutes les DAL functions validées avec `ownerId` en paramètre obligatoire
- La fonction `getOwnerPropertyById` re-vérifie que `mandate.owner_id === ownerId` (pas de traversal)
- Pareil pour `getOwnerThread` : vérifie `thread.owner_id === ownerId`
- Les presigned URLs de documents passent par `getDocumentViewUrlAction` (15 min d'expiration)
