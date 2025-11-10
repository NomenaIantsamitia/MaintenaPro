/*
  Warnings:

  - A unique constraint covering the columns `[maintenanceId]` on the table `Rapport` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Rapport_maintenanceId_key" ON "Rapport"("maintenanceId");
