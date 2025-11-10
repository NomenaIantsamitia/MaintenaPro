-- CreateTable
CREATE TABLE "Rapport" (
    "id" SERIAL NOT NULL,
    "maintenanceId" INTEGER NOT NULL,
    "contenu" TEXT NOT NULL,
    "dateRapport" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rapport_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Rapport" ADD CONSTRAINT "Rapport_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
