/*
  Warnings:

  - Added the required column `domaineId` to the `Categorie` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Categorie" ADD COLUMN     "domaineId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "Domaine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
