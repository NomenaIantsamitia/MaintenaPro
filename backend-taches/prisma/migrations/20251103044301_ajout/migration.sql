/*
  Warnings:

  - You are about to drop the `Assignation` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "StatutMaintenance" AS ENUM ('PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE');

-- DropForeignKey
ALTER TABLE "public"."Assignation" DROP CONSTRAINT "Assignation_materielId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Assignation" DROP CONSTRAINT "Assignation_technicienId_fkey";

-- DropTable
DROP TABLE "public"."Assignation";

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" SERIAL NOT NULL,
    "materielId" INTEGER NOT NULL,
    "technicienId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "dateDebut" TIMESTAMP(3) NOT NULL,
    "statut" "StatutMaintenance" NOT NULL DEFAULT 'PLANIFIEE',
    "priorite" "Priorite" NOT NULL DEFAULT 'MOYENNE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_materielId_fkey" FOREIGN KEY ("materielId") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
