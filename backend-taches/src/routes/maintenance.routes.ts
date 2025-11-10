// src/routes/maintenance.routes.ts
import { Router } from "express";
import { MaintenanceController } from "../controllers/maintenance.controller";

const router = Router();
const maintenanceController = new MaintenanceController();



// ✅ Modifier le statut
router.put("/:id/statut", maintenanceController.changerStatut);

// ✅ Ajouter un rapport
router.post("/rapport", maintenanceController.ajouterRapport);

router.get("/technicien/:id", maintenanceController.getByTechnicien);

router.post("/", (req, res) => maintenanceController.create(req, res));
router.get("/", maintenanceController.getAll);
// 🔧 Liste des matériels en panne
router.get("/materiels-en-panne", (req, res) => maintenanceController.getMaterielsEnPanne(req, res));

// 👷 Liste des techniciens du même domaine
router.get("/techniciens-du-domaine-pannes", (req, res) =>
  maintenanceController.getTechniciensDuDomaineDesPannes(req, res)
);

router.put("/:id", maintenanceController.update);
router.delete("/:id", maintenanceController.supprimer);
export default router;
