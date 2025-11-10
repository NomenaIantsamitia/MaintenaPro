export interface CreateCategorieDto {
  nom: string;
  description?: string;
  domaineId: number; // le domaine auquel la catégorie appartient
}

  export interface UpdateCategorieDto {
    nom?: string;
    description?: string;
  }
  