import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
  async getAll(req: Request, res: Response) {
    try {
      const notifications = await notificationService.getAllNotifications();
      res.status(200).json({
        message: "Liste des notifications",
        data: notifications,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  async getByUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "ID utilisateur invalide" });
      }

      const notifications = await notificationService.getNotificationsByUser(userId);
      res.status(200).json({
        message: `Notifications de l'utilisateur ${userId}`,
        data: notifications,
      });
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }



 // 🔴 Compter les non lues
async countUnread(req: Request, res: Response) {
  const userId = Number(req.params.userId);
  const count = await notificationService.countUnread(userId);
  res.json({ unreadCount: count }); // ✅ Clé renommée
}


  // 🟢 Marquer toutes comme lues
  async markAllAsRead(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    await notificationService.markAllAsRead(userId);
    res.json({ success: true, message: "Toutes les notifications ont été lues." });
  }
 
}
