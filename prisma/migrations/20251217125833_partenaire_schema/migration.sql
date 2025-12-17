/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `User` table. All the data in the column will be lost.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARTENAIRE', 'JOUEUR');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "id",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_user" SERIAL NOT NULL,
ADD COLUMN     "role" "Role"[],
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "username" TEXT NOT NULL,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id_user");

-- CreateTable
CREATE TABLE "Partenaire" (
    "id_partenaire" SERIAL NOT NULL,
    "statut" TEXT NOT NULL,
    "siret" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "adresse" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("id_partenaire")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partenaire_siret_key" ON "Partenaire"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "Partenaire_userId_key" ON "Partenaire"("userId");

-- AddForeignKey
ALTER TABLE "Partenaire" ADD CONSTRAINT "Partenaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;
