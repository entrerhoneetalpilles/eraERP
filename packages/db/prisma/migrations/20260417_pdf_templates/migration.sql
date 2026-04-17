-- CreateEnum
CREATE TYPE IF NOT EXISTS "PdfTemplateType" AS ENUM ('FACTURE', 'DEVIS', 'MANDAT', 'CONTRAT', 'QUITTANCE');

-- CreateTable
CREATE TABLE IF NOT EXISTS "pdf_templates" (
    "id"         TEXT NOT NULL,
    "nom"        TEXT NOT NULL,
    "type"       "PdfTemplateType" NOT NULL,
    "config"     JSONB NOT NULL DEFAULT '{}',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_templates_pkey" PRIMARY KEY ("id")
);
