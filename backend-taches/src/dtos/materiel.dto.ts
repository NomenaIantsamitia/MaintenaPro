export interface MaterielDTO {
  nom: string;
  numeroSerie: string;
  categorieId: number;
  dateAcquisition: string; // Format ISO string (ex: "2025-10-30")
  statut?: 'ACTIF' | 'EN_MAINTENANCE' | 'EN_PANNE' | 'STOCK';
  localisation: string; // 🆕 Nouveau champ
}
