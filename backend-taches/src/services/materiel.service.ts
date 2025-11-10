
import { prisma } from "../config/prisma";
import { MaterielDTO} from "../dtos/materiel.dto";


export class MaterielService {
  async creerMateriel(data: MaterielDTO) {
    const { nom, numeroSerie, categorieId, dateAcquisition, statut, localisation } = data;

    const exist = await prisma.materiel.findUnique({
      where: { numeroSerie },
    });

    if (exist) {
      throw new Error("Un matériel avec ce numéro de série existe déjà.");
    }

    const materiel = await prisma.materiel.create({
      data: {
        nom,
        numeroSerie,
        categorieId,
        dateAcquisition: new Date(dateAcquisition),
        statut: statut || "STOCK",
        localisation, // 🆕 On l’ajoute ici
      },
      include: {
        categorie: true,
      },
    });

    return materiel;
  }

  async listerMateriels(){
    return prisma.materiel.findMany({
      include : {
        categorie :{
          select : {id : true,nom:true}
        }
      }
    })
  }

   // 🔹 Modifier un matériel
   async modifierMateriel(id: number, data: Partial<MaterielDTO>) {
    const exist = await prisma.materiel.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new Error("Matériel introuvable.");
    }

    const updated = await prisma.materiel.update({
      where: { id },
      data: {
        ...data,
        dateAcquisition: data.dateAcquisition
          ? new Date(data.dateAcquisition)
          : exist.dateAcquisition,
      },
      include: {
        categorie: {
          select: { id: true, nom: true },
        },
      },
    });

    return updated;
  }

  // 🔹 Supprimer un matériel
  async supprimerMateriel(id: number) {
    const exist = await prisma.materiel.findUnique({
      where: { id },
    });

    if (!exist) {
      throw new Error("Matériel introuvable.");
    }

    await prisma.materiel.delete({
      where: { id },
    });

    return { message: "Matériel supprimé avec succès." };
  }





}
