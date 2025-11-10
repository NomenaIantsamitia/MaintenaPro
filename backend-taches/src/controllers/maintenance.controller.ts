import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import { CreateMaintenanceDto, UpdateMaintenanceDto } from "../dtos/maintenance.dto";
import { validate } from "class-validator";
import { MaintenanceService } from "../services/maintenance.service";
const maintenanceService = new MaintenanceService();
export class MaintenanceController {
    async create(req: Request, res: Response): Promise<void>{
      try {
        const dto = plainToInstance(CreateMaintenanceDto, req.body);
        const errors = await validate(dto);
  
        if (errors.length > 0) {
          res.status(400).json({ message: "Données invalides", errors });
          return;
        }
  
        const maintenance = await maintenanceService.create(dto);
        res.status(201).json({
          message: "Maintenance créée avec succès ✅",
          data: maintenance,
        });
      } catch (error:any) {
            res.status(500).json({
                message: "Erreur serveur",
                error: (error as Error).message,
              });
        }
    }  
    async getMaterielsEnPanne(req: Request, res: Response){
      try {
        const materiels = await maintenanceService.getMaterielsEnPanne()
        res.status(200).json({ message: "Liste des matériels en panne", data: materiels });
      } catch (error:any) {
        res.status(500).json({ message: "Erreur serveur", error: (error as Error).message });
      }
    }

    async getTechniciensDuDomaineDesPannes(req: Request, res: Response){
      try {
        const techniciens = await maintenanceService.getTechniciensDuDomaineDesPannes();
        res.status(200).json({
          message: "Techniciens des domaines contenant des matériels en panne",
          data: techniciens,
        });
      } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: (error as Error).message });
      }
    }

    async getAll(req: Request, res: Response) {
      try {
        const maintenances = await maintenanceService.getAllMaintenances();
        res.status(200).json({
          message: "Liste des maintenances récupérée avec succès ✅",
          data: maintenances,
        });
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
        res.status(500).json({
          message: "Erreur interne du serveur",
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    async update(req: Request, res: Response) {
      try {
        const id = Number(req.params.id);
        const dto = plainToInstance(UpdateMaintenanceDto, req.body);
  
        const errors = await validate(dto);
        if (errors.length > 0) {
          return res.status(400).json({
            message: "Erreur de validation",
            errors: errors.map(e => e.constraints),
          });
        }
  
        const maintenance = await maintenanceService.updateMaintenance(id, dto);
        return res.status(200).json({
          message: "Maintenance mise à jour avec succès",
          data: maintenance,
        });
      } catch (error: any) {
        return res.status(500).json({
          message: "Erreur lors de la mise à jour de la maintenance",
          error: error.message,
        });
      }
    
    }

    async supprimer(req: Request, res: Response) {
      try {
        const id = parseInt(req.params.id, 10);
  
        if (isNaN(id)) {
          return res.status(400).json({ message: "ID invalide" });
        }
  
        const resultat = await maintenanceService.supprimerMaintenance(id);
        return res.status(200).json(resultat);
      } catch (error: any) {
        return res.status(404).json({ message: error.message });
      }
    }

    async getByTechnicien(req:Request,res:Response){
      return maintenanceService.getByTechnicien(req,res)
    }

      // ✅ Changer le statut
  async changerStatut(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const { statut } = req.body;

      const updated = await MaintenanceService.updateStatut(id, statut);

      res.json({
        message: "✅ Statut de la maintenance mis à jour avec succès",
        maintenance: updated,
      });
    } catch (error: any) {
      console.error("Erreur changerStatut :", error);
      res.status(500).json({ message: error.message });
    }
  }

  // ✅ Ajouter un rapport
  async ajouterRapport(req: Request, res: Response) {
    try {
      const { maintenanceId, contenu } = req.body;

      const rapport = await MaintenanceService.ajouterRapport(
        parseInt(maintenanceId),
        contenu
      );

      res.json({
        message: "✅ Rapport ajouté avec succès",
        rapport,
      });
    } catch (error: any) {
      console.error("Erreur ajouterRapport :", error);
      res.status(500).json({ message: error.message });
    }
  }


   

   
}
