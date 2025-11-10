import { Request, Response } from "express";
import { UtilisateurService } from "../services/utilisateur.service";

const utilisateurService = new UtilisateurService()
export class UtilisateurController{
  async inscrire(req:Request,res:Response){
    try {
      const { nom_complet, email, password, domaineId, role, status } = req.body;

      const photo = req.file ? `/uploads/${req.file.filename}` : undefined;

      const utilisateur = await utilisateurService.create({
        nom_complet,
        email,
        password,
        domaineId: Number(domaineId),
        role,
        status,
        photo,
      });

      res.status(201).json(utilisateur);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Erreur lors de l'inscription." });
    }
  }

  async connexion(req:Request,res:Response){
    try {
      const result = await utilisateurService.login(req.body)
      res.json(result);
    } catch (error : any) {
      res.status(401).json({ message: error.message });
    }
  }

  async listerUtilisateurs(req:Request,res:Response){
    try {
      const utilisateurs = await utilisateurService.getUtisateurs()
      res.status(200).json(utilisateurs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erreur lors de la récupération des utilisateurs." });
    }
  }

  async supprimerUtilisateur(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ error: "ID invalide" });
      }

      const result = await utilisateurService.supprimerUtilisateur(id);
      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Erreur lors de la suppression :", error.message);
      return res.status(404).json({ error: error.message });
    }
  }

  async modifierStatusUtilisateur(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { status } = req.body;

      if (!["ACTIF", "INACTIF"].includes(status)) {
        return res.status(400).json({ error: "Statut invalide" });
      }

      const utilisateur = await utilisateurService.updateUtilisateurStatus(id, status as "ACTIF" | "INACTIF");

      return res.status(200).json({
        message: "✅ Statut mis à jour avec succès",
        utilisateur,
      });
    } catch (error: any) {
      console.error("Erreur modification statut:", error.message);
      return res.status(400).json({ error: error.message });
    }
  }

  
}