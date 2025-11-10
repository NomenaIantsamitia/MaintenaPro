import { prisma } from "../config/prisma";
import { CreateDomaineDto, UpdateDomaineDto } from "../dtos/domaine.dto";

export class DomaineService {
    async create(data:CreateDomaineDto){
        return prisma.domaine.create({data})
    }

    async findAll() {
        const domaines = await prisma.domaine.findMany({
          include: {
            _count: {
              select: { categories: true }, // Compte les catégories liées à chaque domaine
            },
          },
          orderBy: { id: "asc" },
        });
    
        // Reformater pour un résultat plus clair
        return domaines.map((d) => ({
          id: d.id,
          nom: d.nom,
          description: d.description,
          nombreCategories: d._count.categories,
          createdAt: d.createdAt,
          updatedAt: d.updatedAt,
        }));
      }

    async findOne(id:number){
        return prisma.domaine.findUnique({where : {id}})
    }
    async update(id:number , data:UpdateDomaineDto){
        return prisma.domaine.update({
            where : {id},data
        })
    }
    async delete(id:number){
        return prisma.domaine.delete({where : {id}})
    }
}