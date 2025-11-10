import { Router } from "express";
import { UtilisateurController } from "../controllers/utilisateur.controller";
import { upload } from "../middlewares/upload.middleware";
const router = Router();

const controller = new UtilisateurController()

router.post("/connexion", (req, res) => controller.connexion(req, res));
router.post("/inscrire", upload.single("photo"), (req, res) =>
    controller.inscrire(req, res)
  );
//Admin
router.get('/',controller.listerUtilisateurs)


// ✅ Route DELETE : /api/utilisateurs/:id
router.delete("/:id", controller.supprimerUtilisateur);



// PATCH /api/utilisateurs/:id/status
router.patch("/:id/status", (req, res) =>
  controller.modifierStatusUtilisateur(req, res)
);

export default router;
