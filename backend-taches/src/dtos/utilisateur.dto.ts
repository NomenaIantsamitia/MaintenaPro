// src/dtos/create-utilisateur.dto.ts
export interface CreateUtilisateurDto {
  nom_complet: string;
  email: string;
  password: string;
  domaineId: number;
  role?: "TECHNICIEN" | "ADMIN";
  status?: "ACTIF" | "INACTIF";
  photo?: string;
}


  export interface LoginDTO {
    email: string;
    password: string;
  }
  