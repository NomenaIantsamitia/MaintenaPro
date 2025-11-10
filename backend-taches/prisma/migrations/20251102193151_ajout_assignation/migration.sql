-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('BASSE', 'MOYENNE', 'HAUTE', 'URGENTE');

-- CreateTable
CREATE TABLE "Assignation" (
    "id" SERIAL NOT NULL,
    "materielId" INTEGER NOT NULL,
    "technicienId" INTEGER NOT NULL,
    "dateDebutPrevue" TIMESTAMP(3) NOT NULL,
    "priorite" "Priorite" NOT NULL DEFAULT 'MOYENNE',
    "descriptionTache" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Assignation" ADD CONSTRAINT "Assignation_materielId_fkey" FOREIGN KEY ("materielId") REFERENCES "Materiel"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignation" ADD CONSTRAINT "Assignation_technicienId_fkey" FOREIGN KEY ("technicienId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
