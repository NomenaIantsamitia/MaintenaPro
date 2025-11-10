import { Request, Response } from "express";
import { MaterielService } from "../services/materiel.service";

const materielService = new MaterielService();

export class MaterielController {
 
    async ajouter(req:Request,res:Response){
        try {
            const data = req.body
            const materiel = await materielService.creerMateriel(data)
            res.status(201).json({
                message: 'Matériel ajouté avec succès',
                data: materiel,
              });
        } catch (error:any) {
            res.status(400).json({ message: error.message });
        }
    }

    async lister(req:Request,res:Response){
        try {
            const materiels = await materielService.listerMateriels()
            res.status(200).json(materiels);
        } catch (error:any) {
            res.status(500).json({ message: error.message });
        }
    }

    async modifier(req: Request, res: Response) {
        try {
          const id = Number(req.params.id);
          const updated = await materielService.modifierMateriel(id, req.body);
          res.json(updated);
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      }
    
      async supprimer(req: Request, res: Response) {
        try {
          const id = Number(req.params.id);
          const result = await materielService.supprimerMateriel(id);
          res.json(result);
        } catch (error: any) {
          res.status(400).json({ message: error.message });
        }
      }

    
}
