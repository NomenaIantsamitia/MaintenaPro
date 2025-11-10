import { Request,Response } from "express";
import { DashboardService } from "../services/dashboard.service";

const dashboardService = new DashboardService()
export class DashboardController{
    async getTotalMaterielsController(req: Request, res: Response) {
        try {
           const total = await dashboardService.getTotalMateriel()
           res.status(200).json({ totalMateriels: total });
        } catch (error:any) {
            console.error("Erreur lors de la récupération du total des matériels:", error);
            res.status(500).json({ message: "Erreur interne du serveur" });
        }
    }

    // ✅ Total des techniciens actifs
  async getTechniciensActifsController(req: Request, res: Response) {
    try {
      const total = await dashboardService.getTechniciensActifs();
      res.status(200).json({ techniciensActifs: total });
    } catch (error) {
      console.error("Erreur techniciens actifs:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }

   // ✅ Total maintenances en cours
   async getMaintenancesEnCoursController(req: Request, res: Response) {
    try {
      const total = await dashboardService.getMaintenancesEnCours();
      res.status(200).json({ maintenancesEnCours: total });
    } catch (error) {
      console.error("Erreur maintenances en cours:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }

    // ✅ Total maintenances terminées
    async getMaintenancesTermineesController(req: Request, res: Response) {
        try {
          const total = await dashboardService.getMaintenancesTerminees();
          res.status(200).json({ maintenancesTerminees: total });
        } catch (error) {
          console.error("Erreur maintenances terminées:", error);
          res.status(500).json({ message: "Erreur interne du serveur" });
        }
      }

      // ✅ Total des pannes détectées
  async getPannesDetecteesController(req: Request, res: Response) {
    try {
      const total = await dashboardService.getPannesDetectees();
      res.status(200).json({ pannesDetectees: total });
    } catch (error) {
      console.error("Erreur pannes détectées:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }

    // ✅ NOUVELLE MÉTHODE
    async getMaintenancesPlanifiees(req: Request, res: Response) {
        const result = await dashboardService.getMaintenancesPlanifiees();
        res.json(result);
      }

    
  // ✅ Nouveau : total des maintenances annulées
  async getMaintenancesAnnuleesController(req: Request, res: Response) {
    try {
      const total = await dashboardService.getMaintenancesAnnulees();
      res.status(200).json({ maintenancesAnnulees: total });
    } catch (error) {
      console.error("Erreur maintenances annulées:", error);
      res.status(500).json({ message: "Erreur interne du serveur" });
    }
  }

  async getEvolutionMensuelle(req: Request, res: Response) {
    try {
      const data = await dashboardService.getEvolutionMensuelle();
      res.json(data);
    } catch (error) {
      console.error("❌ Erreur DashboardController:", error);
      res.status(500).json({ error: "Erreur lors de la récupération des statistiques mensuelles." });
    }
  }
}