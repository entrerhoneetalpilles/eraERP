-- Add locataire manual-entry fields to property_inventories
ALTER TABLE "property_inventories"
  ADD COLUMN IF NOT EXISTS "locataire_nom"    TEXT,
  ADD COLUMN IF NOT EXISTS "locataire_prenom" TEXT,
  ADD COLUMN IF NOT EXISTS "locataire_email"  TEXT,
  ADD COLUMN IF NOT EXISTS "locataire_tel"    TEXT;
