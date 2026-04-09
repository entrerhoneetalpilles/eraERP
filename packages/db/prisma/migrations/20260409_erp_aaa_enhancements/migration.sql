-- ERP AAA Enhancements Migration
-- Run in Neon/Supabase SQL editor

-- Guest enhancements
ALTER TABLE "guests"
  ADD COLUMN IF NOT EXISTS "nb_annulations" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "nationalite" TEXT,
  ADD COLUMN IF NOT EXISTS "note_interne" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "notes_internes" TEXT,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

UPDATE "guests" SET "updatedAt" = "createdAt" WHERE "updatedAt" IS NULL;

-- Contractor enhancements
ALTER TABLE "contractors"
  ADD COLUMN IF NOT EXISTS "note_qualite" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "nb_evaluations" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "tarif_horaire" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "tarif_forfait_menage" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "zone_intervention" TEXT,
  ADD COLUMN IF NOT EXISTS "delai_intervention_h" INTEGER;

-- CleaningTask enhancements
ALTER TABLE "cleaning_tasks"
  ADD COLUMN IF NOT EXISTS "duree_estimee" INTEGER,
  ADD COLUMN IF NOT EXISTS "duree_reelle" INTEGER,
  ADD COLUMN IF NOT EXISTS "montant" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "note_qualite" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "note_agent" TEXT;

-- WorkOrder enhancements
ALTER TABLE "work_orders"
  ADD COLUMN IF NOT EXISTS "montant_facture" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "date_debut_prevue" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "date_fin_prevue" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "photos" TEXT[] NOT NULL DEFAULT '{}';
