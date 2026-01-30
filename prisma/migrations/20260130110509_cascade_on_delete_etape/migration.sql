-- DropForeignKey
ALTER TABLE "Etape" DROP CONSTRAINT "Etape_chasse_id_fkey";

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_chasse_id_fkey" FOREIGN KEY ("chasse_id") REFERENCES "Chasse"("id_chasse") ON DELETE CASCADE ON UPDATE CASCADE;
