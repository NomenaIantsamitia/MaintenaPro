import { Request, Response } from "express";
import { CategorieService } from "../services/categorie.service";

const categorieService = new CategorieService();

export class CategorieController {
  async create(req: Request, res: Response) {
    try {
      const { nom, description, domaineId } = req.body;
      if (!nom || !domaineId) {
        return res.status(400).json({ message: "Nom et domaineId sont requis" });
      }
      const newCategorie = await categorieService.create({
        nom,
        description,
        domaineId : Number(domaineId)
      })

      return res.status(201).json({
        message: "Catégorie créée avec succès",
        data: newCategorie,
      });
    } catch (error:any) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    const categories = await categorieService.findAll();
    res.json(categories);
  }

  async getOne(req: Request, res: Response) {
    const id = Number(req.params.id);
    const categorie = await categorieService.findOne(id);
    if (!categorie) {
      return res.status(404).json({ message: "Catégorie non trouvée" });
    }
    res.json(categorie);
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const updated = await categorieService.update(id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({
        message: "Erreur lors de la mise à jour",
        error,
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      await categorieService.delete(id);
      res.json({ message: "Catégorie supprimée avec succès" });
    } catch (error) {
      res.status(400).json({
        message: "Erreur lors de la suppression",
        error,
      });
    }
  }
}
