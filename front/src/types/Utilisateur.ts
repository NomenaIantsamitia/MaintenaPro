export interface Utilisateur {
    nom_complet: string;
    email: string;
    password: string;
    role?: "ADMIN" | "TECHNICIEN" | "USER";
  }