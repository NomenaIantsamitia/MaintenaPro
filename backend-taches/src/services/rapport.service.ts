import { prisma } from "../config/prisma";

export class RapportService {
  static async getRapportByMaintenanceId(maintenanceId: number) {
    return prisma.rapport.findUnique({
      where: { maintenanceId },
    });
  }

  static async upsertRapport(maintenanceId: number, contenu: string) {
    const existing = await prisma.rapport.findUnique({
      where: { maintenanceId },
    });

    if (existing) {
      // Mise à jour du rapport existant
      return prisma.rapport.update({
        where: { maintenanceId },
        data: { contenu },
      });
    } else {
      // Création d’un nouveau rapport
      return prisma.rapport.create({
        data: {
          maintenanceId,
          contenu,
        },
      });
    }
  }
}
