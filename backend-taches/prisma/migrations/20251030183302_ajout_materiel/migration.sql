-- CreateEnum
CREATE TYPE "StatutMateriel" AS ENUM ('ACTIF', 'EN_MAINTENANCE', 'EN_PANNE', 'STOCK');

-- CreateTable
CREATE TABLE "Materiel" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "numeroSerie" TEXT NOT NULL,
    "statut" "StatutMateriel" NOT NULL DEFAULT 'STOCK',
    "dateAcquisition" TIMESTAMP(3) NOT NULL,
    "categorieId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Materiel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Materiel_numeroSerie_key" ON "Materiel"("numeroSerie");

-- AddForeignKey
ALTER TABLE "Materiel" ADD CONSTRAINT "Materiel_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
