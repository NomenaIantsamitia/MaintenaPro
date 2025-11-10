-- AlterTable
ALTER TABLE "Utilisateur" ADD COLUMN     "domaineId" INTEGER,
ADD COLUMN     "photo" TEXT;

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_domaineId_fkey" FOREIGN KEY ("domaineId") REFERENCES "Domaine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
