import { Router } from "express";
import { MaterielController } from "../controllers/materiel.controller";

const router = Router();
const controller = new MaterielController();


// POST /api/materiels
router.post('/', controller.ajouter);

// GET /api/materiels
router.get('/', controller.lister);

router.put("/:id", controller.modifier);     // ✏️ Modifier
router.delete("/:id", controller.supprimer);
export default router;
