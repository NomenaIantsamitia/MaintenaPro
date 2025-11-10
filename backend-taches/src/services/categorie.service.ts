import { prisma } from "../config/prisma";
import { CreateCategorieDto, UpdateCategorieDto } from "../dtos/categorie.dto";


export class CategorieService {
  async create(data: CreateCategorieDto) {
    const domaine = await prisma.domaine.findUnique({
      where : {id:data.domaineId}
    })
    if (!domaine) {
      throw new Error("Domaine introuvable");
    }
    const existingCategorie = await prisma.categorie.findUnique({
      where: { nom: data.nom },
    });

    if (existingCategorie) {
      throw new Error("Une catégorie avec ce nom existe déjà");
    }
    return prisma.categorie.create({
      data : {
        nom : data.nom,
        description : data.description,
        domaineId : data.domaineId,

      },
      include : {domaine : true}
    })
  }

  async findAll() {
    const categories = await prisma.categorie.findMany({
      include: {
        domaine: {
          select: {
            id: true,
            nom: true,
            description: true,
          },
        },
        _count: {
          select: { materiels: true },
        },
      },
      orderBy: { id: "asc" },
    });
  
    // Reformater pour un résultat plus propre
    return categories.map((c) => ({
      id: c.id,
      nom: c.nom,
      description: c.description,
      domaine: c.domaine ? {
        id: c.domaine.id,
        nom: c.domaine.nom,
        description: c.domaine.description,
      } : null,
      nombreMateriels: c._count.materiels,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }
  

  async findOne(id: number) {
    return prisma.categorie.findUnique({ where: { id } });
  }

  async update(id: number, data: UpdateCategorieDto) {
    return prisma.categorie.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.categorie.delete({ where: { id } });
  }
}
