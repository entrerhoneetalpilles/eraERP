-- AlterTable FeeInvoice: add enterprise billing fields
ALTER TABLE "fee_invoices"
  ADD COLUMN IF NOT EXISTS "objet"              TEXT,
  ADD COLUMN IF NOT EXISTS "remise_pourcent"    DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "date_echeance"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "date_paiement"      TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "mode_paiement"      TEXT,
  ADD COLUMN IF NOT EXISTS "reference_paiement" TEXT,
  ADD COLUMN IF NOT EXISTS "notes"              TEXT,
  ADD COLUMN IF NOT EXISTS "notes_client"       TEXT;

-- CreateTable InvoiceLineItem
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

-- AddForeignKey
ALTER TABLE "invoice_line_items"
  ADD CONSTRAINT "invoice_line_items_invoice_id_fkey"
  FOREIGN KEY ("invoice_id")
  REFERENCES "fee_invoices"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
