import { Priorite, StatutMaintenance, StatutMateriel, TypeNotification } from "@prisma/client";
import { prisma } from "../config/prisma";
import {CreateMaintenanceDto, UpdateMaintenanceDto} from "../dtos/maintenance.dto";
import { io } from "../sockets/notification.socket";

import { Request,Response } from "express";
export class MaintenanceService{
      // Création d'une maintenance
   // ✅ Création d'une maintenance avec notification en temps réel
   async create(data: CreateMaintenanceDto) {
    try {
      // 1️⃣ Création de la maintenance
      const maintenance = await prisma.maintenance.create({
        data: {
          materielId: data.materielId,
          technicienId: data.technicienId,
          description: data.description,
          dateDebut: new Date(data.dateDebut),
          priorite: data.priorite || Priorite.MOYENNE,
          statut: data.statut || StatutMaintenance.PLANIFIEE,
        },
        include: {
          materiel: true,
          technicien: true,
        },
      });

      
      // ✅ 2️⃣ Si la maintenance est planifiée → le matériel devient "EN_MAINTENANCE"
      if (maintenance.statut === StatutMaintenance.PLANIFIEE) {
        await prisma.materiel.update({
          where: { id: maintenance.materielId },
          data: { statut: StatutMateriel.EN_MAINTENANCE },
        });
        console.log(`🔧 Matériel ${maintenance.materiel.nom} mis à jour en EN_MAINTENANCE`);
      }

      // 2️⃣ Création de la notification en base de données
      const notification = await prisma.notification.create({
        data: {
          titre: "Nouvelle maintenance assignée",
          message: `Une maintenance concernant le matériel "${maintenance.materiel.nom}" vous a été assignée.`,
          type: TypeNotification.ASSIGNATION,
          utilisateurId: data.technicienId,
          maintenanceId: maintenance.id,
        },
      });


      // 3️⃣ Émission Socket.io (envoi en temps réel au technicien)
      io.to(`user_${data.technicienId}`).emit("nouvelle_notification", {
        id: notification.id,
        titre: notification.titre,
        message: notification.message,
        type: notification.type,
        lu: notification.lu,
        createdAt: notification.createdAt,
      });

      // 🔴 Mise à jour du compteur non lues
const unreadCount = await prisma.notification.count({
  where: { utilisateurId: data.technicienId, lu: false },
});
io.to(`user_${data.technicienId}`).emit("update_unread_count", unreadCount);

      console.log(`📢 Notification envoyée à l'utilisateur ${data.technicienId}`);

      return maintenance;
    } catch (error) {
      console.error("❌ Erreur création maintenance :", error);
      throw new Error("Erreur lors de la création de la maintenance : " + (error as Error).message);
    }
  }
  async getMaterielsEnPanne() {
    return prisma.materiel.findMany({
      where : {statut : "EN_PANNE"},
      include : {
        categorie : {
          include : {
            domaine : true
          }
        }
      }
    })
  }

  async getTechniciensDuDomaineDesPannes() {
    const domainesAvecPannes = await prisma.domaine.findMany({
      where: {
        categories: {
          some: {
            materiels: {
              some: { statut: "EN_PANNE" },
            },
          },
        },
      },
      include: {
        techniciens: {
          include: {
            domaine: true, // 🟢 Inclure le domaine pour chaque technicien
          },
        },
      },
    });
  
    // Fusionne les techniciens des domaines
    const techniciens = domainesAvecPannes.flatMap((d) => d.techniciens);
  
    // Supprime les doublons (si un technicien appartient à plusieurs domaines)
    const techniciensUniques = Array.from(
      new Map(techniciens.map((t) => [t.id, t])).values()
    );
  
    return techniciensUniques;
  }
  

  async getAllMaintenances() {
    return prisma.maintenance.findMany({
      include: {
        materiel: {
          include: {
            categorie: true,
          },
        },
        technicien: {
          select: {
            id: true,
            nom_complet: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
   async updateMaintenance(id: number, data: UpdateMaintenanceDto) {
    const maintenance = await prisma.maintenance.findUnique({ where: { id } });

    if (!maintenance) {
      throw new Error("Maintenance non trouvée");
    }

    const updated = await prisma.maintenance.update({
      where: { id },
      data: {
        ...data,
        dateDebut: data.dateDebut ? new Date(data.dateDebut) : maintenance.dateDebut,
      },
      include: {
        materiel: { select: { nom: true } },
        technicien: { select: { nom_complet: true } },
      },
    });

    return updated;
  }

  async supprimerMaintenance(id: number) {
    // Vérifie si la maintenance existe
    const maintenance = await prisma.maintenance.findUnique({ where: { id } });

    if (!maintenance) {
      throw new Error("Maintenance introuvable");
    }

    // Supprime la maintenance
    await prisma.maintenance.delete({ where: { id } });

    return { message: "Maintenance supprimée avec succès" };
  }
  
  async getByTechnicien(req:Request,res:Response){
    try {
      const technicienId = parseInt(req.params.id);
     
    const maintenances = await prisma.maintenance.findMany({
      where: { technicienId },
      include: {
        materiel: {
          include: {
            categorie: true, // ✅ inclut le nom et la description de la catégorie
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
      res.json(maintenances);
    } catch (error:any) {
      console.error("Erreur getByTechnicien:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  }

   // ✅ Modifier le statut d'une maintenance + notifier l'admin
   static async updateStatut(id: number, statut: string) {
    return prisma.$transaction(async (tx) => {
      // 1️⃣ Vérifier la maintenance
      const maintenance = await tx.maintenance.findUnique({
        where: { id },
        include: { materiel: true, technicien: true },
      });

      if (!maintenance) {
        throw new Error(`Aucune maintenance trouvée avec l'id ${id}`);
      }

      // 2️⃣ Mettre à jour le statut
      const updated = await tx.maintenance.update({
        where: { id },
        data: { statut: statut as StatutMaintenance },
        include: { materiel: true, technicien: true },
      });

      // 3️⃣ Adapter le statut du matériel
      let nouveauStatut: StatutMateriel | null = null;
      if (statut === "EN_COURS") nouveauStatut = "EN_MAINTENANCE";
      else if (statut === "TERMINEE") nouveauStatut = "ACTIF";
      else if (statut === "ANNULER") nouveauStatut = "ACTIF";

      if (nouveauStatut) {
        await tx.materiel.update({
          where: { id: maintenance.materielId },
          data: { statut: nouveauStatut },
        });
      }

      const admin = await tx.utilisateur.findFirst({
        where: { role: 'ADMIN' },
      });
      if (!admin) throw new Error("Aucun administrateur trouvé dans le système");

      // 4️⃣ Créer une notification claire pour l'admin
      const notification = await tx.notification.create({
        data: {
          titre: `Maintenance ${statut}`,
          message: `La maintenance du matériel "${maintenance.materiel.nom}" a été mise à jour en statut "${statut}" par ${maintenance.technicien.nom_complet}.`,
          utilisateurId:admin.id, // 🧠 ID de l'admin (ou boucle si plusieurs)
          type: TypeNotification.MISE_A_JOUR,
          maintenanceId: maintenance.id,
        },
      });

      // 5️⃣ Envoyer en temps réel via WebSocket
      io.emit("nouvelle_notification", notification);

      return updated;
    });
  }

  // ✅ Ajouter un rapport pour une maintenance
  static async ajouterRapport(maintenanceId: number, contenu: string) {
    // Vérifie d'abord que la maintenance existe
    const maintenance = await prisma.maintenance.findUnique({
      where: { id: maintenanceId },
    });

    if (!maintenance) {
      throw new Error("Maintenance introuvable");
    }

    // Ajout du rapport
    const rapport = await prisma.rapport.create({
      data: {
        maintenanceId,
        contenu,
      },
    });

    // Met automatiquement le statut à "TERMINÉE"
    await prisma.maintenance.update({
      where: { id: maintenanceId },
      data: { statut: "TERMINEE" },
    });

    return rapport;
  }
  

   
}