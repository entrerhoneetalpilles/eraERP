-- AlterTable: Booking — tracking envoi instructions check-in
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "instructions_envoyees" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable: FeeInvoice — tracking relances
ALTER TABLE "fee_invoices" ADD COLUMN IF NOT EXISTS "derniere_relance" TIMESTAMP(3);
ALTER TABLE "fee_invoices" ADD COLUMN IF NOT EXISTS "nb_relances" INTEGER NOT NULL DEFAULT 0;
