/*
  Warnings:

  - The `statut` column on the `Partenaire` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('VERIFICATION', 'ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Partenaire" DROP COLUMN "statut",
ADD COLUMN     "statut" "Statut" NOT NULL DEFAULT 'VERIFICATION';

-- CreateTable
CREATE TABLE "Chasse" (
    "id_chasse" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "localisation" TEXT NOT NULL,
    "id_partenaire" INTEGER NOT NULL,
    "lat" TEXT NOT NULL,
    "long" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idPartenaire" INTEGER NOT NULL,

    CONSTRAINT "Chasse_pkey" PRIMARY KEY ("id_chasse")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chasse_idPartenaire_key" ON "Chasse"("idPartenaire");

-- AddForeignKey
ALTER TABLE "Chasse" ADD CONSTRAINT "Chasse_idPartenaire_fkey" FOREIGN KEY ("idPartenaire") REFERENCES "Partenaire"("id_partenaire") ON DELETE RESTRICT ON UPDATE CASCADE;
