import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

const router = Router();
const controller = new NotificationController();

// Routes
router.get("/", controller.getAll.bind(controller)); // 🔹 GET /api/notifications
router.get("/user/:userId", controller.getByUser.bind(controller)); // 🔹 GET /api/notifications/user/:userId

router.get("/user/:userId/unread/count", controller.countUnread);
// 🟢 Tout marquer comme lu
router.put("/user/:userId/markAllRead", controller.markAllAsRead);

export default router;
