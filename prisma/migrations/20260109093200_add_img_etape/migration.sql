/*
  Warnings:

  - Added the required column `image` to the `Etape` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Etape" ADD COLUMN     "image" TEXT NOT NULL;
