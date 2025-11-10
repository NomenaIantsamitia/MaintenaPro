import { Request, Response } from "express";
import { RapportService } from "../services/rapport.service";

export class RapportController {
  static async getRapport(req: Request, res: Response) {
    try {
      const maintenanceId = parseInt(req.params.maintenanceId);
      const rapport = await RapportService.getRapportByMaintenanceId(maintenanceId);

      if (!rapport) {
        return res.status(200).json([]); // pour compatibilité avec ton frontend
      }

      return res.status(200).json([rapport]);
    } catch (error) {
      console.error("Erreur récupération rapport :", error);
      res.status(500).json({ message: "Erreur lors de la récupération du rapport." });
    }
  }

  static async addOrUpdateRapport(req: Request, res: Response) {
    try {
      const { maintenanceId, contenu } = req.body;

      if (!maintenanceId || !contenu) {
        return res.status(400).json({ message: "maintenanceId et contenu sont requis." });
      }

      const rapport = await RapportService.upsertRapport(Number(maintenanceId), contenu);

      return res.status(200).json({
        message: "Rapport ajouté ou mis à jour avec succès.",
        rapport,
      });
    } catch (error) {
      console.error("Erreur ajout/modification rapport :", error);
      res.status(500).json({ message: "Erreur lors de l’ajout ou la mise à jour du rapport." });
    }
  }
}
