import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const router = Router()
const dashboardController = new DashboardController()
router.get("/total-materiels",(req, res) =>{
    dashboardController.getTotalMaterielsController(req,res)
})

// ✅ Total techniciens actifs
router.get("/techniciens-actifs", (req, res) =>
    dashboardController.getTechniciensActifsController(req, res)
  );

// ✅ Total maintenances en cours
router.get("/maintenances-en-cours", (req, res) =>
    dashboardController.getMaintenancesEnCoursController(req, res)
  );

// ✅ Total maintenances terminées
router.get("/maintenances-terminees", (req, res) =>
    dashboardController.getMaintenancesTermineesController(req, res)
  );


// ✅ Total pannes détectées
router.get("/pannes-detectees", (req, res) =>
    dashboardController.getPannesDetecteesController(req, res)
  );

  router.get("/maintenances-planifiees",  (req, res) =>
    dashboardController.getMaintenancesPlanifiees(req, res)); // ✅ ajout

  // ✅ Nouveau : total des maintenances annulées
router.get("/maintenances-annulees", (req, res) =>
    dashboardController.getMaintenancesAnnuleesController(req, res)
  );

  router.get("/evolution-mensuelle", (req, res) =>
    dashboardController.getEvolutionMensuelle(req,res)
  );
export default router;