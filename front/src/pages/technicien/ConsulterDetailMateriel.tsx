import React, { useState, useEffect } from 'react';

// --- Interfaces TypeScript ---
interface MaterielDetail {
  id: number;
  nom: string;
  numeroSerie: string;
  categorie: string;
  statut: 'Actif' | 'En maintenance' | 'En panne' | 'Stock';
  localisation: string; // Où est l'équipement
  adresseIP: string;
  modele: string;
  dateAcquisition: string; // YYYY-MM-DD
  garantieExpire: string; // YYYY-MM-DD
  notes: string; // Infos supplémentaires importantes
}

// --- Données de démonstration (Simule l'API pour un ID donné) ---
const mockMaterielDetail: MaterielDetail = {
  id: 103,
  nom: 'HP ProLiant DL380',
  numeroSerie: 'SN-DL380-B02',
  categorie: 'Serveur',
  statut: 'En maintenance',
  localisation: 'Baie 4, Niveau 1, Salle Serveur B',
  adresseIP: '192.168.1.50',
  modele: 'DL380 Gen10',
  dateAcquisition: '2024-03-01',
  garantieExpire: '2027-03-01',
  notes: 'Disques durs remplacés en octobre 2025. Utilisation critique pour l\'application de paie.',
};

// --- Composant d'affichage de la carte ---
interface InfoCardProps {
    title: string;
    value: string | number;
    color: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value, color }) => (
    <div className={`p-4 rounded-lg shadow-sm border-l-4 ${color} bg-white transition duration-200 hover:shadow-md`}>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{value}</p>
    </div>
);

// --- Fonctions d'aide ---
const getStatutBadge = (statut: MaterielDetail['statut']) => {
    const baseStyle = "px-3 py-1 text-sm font-semibold rounded-full";
    switch (statut) {
      case 'Actif': return `${baseStyle} bg-green-100 text-green-800`;
      case 'En maintenance': return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case 'En panne': return `${baseStyle} bg-red-100 text-red-800`;
      case 'Stock': return `${baseStyle} bg-gray-100 text-gray-800`;
      default: return `${baseStyle} bg-blue-100 text-blue-800`;
    }
};

// =========================================================================
// Composant Principal : ConsulterDetailMateriel
// =========================================================================

// Ce composant prendrait l'ID du matériel comme prop dans une application réelle
const ConsulterDetailMateriel: React.FC<{ materielId: number }> = ({ materielId }) => {
  // Dans une application réelle, on utiliserait materielId pour fetcher les données
  const [materiel, setMateriel] = useState<MaterielDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // SIMULATION d'un appel API pour récupérer les détails
    setLoading(true);
    setTimeout(() => {
        // En supposant que le mock correspond à l'ID 103
        if (materielId === mockMaterielDetail.id) {
            setMateriel(mockMaterielDetail);
        } else {
            // Gérer le cas où le matériel n'est pas trouvé
            setMateriel(null); 
        }
        setLoading(false);
    }, 500);
  }, [materielId]);

  if (loading) {
    return (
        <div className="p-8 text-center text-indigo-600">
            Chargement des détails du matériel...
        </div>
    );
  }

  if (!materiel) {
    return (
        <div className="p-8 text-center text-red-600">
            Erreur : Matériel avec l'ID {materielId} non trouvé.
        </div>
    );
  }
  
  // Logic pour l'alerte de garantie
  const isGarantieNearExpiry = new Date(materiel.garantieExpire).getTime() < new Date().setFullYear(new Date().getFullYear() + 1);
  const garantieStyle = isGarantieNearExpiry ? 'border-red-600' : 'border-green-600';

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      <header className="mb-6 border-b pb-4 flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">{materiel.nom}</h1>
            <p className="text-xl text-gray-500 mt-1">N° Série: **{materiel.numeroSerie}**</p>
        </div>
        <span className={getStatutBadge(materiel.statut)}>{materiel.statut}</span>
      </header>

      {/* --- Section 1: Informations Clés d'Accès --- */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Détails d'Accès et Localisation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <InfoCard 
            title="Localisation Physique" 
            value={materiel.localisation} 
            color="border-indigo-600" 
          />

          <InfoCard 
            title="Adresse IP" 
            value={materiel.adresseIP} 
            color="border-indigo-600" 
          />

          <InfoCard 
            title="Catégorie / Modèle" 
            value={`${materiel.categorie} / ${materiel.modele}`} 
            color="border-indigo-600" 
          />
        </div>
      </section>
      
      {/* --- Section 2: Informations Administratives --- */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Administration et Garantie</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          <InfoCard 
            title="Date d'Acquisition" 
            value={materiel.dateAcquisition} 
            color="border-blue-600" 
          />

          <InfoCard 
            title="Garantie Expire le" 
            value={materiel.garantieExpire} 
            color={garantieStyle} 
          />
        </div>
      </section>

      {/* --- Section 3: Notes et Historique --- */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Notes Administrateur</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <p className="text-gray-700 whitespace-pre-wrap">{materiel.notes || "Aucune note spéciale enregistrée pour cet équipement."}</p>
        </div>
      </section>
      
      {/* --- Simulation Historique des Maintenances (Très utile pour le technicien) --- */}
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Historique des 5 Dernières Interventions</h2>
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <ul className="space-y-3">
                <li className="p-3 border-b">**2025-10-31** : Remplacement disque dur (Bob Martin) - <span className="text-green-600">Terminée</span></li>
                <li className="p-3 border-b">**2025-09-15** : Mise à jour OS (Alice Dupont) - <span className="text-green-600">Terminée</span></li>
                <li className="p-3">**2024-03-01** : Installation initiale (Admin) - <span className="text-green-600">Terminée</span></li>
            </ul>
            <p className="mt-4 text-sm text-gray-500">
                <button className="text-indigo-600 hover:underline">Voir l'historique complet</button>
            </p>
        </div>
      </section>
      
    </div>
  );
};

// Exemple d'utilisation du composant (simulant l'affichage de l'ID 103)
const MaterielDetailWrapper: React.FC = () => <ConsulterDetailMateriel materielId={103} />;

export default MaterielDetailWrapper;