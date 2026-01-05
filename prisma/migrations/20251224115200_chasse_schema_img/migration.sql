/*
  Warnings:

  - Changed the type of `image` on the `Chasse` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Made the column `updated_at` on table `Partenaire` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Chasse" DROP COLUMN "image",
ADD COLUMN     "image" BYTEA NOT NULL;

-- AlterTable
ALTER TABLE "Partenaire" ALTER COLUMN "updated_at" SET NOT NULL;
