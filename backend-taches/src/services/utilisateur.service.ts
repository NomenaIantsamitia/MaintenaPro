import { prisma } from "../config/prisma";
import { CreateUtilisateurDto, LoginDTO } from "../dtos/utilisateur.dto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export class UtilisateurService {
    async create(data:CreateUtilisateurDto){
      const existingUser = await prisma.utilisateur.findUnique({
        where: { email: data.email },
      });
      if (existingUser) throw new Error("Cet email est déjà utilisé.");
  
      const hashedPassword = await bcrypt.hash(data.password, 10);
  
      const utilisateur = await prisma.utilisateur.create({
        data: {
          nom_complet: data.nom_complet,
          email: data.email,
          password: hashedPassword,
          domaineId: data.domaineId,
          photo: data.photo,
          role: data.role || "TECHNICIEN",
          status: data.status || "ACTIF",
        },
      });
  
      return utilisateur;

    }

    async login(data:LoginDTO){
      const utilisateur = await prisma.utilisateur.findUnique({
        where : {email:data.email}
      })

      if(!utilisateur) throw new Error("Utilisateur introuvable");
      const passwordValid = await bcrypt.compare(
        data.password,
        utilisateur.password
      )
      if (!passwordValid) throw new Error("Mot de passe incorrect");

      const token = jwt.sign(
        {
          sub: utilisateur.id,
          email: utilisateur.email,
          role: utilisateur.role,
        },
        process.env.JWT_SECRET as string,
        { expiresIn: "2h" }
      );

      return {
        message: "Connexion réussie ✅",
        access_token: token,
        utilisateur: {
          id: utilisateur.id,
          nom_complet: utilisateur.nom_complet,
          email: utilisateur.email,
          role: utilisateur.role,
          status: utilisateur.status,
        },
      };
    }

  async getUtisateurs(){
    return prisma.utilisateur.findMany({
      where : {role : "TECHNICIEN"},
      orderBy : {id:'asc'},
      include : {
        domaine : true
      }
    })
  }

  async supprimerUtilisateur(id: number) {
    // Vérifier si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id },
    });

    if (!utilisateur) {
      throw new Error("Aucun utilisateur trouvé avec cet ID");
    }

    // Supprimer l'utilisateur
    await prisma.utilisateur.delete({
      where: { id },
    });

    return { message: "Utilisateur supprimé avec succès", id };
  }

  async updateUtilisateurStatus(id: number, status: "ACTIF" | "INACTIF") {
    // Vérifie si l'utilisateur existe
    const utilisateur = await prisma.utilisateur.findUnique({ where: { id } });

    if (!utilisateur) {
      throw new Error("Utilisateur introuvable");
    }

    // 🔸 Si on veut désactiver, vérifier qu’il n’a pas de maintenance en cours
    if (status === "INACTIF") {
      const maintenancesEnCours = await prisma.maintenance.findMany({
        where: {
          technicienId: id,
          statut: { in: ["PLANIFIEE", "EN_COURS"] },
        },
      });

      if (maintenancesEnCours.length > 0) {
        throw new Error(
          "Impossible de désactiver cet utilisateur : il a des maintenances en cours."
        );
      }
    }

    // 🔸 Mettre à jour le statut
    const updatedUtilisateur = await prisma.utilisateur.update({
      where: { id },
      data: { status },
    });

    return updatedUtilisateur;
  }



    
}