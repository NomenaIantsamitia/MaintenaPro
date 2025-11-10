import { Router } from "express";
import { DomaineController } from "../controllers/domaine.controller";


const router = Router();
const controller = new DomaineController()

router.post("/", controller.create);
router.get('/',controller.getAll)
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;