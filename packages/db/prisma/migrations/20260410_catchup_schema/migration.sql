-- =============================================================================
-- CATCHUP MIGRATION — applies all schema changes that were baselined without
-- being executed. Every statement is idempotent (IF NOT EXISTS / IF EXISTS).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 20260406134102_extend_message_thread
-- ---------------------------------------------------------------------------

ALTER TABLE "message_threads"
  ADD COLUMN IF NOT EXISTS "contact_type" TEXT NOT NULL DEFAULT 'autre',
  ADD COLUMN IF NOT EXISTS "contractor_id" TEXT,
  ADD COLUMN IF NOT EXISTS "folder" TEXT NOT NULL DEFAULT 'inbox',
  ADD COLUMN IF NOT EXISTS "guest_id" TEXT,
  ADD COLUMN IF NOT EXISTS "resend_id" TEXT;

ALTER TABLE "message_threads" ALTER COLUMN "owner_id" DROP NOT NULL;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'message_threads_contractor_id_fkey'
  ) THEN
    ALTER TABLE "message_threads"
      ADD CONSTRAINT "message_threads_contractor_id_fkey"
      FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'message_threads_guest_id_fkey'
  ) THEN
    ALTER TABLE "message_threads"
      ADD CONSTRAINT "message_threads_guest_id_fkey"
      FOREIGN KEY ("guest_id") REFERENCES "guests"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 20260409_document_expiration
-- ---------------------------------------------------------------------------

ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "date_expiration" TIMESTAMP(3);

-- ---------------------------------------------------------------------------
-- 20260409_erp_aaa_enhancements
-- ---------------------------------------------------------------------------

ALTER TABLE "guests"
  ADD COLUMN IF NOT EXISTS "nb_annulations" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "nationalite" TEXT,
  ADD COLUMN IF NOT EXISTS "note_interne" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "notes_internes" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

ALTER TABLE "contractors"
  ADD COLUMN IF NOT EXISTS "note_qualite" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "nb_evaluations" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tarif_horaire" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "tarif_forfait_menage" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "zone_intervention" TEXT,
  ADD COLUMN IF NOT EXISTS "delai_intervention_h" INTEGER;

ALTER TABLE "cleaning_tasks"
  ADD COLUMN IF NOT EXISTS "duree_estimee" INTEGER,
  ADD COLUMN IF NOT EXISTS "duree_reelle" INTEGER,
  ADD COLUMN IF NOT EXISTS "montant" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "note_qualite" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "note_agent" TEXT;

ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "checkin_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "checkout_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "checkin_checklist" JSONB,
  ADD COLUMN IF NOT EXISTS "checkout_checklist" JSONB;

ALTER TABLE "work_orders"
  ADD COLUMN IF NOT EXISTS "devis_accepte" BOOLEAN,
  ADD COLUMN IF NOT EXISTS "devis_montant" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "devis_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "facture_montant" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "facture_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "facture_document_id" TEXT;

-- ---------------------------------------------------------------------------
-- 20260409_facturation_enterprise
-- ---------------------------------------------------------------------------

ALTER TABLE "fee_invoices"
  ADD COLUMN IF NOT EXISTS "objet"              TEXT,
  ADD COLUMN IF NOT EXISTS "remise_pourcent"    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "date_echeance"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "date_paiement"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "mode_paiement"      TEXT,
  ADD COLUMN IF NOT EXISTS "reference_paiement" TEXT,
  ADD COLUMN IF NOT EXISTS "notes"              TEXT,
  ADD COLUMN IF NOT EXISTS "notes_client"       TEXT;

CREATE TABLE IF NOT EXISTS "invoice_line_items" (
  "id"            TEXT NOT NULL,
  "invoice_id"    TEXT NOT NULL,
  "description"   TEXT NOT NULL,
  "quantite"      DOUBLE PRECISION NOT NULL DEFAULT 1,
  "unite"         TEXT NOT NULL DEFAULT 'forfait',
  "prix_unitaire" DOUBLE PRECISION NOT NULL,
  "montant_ht"    DOUBLE PRECISION NOT NULL,
  "tva_rate"      DOUBLE PRECISION NOT NULL DEFAULT 0.20,
  "ordre"         INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "invoice_line_items_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'invoice_line_items_invoice_id_fkey'
  ) THEN
    ALTER TABLE "invoice_line_items"
      ADD CONSTRAINT "invoice_line_items_invoice_id_fkey"
      FOREIGN KEY ("invoice_id") REFERENCES "fee_invoices"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 20260409_infrastructure_transversale
-- ---------------------------------------------------------------------------

ALTER TABLE "bookings"
  ADD COLUMN IF NOT EXISTS "instructions_envoyees" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "fee_invoices"
  ADD COLUMN IF NOT EXISTS "derniere_relance" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "nb_relances"      INTEGER NOT NULL DEFAULT 0;
