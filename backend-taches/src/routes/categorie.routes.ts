import { Router } from "express";
import { CategorieController } from "../controllers/categorie.controller";
const router = Router();
const controller = new CategorieController();

router.post("/", controller.create);
router.get("/", controller.getAll);
router.get("/:id", controller.getOne);
router.put("/:id", controller.update);
router.delete("/:id", controller.delete);

export default router;
