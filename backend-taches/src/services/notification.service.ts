import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export class NotificationService {
  /**
   * Récupérer toutes les notifications avec les détails de l'utilisateur et de la maintenance
   */
  async getAllNotifications() {
    return await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom_complet: true,
            email: true,
            role: true,
            photo: true,
          },
        },
        maintenance: {
          select: {
            id: true,
            description: true,
            dateDebut: true,
            statut: true,
            priorite: true,
            materiel: {
              select: {
                id: true,
                nom: true,
                numeroSerie: true,
                localisation: true,
              },
            },
            technicien: {
              select: {
                id: true,
                nom_complet: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Récupérer les notifications d’un utilisateur spécifique
   */
  async getNotificationsByUser(userId: number) {
    return await prisma.notification.findMany({
      where: { utilisateurId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom_complet: true,
            email: true,
            role: true,
          },
        },
        maintenance: {
          select: {
            id: true,
            description: true,
            statut: true,
            priorite: true,
            materiel: {
              select: {
                id: true,
                nom: true,
                numeroSerie: true,
              },
            },
          },
        },
      },
    });
  }

 

  // 🔔 Récupérer le nombre de notifications non lues
  async countUnread(userId: number) {
    const count = await prisma.notification.count({
      where: { utilisateurId: userId, lu: false },
    });
    return count;
  }

  // ✅ Marquer une notification comme lue
  async markAsRead(notificationId: number) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { lu: true },
    });
  }

  // ✅ Marquer toutes les notifications comme lues
  async markAllAsRead(userId: number) {
    await prisma.notification.updateMany({
      where: { utilisateurId: userId, lu: false },
      data: { lu: true },
    });
  }


}
