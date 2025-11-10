import { Router } from "express";
import { RapportController } from "../controllers/rapport.controller";

const router = Router();

// Récupérer le rapport par ID de maintenance
router.get("/:maintenanceId", RapportController.getRapport);

// Ajouter ou modifier le rapport
router.post("/", RapportController.addOrUpdateRapport);

export default router;
