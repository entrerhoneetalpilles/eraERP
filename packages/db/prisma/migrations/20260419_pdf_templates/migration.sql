CREATE TABLE IF NOT EXISTS "pdf_templates" (
  "id"         TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "type"       TEXT NOT NULL,
  "config"     JSONB NOT NULL DEFAULT '{}',
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "pdf_templates_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "pdf_templates_type_idx" ON "pdf_templates"("type");
