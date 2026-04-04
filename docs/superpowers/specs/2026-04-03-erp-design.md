# Spec — ERP Conciergerie "Entre Rhône et Alpilles"

**Date :** 2026-04-03  
**Statut :** Approuvé  
**Projet :** ERP gestion locative courte durée haut de gamme  
**Marque :** Entre Rhône et Alpilles — Conciergerie lifestyle Provence

---

## 1. Contexte & Objectifs

Société de conciergerie premium en Provence gérant des biens haut de gamme (villas, appartements de standing, lofts) pour le compte de propriétaires bailleurs, en location courte durée type Airbnb.

**Modèle économique :**
- Honoraires de gestion facturés aux propriétaires (% des revenus encaissés)
- Prestations de conciergerie et services additionnels facturées aux voyageurs

**Problématiques résolues par l'ERP :**
- Vue consolidée par propriétaire (biens, réservations, revenus, reversements)
- Portail propriétaire moderne et autonome
- Comptabilité mandant isolée par propriétaire (loi Hoguet)
- Automatisation du quittancement et des relances
- Gestion des travaux, ménage et conciergerie intégrée
- Synchronisation Airbnb centralisée

**Volume cible :** 10–30 biens, 10–20 propriétaires

---

## 2. Architecture Technique

### Stack

| Composant | Technologie |
|---|---|
| Apps | Next.js 14 App Router (Server Components + Server Actions) |
| ORM | Prisma |
| Base de données | PostgreSQL 16 — Supabase Paris (eu-west-3) |
| Auth | NextAuth.js v5 — email + MFA TOTP |
| UI | shadcn/ui + Tailwind CSS |
| Validation | Zod |
| Cache client | TanStack Query |
| PDF | react-pdf (documents) + Puppeteer (CRG complexes) |
| Storage | OVH Object Storage France (S3-compatible) |
| Email | Resend + React Email |
| SMS | Twilio |
| Signature | Yousign API v3 |
| Hébergement apps | Vercel |
| Animations | Framer Motion (portail uniquement) |
| Rate limiting | Upstash Redis |

### Monorepo

```
conciergerie/                     ← Turborepo
├── apps/
│   ├── backoffice/               ← Next.js 14 — back-office interne
│   └── portal/                   ← Next.js 14 — portail propriétaire
├── packages/
│   ├── db/                       ← Prisma schema + migrations
│   ├── ui/                       ← shadcn/ui components partagés
│   ├── types/                    ← TypeScript types partagés
│   ├── email/                    ← Templates React Email
│   └── config/                   ← ESLint, Tailwind, TS configs
├── docker-compose.yml            ← Dev local (PostgreSQL + MinIO)
└── turbo.json
```

### Environnements

| Env | Apps | Base de données | Storage |
|---|---|---|---|
| Local | Docker Compose | PostgreSQL local | MinIO local |
| Staging | Vercel Preview | Supabase staging | OVH FR staging |
| Production | Vercel | Supabase Paris | OVH FR prod |

---

## 3. Modèle de Données

### Propriétaires & Biens

```prisma
model Owner {
  id          String   @id @default(cuid())
  type        OwnerType // INDIVIDUAL | SCI | INDIVISION
  nom         String
  email       String   @unique
  telephone   String?
  adresse     Json
  rib_iban    String?  // chiffré
  nif         String?  // numéro fiscal
  notes       String?
  createdAt   DateTime @default(now())

  mandates    Mandate[]
  mandantAccounts MandantAccount[]
  ownerUsers  OwnerUser[]
  documents   Document[]
  messages    MessageThread[]
  feeInvoices FeeInvoice[]
}

model Property {
  id                  String   @id @default(cuid())
  nom                 String
  adresse             Json
  type                PropertyType // APPARTEMENT | VILLA | LOFT | CHALET | AUTRE
  superficie          Float
  nb_chambres         Int
  capacite_voyageurs  Int
  amenities           String[]
  airbnb_listing_id   String?  @unique
  statut              PropertyStatus // ACTIF | INACTIF | TRAVAUX

  mandate             Mandate?
  bookings            Booking[]
  blockedDates        BlockedDate[]
  priceRules          PriceRule[]
  access              PropertyAccess?
  workOrders          WorkOrder[]
  cleaningTasks       CleaningTask[]
  inventories         PropertyInventory[]
  propertyDocuments   PropertyDocument[]
  airbnbListing       AirbnbListing?
  cleaningSchedules   CleaningSchedule[]
}

model Mandate {
  id                      String   @id @default(cuid())
  numero_mandat           String   @unique
  owner_id                String
  property_id             String   @unique
  date_debut              DateTime
  date_fin                DateTime?
  statut                  MandateStatus // ACTIF | SUSPENDU | RESILIE
  taux_honoraires_gestion Float    // % sur revenus
  honoraires_location     Float?   // € forfait mise en location
  seuil_validation_devis  Float    // € — au-delà, validation propriétaire requise
  prestations_incluses    String[]
  reconduction_tacite     Boolean  @default(true)

  owner     Owner    @relation(...)
  property  Property @relation(...)
  avenants  MandateAmendment[]
  documents Document[]
}
```

### Réservations

```prisma
model Booking {
  id                      String   @id @default(cuid())
  property_id             String
  guest_id                String
  platform                Platform // AIRBNB | DIRECT | MANUAL
  platform_booking_id     String?  @unique
  check_in                DateTime
  check_out               DateTime
  nb_nuits                Int
  nb_voyageurs            Int
  statut                  BookingStatus
  // PENDING | CONFIRMED | CHECKEDIN | CHECKEDOUT | CANCELLED

  montant_total           Float
  frais_menage            Float    @default(0)
  commission_plateforme   Float    @default(0)
  revenu_net_proprietaire Float    // calculé : montant_total - frais_menage - commission
  notes_internes          String?

  property      Property  @relation(...)
  guest         Guest     @relation(...)
  transactions  Transaction[]
  cleaningTask  CleaningTask?
  inventory     PropertyInventory[]
  documents     Document[]
  review        Review?
}

model Guest {
  id                 String  @id @default(cuid())
  prenom             String
  nom                String
  email              String?
  telephone          String?
  platform_guest_id  String?
  langue             String  @default("fr")
  nb_sejours         Int     @default(0)

  bookings   Booking[]
  reviews    Review[]
}
```

### Tarification & Calendrier

```prisma
model PriceRule {
  id              String  @id @default(cuid())
  property_id     String
  type            PriceRuleType // DEFAUT | SAISON | WEEKEND | EVENEMENT
  nom             String?
  date_debut      DateTime?
  date_fin        DateTime?
  jours_semaine   Int[]    // 0=dim...6=sam
  prix_nuit       Float
  sejour_min      Int      @default(1)
  priorite        Int      @default(0)  // plus élevé = prioritaire
}

model BlockedDate {
  id          String  @id @default(cuid())
  property_id String
  date_debut  DateTime
  date_fin    DateTime
  motif       BlockedReason // PROPRIETAIRE | TRAVAUX | MAINTENANCE
  notes       String?
}

model PropertyAccess {
  id                   String  @id @default(cuid())
  property_id          String  @unique
  type_acces           AccessType
  // BOITE_CLES | CODE | AGENT | SERRURE_CONNECTEE
  code_acces           String?  // chiffré
  instructions_arrivee String?
  wifi_nom             String?
  wifi_mdp             String?  // chiffré
  notes_depart         String?  // instructions check-out
}

model AirbnbListing {
  id              String   @id @default(cuid())
  property_id     String   @unique
  listing_id      String   @unique
  titre           String?
  description     String?
  regles_maison   String?
  statut_sync     SyncStatus // OK | ERROR | PENDING
  derniere_sync   DateTime?
  erreurs_sync    Json?
}
```

### Comptabilité Mandant

```prisma
model MandantAccount {
  id              String  @id @default(cuid())
  owner_id        String  @unique
  solde_courant   Float   @default(0)
  solde_sequestre Float   @default(0)

  transactions    Transaction[]
  reports         ManagementReport[]
  owner           Owner @relation(...)
}

model Transaction {
  id                  String  @id @default(cuid())
  mandant_account_id  String
  booking_id          String?
  fee_invoice_id      String?
  work_order_id       String?
  type                TransactionType
  // REVENU_SEJOUR | HONORAIRES | TRAVAUX | REVERSEMENT | CHARGE | AUTRE
  montant             Float
  date                DateTime
  libelle             String
  statut              TransactionStatus // PENDING | VALIDATED | RECONCILED
  piece_jointe_id     String?

  mandantAccount  MandantAccount @relation(...)
  bankLine        BankLine?
}

model ManagementReport {
  id                    String   @id @default(cuid())
  mandant_account_id    String
  periode_debut         DateTime
  periode_fin           DateTime
  revenus_sejours       Float
  honoraires_deduits    Float
  charges_deduites      Float
  montant_reverse       Float
  date_virement         DateTime?
  document_id           String?  // PDF généré

  account   MandantAccount @relation(...)
}

model FeeInvoice {
  id              String   @id @default(cuid())
  owner_id        String
  numero_facture  String   @unique
  periode_debut   DateTime
  periode_fin     DateTime
  montant_ht      Float
  tva_rate        Float    @default(0.20)
  montant_ttc     Float
  statut          InvoiceStatus // BROUILLON | EMISE | PAYEE | AVOIR
  document_id     String?
  avoir_id        String?  // si rectification

  owner    Owner    @relation(...)
}
```

### Rapprochement Bancaire

```prisma
model BankStatement {
  id            String   @id @default(cuid())
  fichier_nom   String
  format        BankFormat // CFONB | OFX | CSV
  date_import   DateTime @default(now())
  nb_lignes     Int
  montant_total Float

  lines   BankLine[]
}

model BankLine {
  id              String  @id @default(cuid())
  statement_id    String
  date            DateTime
  libelle         String
  montant         Float
  statut          LineStatus // NON_LETTREE | LETTREE | IGNOREE
  transaction_id  String?  @unique

  statement   BankStatement @relation(...)
  transaction Transaction?  @relation(...)
}
```

### Opérations

```prisma
model CleaningTask {
  id              String   @id @default(cuid())
  booking_id      String   @unique
  property_id     String
  prestataire_id  String?
  date_prevue     DateTime
  date_realisation DateTime?
  statut          TaskStatus // PLANIFIEE | EN_COURS | TERMINEE | PROBLEME
  checklist       Json[]
  photos          String[]
  notes           String?
}

model CleaningSchedule {
  id            String  @id @default(cuid())
  property_id   String
  semaine       DateTime  // lundi de la semaine
  prestataire_id String?
  statut_global TaskStatus

  tasks   CleaningTask[]
}

model WorkOrder {
  id              String   @id @default(cuid())
  property_id     String
  contractor_id   String?
  titre           String
  description     String
  type            String
  urgence         Urgency  // NORMALE | URGENTE | CRITIQUE
  statut          WorkOrderStatus
  imputable_a     Imputation // PROPRIETAIRE | SOCIETE
  devis_id        String?
  facture_id      String?
  created_by      String
  notes           String?
}

model Contractor {
  id                    String  @id @default(cuid())
  nom                   String
  metier                String
  email                 String?
  telephone             String?
  siret                 String?
  assurance_rc_pro      DateTime? // date expiration
  assurance_decennale   DateTime? // date expiration
  notes                 String?

  workOrders   WorkOrder[]
  documents    Document[]
}

model PropertyInventory {
  id                  String   @id @default(cuid())
  property_id         String
  booking_id          String?
  type                InventoryType // ENTREE | SORTIE
  date                DateTime
  realise_par         String
  pieces              Json[]   // { nom, etat, commentaire, photos[] }
  comparaison_id      String?  // ref vers l'entrée pour diff
  yousign_procedure_id String?
  signe_voyageur      Boolean  @default(false)
  signe_agent         Boolean  @default(false)
}
```

### Documents & Signature

```prisma
model Document {
  id                    String   @id @default(cuid())
  type                  DocumentType
  // MANDAT | AVENANT | DEVIS | FACTURE | CRG | ETAT_LIEUX
  // ATTESTATION_FISCALE | PHOTO | DIAGNOSTIC | AUTRE
  nom                   String
  url_storage           String
  mime_type             String
  taille                Int      // bytes
  entity_type           String   // relation polymorphique
  entity_id             String
  statut_signature      SignatureStatus // NONE | PENDING | SIGNED | REFUSED
  yousign_procedure_id  String?
  uploaded_by           String
  createdAt             DateTime @default(now())
}
```

### Assurances & Diagnostics

```prisma
model PropertyDocument {
  id              String   @id @default(cuid())
  property_id     String
  type            LegalDocType
  // DPE | ELECTRICITE | GAZ | PLOMB | AMIANTE | PNO | AUTRE
  date_validite   DateTime?
  statut          DocStatus // VALIDE | EXPIRE | MANQUANT
  document_id     String?
  alertes_envoyees Json[]  // { date, type: "J-60"|"J-30"|"EXPIRE" }
}
```

### Services Additionnels (Conciergerie)

```prisma
model ServiceCatalog {
  id          String  @id @default(cuid())
  nom         String
  description String?
  categorie   String
  tarif       Float
  unite       ServiceUnit // ACTE | HEURE | NUIT | MOIS
  tva_rate    Float   @default(0.20)
  actif       Boolean @default(true)
}

model ServiceOrder {
  id              String   @id @default(cuid())
  property_id     String
  booking_id      String?
  guest_id        String?
  service_id      String
  quantite        Float    @default(1)
  montant_total   Float
  statut          OrderStatus
  date_realisation DateTime?
  facture_id      String?
  notes           String?
}
```

### Facturation au Taux Horaire

```prisma
model TimeEntry {
  id              String   @id @default(cuid())
  owner_id        String
  property_id     String?
  date            DateTime
  description     String
  nb_heures       Float
  taux_horaire    Float    // € HT — défini dans le mandat ou saisi manuellement
  montant_ht      Float    // calculé : nb_heures × taux_horaire
  fee_invoice_id  String?  // null = non encore facturé
  created_by      String

  owner       Owner      @relation(...)
  feeInvoice  FeeInvoice? @relation(...)
}
```

Le `taux_horaire` par défaut peut être configuré dans le `Mandate` (champ `taux_horaire_ht` à ajouter). Les `TimeEntry` non facturées sont visibles dans un tableau de bord "à facturer" et peuvent être groupées en une `FeeInvoice` à la demande.

Ajout dans `Mandate` :
```prisma
taux_horaire_ht  Float?  // taux horaire HT par défaut pour ce mandat
```

### Comptabilité Société

```prisma
model CompanyTransaction {
  id          String   @id @default(cuid())
  type        CompanyTxType
  // REVENU_HONORAIRES | CHARGE | TVA_COLLECTEE | TVA_DEDUCTIBLE | AUTRE
  montant_ht  Float
  tva_rate    Float    @default(0.20)
  montant_ttc Float
  journal     Journal  // VENTES | ACHATS | BANQUE | OD
  libelle     String
  date        DateTime
  fee_invoice_id String?
  piece_jointe_id String?
  lettree     Boolean  @default(false)
  createdAt   DateTime @default(now())
}
```

### Avenant Mandat

```prisma
model MandateAmendment {
  id          String   @id @default(cuid())
  mandate_id  String
  numero      Int      // avenant n°X
  date        DateTime
  description String
  modifications Json   // champs modifiés : { champ, avant, apres }
  document_id String?
  statut_signature SignatureStatus @default(NONE)

  mandate   Mandate  @relation(...)
}
```

### Messagerie & Notifications

```prisma
model MessageThread {
  id          String  @id @default(cuid())
  owner_id    String
  property_id String?
  subject     String
  createdAt   DateTime @default(now())

  messages  Message[]
  owner     Owner @relation(...)
}

model Message {
  id          String      @id @default(cuid())
  thread_id   String
  author_type AuthorType  // USER | OWNER
  author_id   String
  contenu     String
  lu_at       DateTime?
  createdAt   DateTime    @default(now())

  attachments Document[]
  thread      MessageThread @relation(...)
}

model Notification {
  id            String   @id @default(cuid())
  user_id       String?
  owner_user_id String?
  type          NotificationType
  titre         String
  message       String
  lu            Boolean  @default(false)
  entity_type   String?
  entity_id     String?
  createdAt     DateTime @default(now())
}
```

### Auth & RBAC

```prisma
model User {
  id                String   @id @default(cuid())
  email             String   @unique
  nom               String
  role              UserRole
  // ADMIN | DIRECTION | GESTIONNAIRE | COMPTABLE | SERVICES | TRAVAUX
  password_hash     String
  mfa_secret        String?  // chiffré
  mfa_activé        Boolean  @default(false)
  derniere_connexion DateTime?
  actif             Boolean  @default(true)

  auditLogs   AuditLog[]
}

model OwnerUser {
  id                String   @id @default(cuid())
  owner_id          String
  email             String   @unique
  password_hash     String
  mfa_secret        String?
  mfa_activé        Boolean  @default(false)
  derniere_connexion DateTime?

  owner   Owner @relation(...)
}

model AuditLog {
  id            String   @id @default(cuid())
  user_id       String?
  owner_user_id String?
  action        String
  entity_type   String
  entity_id     String
  valeur_avant  Json?
  valeur_apres  Json?
  ip            String?
  user_agent    String?
  createdAt     DateTime @default(now())
}
```

---

## 4. Modules Fonctionnels & Séquençage

### P1a — Fondations (semaines 1–2)

| Module | Contenu |
|---|---|
| Monorepo Turborepo | Setup deux apps Next.js, packages partagés, Docker Compose |
| Base de données | Prisma schema complet, migrations, seed dev |
| Auth | NextAuth.js v5 — back-office (email+mdp+MFA TOTP) + portail |
| RBAC | Middleware permissions — 6 rôles back-office, 3 rôles portail |
| Design system | shadcn/ui + tokens Provence (Tailwind), Playfair Display + Inter |
| Storage | Client OVH Object Storage (MinIO local en dev) |
| Email | Templates React Email + Resend |
| Rate limiting | Upstash Redis sur routes auth |

### P1b — Core Métier (semaines 3–6)

| Module | Contenu |
|---|---|
| CRM Propriétaires | Fiche owner (individu/SCI), KYC documents, tableau 360° |
| Référentiel Biens | Fiche property, photos, workflow onboarding guidé |
| Assurances & diagnostics | PropertyDocument, alertes J-60/J-30 expiration |
| Mandats | Création, paramétrage honoraires, PDF, Yousign, alertes reconduction |
| Réservations | CRUD, statuts, calcul revenus nets |
| Calendrier | Vue calendrier par bien, blocked dates |
| Tarification | PriceRules saisonnières, séjour minimum |
| Sync Airbnb | Import réservations (webhook + polling), sync dispo et tarifs |
| Listing Airbnb | Gestion contenu listing depuis ERP, push vers Airbnb |
| Voyageurs | Fiche guest, historique séjours |
| Check-in/out | PropertyAccess, envoi auto instructions J-1, codes accès |

### P1c — Comptabilité & Documents (semaines 7–10)

| Module | Contenu |
|---|---|
| Comptabilité mandant | MandantAccount, transactions, solde temps réel |
| CRG | Génération PDF mensuel, calcul reversement, envoi propriétaire |
| Reversements | Génération virement SEPA, avis de reversement PDF |
| Facturation honoraires | Calcul auto depuis mandat, FeeInvoice PDF, numérotation, avoirs, facturation au taux horaire (TimeEntry) |
| Rapprochement bancaire | Import CFONB/OFX, lettrage semi-auto |
| Comptabilité société | CompanyTransaction, TVA collectée, export FEC |
| Travaux & Prestataires | WorkOrder, devis, validation proprio si > seuil, OS, réception |
| GED transverse | Upload/classement, prévisualisation, recherche full-text |
| État des lieux | Formulaire numérique, photos, diff entrée/sortie, Yousign |
| Signature Yousign | Intégration API v3 — tous documents signables |
| Export comptable | FEC, CSV — compatible expert-comptable |

### P1d — Portail Propriétaire (semaines 11–14)

| Module | Contenu |
|---|---|
| Dashboard | Solde mandant, statut biens, prochain reversement, alertes |
| Mes biens | Vue par bien : réservations, revenus, taux occupation, avis |
| Documents | CRG, factures, mandats, devis — classés, téléchargeables |
| Signature en ligne | Validation devis/avenants Yousign embedded |
| Messagerie | Threads sécurisés avec gestionnaire, notifications |
| Historique reversements | Tableau filtrable, export PDF/Excel |
| Notifications | In-app + email + SMS (Twilio) |
| Préférences | Alertes, MFA, langue |
| Planning ménage | Vue semaine — départs/arrivées, prestataires assignés |

### P2 — Valeur Ajoutée

| Module | Contenu |
|---|---|
| Conciergerie & Services | Catalogue, commandes, facturation voyageurs |
| Ménage avancé | Planning prestataires, checklist, photos validation |
| Reporting avancé | Dashboard direction, RevPAR, taux occupation, comparatifs |
| Avis & qualité | Suivi notes Airbnb, réponses gestionnaire |
| Attestations fiscales | Récapitulatif annuel revenus fonciers |
| Multi-canal | Booking.com, Abritel (P3 : moteur réservation direct) |

---

## 5. Gestion Documentaire

Module transverse présent dans toutes les phases.

**Types de documents gérés :**

| Type | Généré par | Signable | Archivage |
|---|---|---|---|
| Mandat de gestion | PDF template | Yousign | 10 ans (Hoguet) |
| Avenant mandat | PDF template | Yousign | 10 ans |
| Devis prestataire | Upload | Yousign (validation proprio) | 5 ans |
| Facture honoraires | PDF généré | Non | 10 ans |
| CRG mensuel | PDF généré | Non | 10 ans |
| Avis de reversement | PDF généré | Non | 10 ans |
| État des lieux | PDF généré | Yousign | Durée bail + 3 ans |
| Attestation fiscale | PDF généré | Non | 6 ans |
| Facture travaux | Upload | Non | 10 ans |
| Photos bien | Upload | Non | Durée mandat |
| Diagnostics | Upload | Non | Durée validité |

**Workflow signature Yousign :**
1. Document généré (PDF) → stocké OVH Object Storage
2. Procédure Yousign créée via API v3
3. Email envoyé au(x) signataire(s)
4. Signataire signe depuis portail ou email
5. Webhook Yousign → mise à jour statut `SIGNED` dans DB
6. Document signé définitif stocké, audit trail créé

---

## 6. Intégrations Externes

| Système | Usage | Phase |
|---|---|---|
| **Airbnb API** | Import réservations, sync dispo/tarifs, gestion listing | P1b |
| **Yousign API v3** | Signature électronique avancée (eIDAS) | P1b/P1c |
| **OVH Object Storage** | Stockage documents chiffré AES-256, France | P1a |
| **Resend** | Emails transactionnels (quittances, alertes, CRG) | P1a |
| **Twilio** | SMS notifications critiques (MFA, impayés, check-in) | P1d |
| **Supabase** | PostgreSQL managé Paris | P1a |
| **Upstash Redis** | Rate limiting, cache sessions | P1a |
| **Booking.com / Abritel** | Channel management étendu | P2 |

---

## 7. Sécurité & Conformité

### Sécurité applicative

| Exigence | Implémentation |
|---|---|
| TLS 1.3 | Vercel (auto) + Supabase (auto) |
| Chiffrement au repos | AES-256 — Supabase + OVH Object Storage |
| MFA obligatoire | TOTP (Authenticator) — back-office et portail |
| Timeout sessions | 30 min back-office / 60 min portail |
| Mots de passe | 12 chars min, bcrypt, rotation annuelle |
| Audit trail | AuditLog sur toute mutation données sensibles |
| RBAC | Middleware Next.js — 6 rôles internes, 3 rôles portail |
| Séparation des tâches | Émission ≠ validation facture (2 users) |
| Rate limiting | Upstash Redis — routes auth et API |
| Données en France | Supabase Paris + OVH Object Storage FR |

### Conformité réglementaire

| Réglementation | Implémentation |
|---|---|
| Loi Hoguet | Compte mandant isolé par proprio, numérotation mandats, archivage 10 ans immuable |
| RGPD | Consentements, droit effacement, export données, logs traitements |
| FEC | Export fichier écritures comptables conforme art. A47-A-1 LPF |
| eIDAS | Yousign signature avancée (AES) |

---

## 8. UX & Design System

### Back-office (desktop-first)

- Navigation : sidebar fixe + command palette `⌘K`
- Tables : TanStack Table — tri, filtres, pagination, export CSV
- Formulaires : React Hook Form + Zod, validation inline
- Feedback : Sonner toasts, skeleton loaders
- Mode sombre : optionnel (next-themes)
- Notifications in-app : panneau persistant

### Portail Propriétaire (mobile-first, premium)

| Élément | Valeur |
|---|---|
| Typographie titres | Playfair Display |
| Typographie corps | Inter |
| Fond principal | Calcaire `#F4EFEA` |
| CTA / boutons | Olivier `#9BA88D` |
| Texte fort | Garrigue `#8C7566` |
| Accents | Lavande `#A79BBE` |
| Fond secondaire | Argile `#D6B8A8` |
| Border-radius | 8–12px |
| Transitions | 300ms ease — Framer Motion |
| Marges mobile | min 24px |
| Marges desktop | min 80px |
| PWA | Installable iOS / Android |
| Accessibilité | WCAG 2.1 AA |
| i18n | FR obligatoire, structure prête pour EN |
| Vocabulaire | "Vos revenus" (pas "Compte mandant") |

---

## 9. Performance SLA

| Indicateur | Cible |
|---|---|
| Disponibilité | ≥ 99,5% |
| Réponse back-office | < 1,5s (p95) |
| Chargement portail | < 1s |
| Génération PDF | < 3s |
| RPO | ≤ 1h |
| RTO | ≤ 4h |

---

## 10. Phases de Livraison

| Phase | Contenu | Semaines |
|---|---|---|
| P1a | Fondations (monorepo, auth, DB, design system) | 1–2 |
| P1b | Core métier (CRM, biens, mandats, réservations, Airbnb) | 3–6 |
| P1c | Comptabilité, documents, Yousign, travaux | 7–10 |
| P1d | Portail propriétaire complet | 11–14 |
| P2 | Conciergerie, reporting avancé, multi-canal | Après lancement |
