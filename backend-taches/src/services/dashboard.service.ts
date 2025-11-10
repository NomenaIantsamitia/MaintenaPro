import { prisma } from "../config/prisma";
import { startOfYear, endOfYear } from "date-fns";
export class DashboardService{
    async getTotalMateriel(){
        return prisma.materiel.count()
    }

    async getTechniciensActifs() {
        return prisma.utilisateur.count({
          where: {
            role: "TECHNICIEN",
            status: "ACTIF",
          },
        });
      }

      // 🔹 Total des maintenances en cours
  async getMaintenancesEnCours() {
    return prisma.maintenance.count({
      where: {
        statut: "EN_COURS",
      },
    });
  }

    // 🔹 Total des maintenances terminées
    async getMaintenancesTerminees() {
        return prisma.maintenance.count({
          where: {
            statut: "TERMINEE",
          },
        });
      }

      // 🔹 Total des pannes détectées (matériels en panne)
  async getPannesDetectees() {
    return prisma.materiel.count({
      where: {
        statut: "EN_PANNE",
      },
    });
  }

    // ✅ NOUVELLE MÉTHODE
    async getMaintenancesPlanifiees() {
        const total = await prisma.maintenance.count({
          where: { statut: "PLANIFIEE" },
        });
        return { maintenancesPlanifiees: total };
      }

      // 🔹 Total des maintenances annulées
  async getMaintenancesAnnulees() {
    return prisma.maintenance.count({
      where: {
        statut: "ANNULEE",
      },
    });
  }


  async getEvolutionMensuelle() {
    const currentYear = new Date().getFullYear();

    // 🔹 Récupère toutes les maintenances de l’année courante
    const maintenances = await prisma.maintenance.findMany({
      where: {
        createdAt: {
          gte: startOfYear(new Date(currentYear, 0, 1)),
          lte: endOfYear(new Date(currentYear, 11, 31)),
        },
      },
      select: {
        createdAt: true,
      },
    });

    // 🔹 Prépare un tableau mensuel initialisé à 0
    const monthlyCounts = Array(12).fill(0);

    // 🔹 Incrémente selon le mois
    maintenances.forEach((m) => {
      const month = new Date(m.createdAt).getMonth(); // 0 = Janvier
      monthlyCounts[month]++;
    });

    // 🔹 Retourne un tableau compatible avec Recharts
    const months = [
      "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
      "Juil", "Août", "Sept", "Oct", "Nov", "Déc",
    ];

    const data = months.map((mois, index) => ({
      mois,
      maintenances: monthlyCounts[index],
    }));

    return data;
  }
}