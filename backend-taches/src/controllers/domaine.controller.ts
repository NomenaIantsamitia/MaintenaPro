import { DomaineService } from "../services/domaine.service";
import { Request, Response } from "express";


const domaineService = new DomaineService()

export class DomaineController{
    async create(req:Request , res:Response){
        try {
            const domaine = await domaineService.create(req.body)
            res.status(201).json(domaine);
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la création", error });
        }
    }

    async getAll(req:Request,res:Response){
        const domaines = await domaineService.findAll()
        res.json(domaines);
    }

    async getOne(req:Request,res:Response){
        const domaine = await domaineService.findOne(Number(req.params.id))
        if(!domaine) return res.status(404).json({ message: "Domaine non trouvé" });
        res.json(domaine)
    }

    async update(req:Request,res:Response){
        try {
            const domaine = await domaineService.update(Number(req.params.id),req.body)
            res.json(domaine);
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la mise à jour", error });
        }
    }

    async delete(req:Request,res:Response){
        try {
            await domaineService.delete(Number(req.params.id))
            res.json({ message: "Domaine supprimé avec succès" });
        } catch (error) {
            res.status(400).json({ message: "Erreur lors de la suppression", error });
        }
    }
}