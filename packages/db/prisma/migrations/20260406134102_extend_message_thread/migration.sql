-- DropForeignKey
ALTER TABLE "message_threads" DROP CONSTRAINT "message_threads_owner_id_fkey";

-- AlterTable
ALTER TABLE "message_threads" ADD COLUMN     "contact_type" TEXT NOT NULL DEFAULT 'autre',
ADD COLUMN     "contractor_id" TEXT,
ADD COLUMN     "folder" TEXT NOT NULL DEFAULT 'inbox',
ADD COLUMN     "guest_id" TEXT,
ADD COLUMN     "resend_id" TEXT,
ALTER COLUMN "owner_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
