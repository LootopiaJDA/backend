-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PARTENAIRE', 'JOUEUR');

-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('VERIFICATION', 'ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StatutChasse" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED');

-- CreateEnum
CREATE TYPE "StatutUserChasse" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABANDONED');

-- CreateTable
CREATE TABLE "User" (
    "id_user" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'JOUEUR',
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "partenerId" INTEGER,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "Partenaire" (
    "id_partenaire" SERIAL NOT NULL,
    "statut" "Statut" NOT NULL DEFAULT 'VERIFICATION',
    "siret" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "adresse" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partenaire_pkey" PRIMARY KEY ("id_partenaire")
);

-- CreateTable
CREATE TABLE "Chasse" (
    "id_chasse" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "localisation" TEXT NOT NULL,
    "etat" "StatutChasse" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idPartenaire" INTEGER NOT NULL,

    CONSTRAINT "Chasse_pkey" PRIMARY KEY ("id_chasse")
);

-- CreateTable
CREATE TABLE "Occurence" (
    "id_occurence" SERIAL NOT NULL,
    "date_start" TIMESTAMP(3) NOT NULL,
    "date_end" TIMESTAMP(3) NOT NULL,
    "limit_user" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chasse_id" INTEGER NOT NULL,

    CONSTRAINT "Occurence_pkey" PRIMARY KEY ("id_occurence")
);

-- CreateTable
CREATE TABLE "Etape" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "address" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "rayon" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "chasse_id" INTEGER NOT NULL,

    CONSTRAINT "Etape_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id_message" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id_message")
);

-- CreateTable
CREATE TABLE "UserChasse" (
    "id_userchasse" SERIAL NOT NULL,
    "id_user" INTEGER NOT NULL,
    "id_chasse" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "statut" "StatutUserChasse" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "UserChasse_pkey" PRIMARY KEY ("id_userchasse")
);

-- CreateTable
CREATE TABLE "UserChasseEtape" (
    "id_userchasseetape" SERIAL NOT NULL,
    "id_userchasse" INTEGER NOT NULL,
    "id_etape" INTEGER NOT NULL,
    "reached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserChasseEtape_pkey" PRIMARY KEY ("id_userchasseetape")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Partenaire_siret_key" ON "Partenaire"("siret");

-- CreateIndex
CREATE INDEX "Etape_chasse_id_idx" ON "Etape"("chasse_id");

-- CreateIndex
CREATE INDEX "UserChasse_id_user_idx" ON "UserChasse"("id_user");

-- CreateIndex
CREATE INDEX "UserChasse_id_chasse_idx" ON "UserChasse"("id_chasse");

-- CreateIndex
CREATE UNIQUE INDEX "UserChasse_id_user_id_chasse_key" ON "UserChasse"("id_user", "id_chasse");

-- CreateIndex
CREATE INDEX "UserChasseEtape_id_userchasse_idx" ON "UserChasseEtape"("id_userchasse");

-- CreateIndex
CREATE INDEX "UserChasseEtape_id_etape_idx" ON "UserChasseEtape"("id_etape");

-- CreateIndex
CREATE UNIQUE INDEX "UserChasseEtape_id_userchasse_id_etape_key" ON "UserChasseEtape"("id_userchasse", "id_etape");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_partenerId_fkey" FOREIGN KEY ("partenerId") REFERENCES "Partenaire"("id_partenaire") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chasse" ADD CONSTRAINT "Chasse_idPartenaire_fkey" FOREIGN KEY ("idPartenaire") REFERENCES "Partenaire"("id_partenaire") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Occurence" ADD CONSTRAINT "Occurence_chasse_id_fkey" FOREIGN KEY ("chasse_id") REFERENCES "Chasse"("id_chasse") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Etape" ADD CONSTRAINT "Etape_chasse_id_fkey" FOREIGN KEY ("chasse_id") REFERENCES "Chasse"("id_chasse") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChasse" ADD CONSTRAINT "UserChasse_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "User"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChasse" ADD CONSTRAINT "UserChasse_id_chasse_fkey" FOREIGN KEY ("id_chasse") REFERENCES "Chasse"("id_chasse") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChasseEtape" ADD CONSTRAINT "UserChasseEtape_id_userchasse_fkey" FOREIGN KEY ("id_userchasse") REFERENCES "UserChasse"("id_userchasse") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChasseEtape" ADD CONSTRAINT "UserChasseEtape_id_etape_fkey" FOREIGN KEY ("id_etape") REFERENCES "Etape"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
