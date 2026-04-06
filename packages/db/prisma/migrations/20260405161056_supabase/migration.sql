-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DIRECTION', 'GESTIONNAIRE', 'COMPTABLE', 'SERVICES', 'TRAVAUX');

-- CreateEnum
CREATE TYPE "OwnerType" AS ENUM ('INDIVIDUAL', 'SCI', 'INDIVISION');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('APPARTEMENT', 'VILLA', 'LOFT', 'CHALET', 'AUTRE');

-- CreateEnum
CREATE TYPE "PropertyStatus" AS ENUM ('ACTIF', 'INACTIF', 'TRAVAUX');

-- CreateEnum
CREATE TYPE "MandateStatus" AS ENUM ('ACTIF', 'SUSPENDU', 'RESILIE');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('AIRBNB', 'DIRECT', 'MANUAL');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CHECKEDIN', 'CHECKEDOUT', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PriceRuleType" AS ENUM ('DEFAUT', 'SAISON', 'WEEKEND', 'EVENEMENT');

-- CreateEnum
CREATE TYPE "BlockedReason" AS ENUM ('PROPRIETAIRE', 'TRAVAUX', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "AccessType" AS ENUM ('BOITE_CLES', 'CODE', 'AGENT', 'SERRURE_CONNECTEE');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('OK', 'ERROR', 'PENDING');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('REVENU_SEJOUR', 'HONORAIRES', 'TRAVAUX', 'REVERSEMENT', 'CHARGE', 'AUTRE');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'VALIDATED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('BROUILLON', 'EMISE', 'PAYEE', 'AVOIR');

-- CreateEnum
CREATE TYPE "BankFormat" AS ENUM ('CFONB', 'OFX', 'CSV');

-- CreateEnum
CREATE TYPE "LineStatus" AS ENUM ('NON_LETTREE', 'LETTREE', 'IGNOREE');

-- CreateEnum
CREATE TYPE "CompanyTxType" AS ENUM ('REVENU_HONORAIRES', 'CHARGE', 'TVA_COLLECTEE', 'TVA_DEDUCTIBLE', 'AUTRE');

-- CreateEnum
CREATE TYPE "Journal" AS ENUM ('VENTES', 'ACHATS', 'BANQUE', 'OD');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'PROBLEME');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('NORMALE', 'URGENTE', 'CRITIQUE');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('OUVERT', 'EN_COURS', 'EN_ATTENTE_DEVIS', 'EN_ATTENTE_VALIDATION', 'VALIDE', 'TERMINE', 'ANNULE');

-- CreateEnum
CREATE TYPE "Imputation" AS ENUM ('PROPRIETAIRE', 'SOCIETE');

-- CreateEnum
CREATE TYPE "InventoryType" AS ENUM ('ENTREE', 'SORTIE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MANDAT', 'AVENANT', 'DEVIS', 'FACTURE', 'CRG', 'ETAT_LIEUX', 'ATTESTATION_FISCALE', 'PHOTO', 'DIAGNOSTIC', 'AUTRE');

-- CreateEnum
CREATE TYPE "SignatureStatus" AS ENUM ('NONE', 'PENDING', 'SIGNED', 'REFUSED');

-- CreateEnum
CREATE TYPE "LegalDocType" AS ENUM ('DPE', 'ELECTRICITE', 'GAZ', 'PLOMB', 'AMIANTE', 'PNO', 'AUTRE');

-- CreateEnum
CREATE TYPE "DocStatus" AS ENUM ('VALIDE', 'EXPIRE', 'MANQUANT');

-- CreateEnum
CREATE TYPE "ServiceUnit" AS ENUM ('ACTE', 'HEURE', 'NUIT', 'MOIS');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AuthorType" AS ENUM ('USER', 'OWNER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "password_hash" TEXT NOT NULL,
    "mfa_secret" TEXT,
    "mfa_active" BOOLEAN NOT NULL DEFAULT false,
    "derniere_connexion" TIMESTAMP(3),
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owner_users" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "mfa_secret" TEXT,
    "mfa_active" BOOLEAN NOT NULL DEFAULT false,
    "derniere_connexion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owner_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "owner_user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "valeur_avant" JSONB,
    "valeur_apres" JSONB,
    "ip" TEXT,
    "user_agent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "type" "OwnerType" NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telephone" TEXT,
    "adresse" JSONB NOT NULL,
    "rib_iban" TEXT,
    "nif" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" JSONB NOT NULL,
    "type" "PropertyType" NOT NULL,
    "superficie" DOUBLE PRECISION NOT NULL,
    "nb_chambres" INTEGER NOT NULL,
    "capacite_voyageurs" INTEGER NOT NULL,
    "amenities" TEXT[],
    "airbnb_listing_id" TEXT,
    "statut" "PropertyStatus" NOT NULL DEFAULT 'ACTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandates" (
    "id" TEXT NOT NULL,
    "numero_mandat" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3),
    "statut" "MandateStatus" NOT NULL DEFAULT 'ACTIF',
    "taux_honoraires" DOUBLE PRECISION NOT NULL,
    "honoraires_location" DOUBLE PRECISION,
    "seuil_validation_devis" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "taux_horaire_ht" DOUBLE PRECISION,
    "prestations_incluses" TEXT[],
    "reconduction_tacite" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandate_amendments" (
    "id" TEXT NOT NULL,
    "mandate_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "modifications" JSONB NOT NULL,
    "document_id" TEXT,
    "statut_signature" "SignatureStatus" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mandate_amendments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guests" (
    "id" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "platform_guest_id" TEXT,
    "langue" TEXT NOT NULL DEFAULT 'fr',
    "nb_sejours" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "guest_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL DEFAULT 'AIRBNB',
    "platform_booking_id" TEXT,
    "check_in" TIMESTAMP(3) NOT NULL,
    "check_out" TIMESTAMP(3) NOT NULL,
    "nb_nuits" INTEGER NOT NULL,
    "nb_voyageurs" INTEGER NOT NULL,
    "statut" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "montant_total" DOUBLE PRECISION NOT NULL,
    "frais_menage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "commission_plateforme" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revenu_net_proprietaire" DOUBLE PRECISION NOT NULL,
    "notes_internes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_rules" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "type" "PriceRuleType" NOT NULL DEFAULT 'DEFAUT',
    "nom" TEXT,
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "jours_semaine" INTEGER[],
    "prix_nuit" DOUBLE PRECISION NOT NULL,
    "sejour_min" INTEGER NOT NULL DEFAULT 1,
    "priorite" INTEGER NOT NULL DEFAULT 0,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_dates" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "motif" "BlockedReason" NOT NULL DEFAULT 'PROPRIETAIRE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_dates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_accesses" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "type_acces" "AccessType" NOT NULL,
    "code_acces" TEXT,
    "instructions_arrivee" TEXT,
    "wifi_nom" TEXT,
    "wifi_mdp" TEXT,
    "notes_depart" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_accesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "airbnb_listings" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "titre" TEXT,
    "description" TEXT,
    "regles_maison" TEXT,
    "statut_sync" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "derniere_sync" TIMESTAMP(3),
    "erreurs_sync" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "airbnb_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mandant_accounts" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "solde_courant" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "solde_sequestre" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mandant_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "mandant_account_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "fee_invoice_id" TEXT,
    "work_order_id" TEXT,
    "type" "TransactionType" NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "statut" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "piece_jointe_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "management_reports" (
    "id" TEXT NOT NULL,
    "mandant_account_id" TEXT NOT NULL,
    "periode_debut" TIMESTAMP(3) NOT NULL,
    "periode_fin" TIMESTAMP(3) NOT NULL,
    "revenus_sejours" DOUBLE PRECISION NOT NULL,
    "honoraires_deduits" DOUBLE PRECISION NOT NULL,
    "charges_deduites" DOUBLE PRECISION NOT NULL,
    "montant_reverse" DOUBLE PRECISION NOT NULL,
    "date_virement" TIMESTAMP(3),
    "document_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "management_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_invoices" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "numero_facture" TEXT NOT NULL,
    "periode_debut" TIMESTAMP(3) NOT NULL,
    "periode_fin" TIMESTAMP(3) NOT NULL,
    "montant_ht" DOUBLE PRECISION NOT NULL,
    "tva_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "montant_ttc" DOUBLE PRECISION NOT NULL,
    "statut" "InvoiceStatus" NOT NULL DEFAULT 'BROUILLON',
    "document_id" TEXT,
    "avoir_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_entries" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "property_id" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "nb_heures" DOUBLE PRECISION NOT NULL,
    "taux_horaire" DOUBLE PRECISION NOT NULL,
    "montant_ht" DOUBLE PRECISION NOT NULL,
    "fee_invoice_id" TEXT,
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_statements" (
    "id" TEXT NOT NULL,
    "fichier_nom" TEXT NOT NULL,
    "format" "BankFormat" NOT NULL,
    "date_import" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nb_lignes" INTEGER NOT NULL,
    "montant_total" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "bank_statements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_lines" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "libelle" TEXT NOT NULL,
    "montant" DOUBLE PRECISION NOT NULL,
    "statut" "LineStatus" NOT NULL DEFAULT 'NON_LETTREE',
    "transaction_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bank_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_transactions" (
    "id" TEXT NOT NULL,
    "type" "CompanyTxType" NOT NULL,
    "montant_ht" DOUBLE PRECISION NOT NULL,
    "tva_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "montant_ttc" DOUBLE PRECISION NOT NULL,
    "journal" "Journal" NOT NULL,
    "libelle" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fee_invoice_id" TEXT,
    "piece_jointe_id" TEXT,
    "lettree" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cleaning_tasks" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "prestataire_id" TEXT,
    "date_prevue" TIMESTAMP(3) NOT NULL,
    "date_realisation" TIMESTAMP(3),
    "statut" "TaskStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "checklist" JSONB[],
    "photos" TEXT[],
    "notes" TEXT,
    "schedule_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cleaning_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cleaning_schedules" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "semaine" TIMESTAMP(3) NOT NULL,
    "prestataire_id" TEXT,
    "statut_global" "TaskStatus" NOT NULL DEFAULT 'PLANIFIEE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cleaning_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "contractor_id" TEXT,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "urgence" "Urgency" NOT NULL DEFAULT 'NORMALE',
    "statut" "WorkOrderStatus" NOT NULL DEFAULT 'OUVERT',
    "imputable_a" "Imputation" NOT NULL DEFAULT 'PROPRIETAIRE',
    "devis_id" TEXT,
    "facture_id" TEXT,
    "created_by" TEXT NOT NULL,
    "montant_devis" DOUBLE PRECISION,
    "notes_devis" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "metier" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT,
    "siret" TEXT,
    "assurance_rc_pro" TIMESTAMP(3),
    "assurance_decennale" TIMESTAMP(3),
    "notes" TEXT,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_inventories" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "type" "InventoryType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "realise_par" TEXT NOT NULL,
    "pieces" JSONB[],
    "comparaison_id" TEXT,
    "yousign_procedure_id" TEXT,
    "signe_voyageur" BOOLEAN NOT NULL DEFAULT false,
    "signe_agent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL,
    "nom" TEXT NOT NULL,
    "url_storage" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "taille" INTEGER NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "statut_signature" "SignatureStatus" NOT NULL DEFAULT 'NONE',
    "yousign_procedure_id" TEXT,
    "uploaded_by" TEXT NOT NULL,
    "owner_id" TEXT,
    "mandate_id" TEXT,
    "contractor_id" TEXT,
    "booking_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_documents" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "type" "LegalDocType" NOT NULL,
    "date_validite" TIMESTAMP(3),
    "statut" "DocStatus" NOT NULL DEFAULT 'MANQUANT',
    "document_id" TEXT,
    "alertes_envoyees" JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "categorie" TEXT NOT NULL,
    "tarif" DOUBLE PRECISION NOT NULL,
    "unite" "ServiceUnit" NOT NULL,
    "tva_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    "actif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_orders" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "booking_id" TEXT,
    "guest_id" TEXT,
    "service_id" TEXT NOT NULL,
    "quantite" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "montant_total" DOUBLE PRECISION NOT NULL,
    "statut" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "date_realisation" TIMESTAMP(3),
    "facture_id" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "note_globale" DOUBLE PRECISION NOT NULL,
    "note_proprete" DOUBLE PRECISION,
    "note_communication" DOUBLE PRECISION,
    "commentaire_voyageur" TEXT,
    "reponse_gestionnaire" TEXT,
    "date_avis" TIMESTAMP(3) NOT NULL,
    "synced_from_airbnb" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_threads" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "property_id" TEXT,
    "subject" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "message_threads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "author_type" "AuthorType" NOT NULL,
    "author_id" TEXT NOT NULL,
    "contenu" TEXT NOT NULL,
    "lu_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "owner_user_id" TEXT,
    "type" TEXT NOT NULL,
    "titre" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "lu" BOOLEAN NOT NULL DEFAULT false,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DocumentToMessage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "owner_users_email_key" ON "owner_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "owners_email_key" ON "owners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "properties_airbnb_listing_id_key" ON "properties"("airbnb_listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "mandates_numero_mandat_key" ON "mandates"("numero_mandat");

-- CreateIndex
CREATE UNIQUE INDEX "mandates_property_id_key" ON "mandates"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_platform_booking_id_key" ON "bookings"("platform_booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_accesses_property_id_key" ON "property_accesses"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_listings_property_id_key" ON "airbnb_listings"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "airbnb_listings_listing_id_key" ON "airbnb_listings"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "mandant_accounts_owner_id_key" ON "mandant_accounts"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "fee_invoices_numero_facture_key" ON "fee_invoices"("numero_facture");

-- CreateIndex
CREATE UNIQUE INDEX "bank_lines_transaction_id_key" ON "bank_lines"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "cleaning_tasks_booking_id_key" ON "cleaning_tasks"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "_DocumentToMessage_AB_unique" ON "_DocumentToMessage"("A", "B");

-- CreateIndex
CREATE INDEX "_DocumentToMessage_B_index" ON "_DocumentToMessage"("B");

-- AddForeignKey
ALTER TABLE "owner_users" ADD CONSTRAINT "owner_users_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandates" ADD CONSTRAINT "mandates_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandates" ADD CONSTRAINT "mandates_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandate_amendments" ADD CONSTRAINT "mandate_amendments_mandate_id_fkey" FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_rules" ADD CONSTRAINT "price_rules_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocked_dates" ADD CONSTRAINT "blocked_dates_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_accesses" ADD CONSTRAINT "property_accesses_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "airbnb_listings" ADD CONSTRAINT "airbnb_listings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mandant_accounts" ADD CONSTRAINT "mandant_accounts_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_mandant_account_id_fkey" FOREIGN KEY ("mandant_account_id") REFERENCES "mandant_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "management_reports" ADD CONSTRAINT "management_reports_mandant_account_id_fkey" FOREIGN KEY ("mandant_account_id") REFERENCES "mandant_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_invoices" ADD CONSTRAINT "fee_invoices_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_fee_invoice_id_fkey" FOREIGN KEY ("fee_invoice_id") REFERENCES "fee_invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_lines" ADD CONSTRAINT "bank_lines_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "bank_statements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_lines" ADD CONSTRAINT "bank_lines_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_tasks" ADD CONSTRAINT "cleaning_tasks_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_tasks" ADD CONSTRAINT "cleaning_tasks_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_tasks" ADD CONSTRAINT "cleaning_tasks_prestataire_id_fkey" FOREIGN KEY ("prestataire_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_tasks" ADD CONSTRAINT "cleaning_tasks_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "cleaning_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_schedules" ADD CONSTRAINT "cleaning_schedules_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cleaning_schedules" ADD CONSTRAINT "cleaning_schedules_prestataire_id_fkey" FOREIGN KEY ("prestataire_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inventories" ADD CONSTRAINT "property_inventories_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_inventories" ADD CONSTRAINT "property_inventories_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_mandate_id_fkey" FOREIGN KEY ("mandate_id") REFERENCES "mandates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_documents" ADD CONSTRAINT "property_documents_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "guests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_orders" ADD CONSTRAINT "service_orders_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "service_catalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "message_threads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToMessage" ADD CONSTRAINT "_DocumentToMessage_A_fkey" FOREIGN KEY ("A") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocumentToMessage" ADD CONSTRAINT "_DocumentToMessage_B_fkey" FOREIGN KEY ("B") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
