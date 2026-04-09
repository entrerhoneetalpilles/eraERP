-- AlterTable: Document — date d'expiration pour alertes conformité
ALTER TABLE "documents" ADD COLUMN IF NOT EXISTS "date_expiration" TIMESTAMP(3);
