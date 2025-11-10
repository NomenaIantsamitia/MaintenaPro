import React, { useState, useCallback } from 'react';

// --- Interfaces TypeScript ---
interface Maintenance {
  id: number;
  materielId: number;
  technicienId: number;
  description: string;
  dateDebut: string; 
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  rapportTechnicien?: string; 
}

interface Materiel {
  id: number;
  nom: string;
}

// Données SIMULÉES (Idem que le composant de consultation pour la cohérence)
const CURRENT_TECHNICIAN_ID = 2; 
const mockMateriels: Materiel[] = [
  { id: 103, nom: 'HP ProLiant DL380' },
];
const initialMaintenances: Maintenance[] = [
  { 
    id: 2, materielId: 103, technicienId: 2, 
    description: 'Remplacement d’un module RAM défectueux.', 
    dateDebut: '2025-10-31', statut: 'En cours'
  },
];
const statutsTechnicien: Array<Maintenance['statut']> = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];

// --- Composant Notification ---
const ToastNotification = ({ message, type }: { message: string, type: 'success' | 'error' | 'info' }) => {
    if (!message) return null;
    const color = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    return (
        <div className={`fixed top-4 right-4 ${color} text-white p-3 rounded-lg shadow-xl z-50`}>
            {message}
        </div>
    );
};

// =========================================================================
// Composant Principal : MettreAJourRapportTechnicien
// (Focus sur l'action de rapport)
// =========================================================================

const MettreAJourRapportTechnicien: React.FC = () => {
  // Simuler la sélection d'une maintenance à mettre à jour
  const [maintenance, setMaintenance] = useState<Maintenance>(initialMaintenances[0]);
  const [isModalOpen, setIsModalOpen] = useState(true); // On ouvre la modal directement pour l'exemple

  // --- États du Formulaire ---
  const [nouveauStatut, setNouveauStatut] = useState<Maintenance['statut']>(maintenance.statut);
  const [rapportTechnicien, setRapportTechnicien] = useState(maintenance.rapportTechnicien || '');

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const getMaterielNom = (id: number) => mockMateriels.find(m => m.id === id)?.nom || 'N/A';
  
  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();

    // 🔴 LOGIQUE CLÉ : Règle métier pour le rapport (Tâche "Ajouter un rapport de maintenance")
    if (nouveauStatut === 'Terminée' && !rapportTechnicien.trim()) {
        showNotification('ATTENTION : Un rapport d\'intervention est obligatoire pour clôturer la maintenance.', 'error');
        return;
    }
    
    // SIMULATION DE L'APPEL API PUT
    const updatedMaintenance: Maintenance = { 
        ...maintenance, 
        statut: nouveauStatut, 
        rapportTechnicien: rapportTechnicien.trim() 
    };

    // Mise à jour de l'état local (simule la base de données)
    setMaintenance(updatedMaintenance); 
    
    showNotification(`Maintenance [${getMaterielNom(maintenance.materielId)}] mise à jour. Rapport sauvegardé.`, 'success');
    setIsModalOpen(false);
  };


  // --- Rendu du composant ---

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ToastNotification message={notification?.message || ''} type={notification?.type || 'info'} />

      <h1 className="text-3xl font-bold text-gray-800 mb-6">⚙️ Mise à Jour : {getMaterielNom(maintenance.materielId)}</h1>
      <p className="mb-8">Tâche: {maintenance.description}</p>

      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg shadow-lg"
      >
        Ouvrir le formulaire de Rapport
      </button>

      {/* --- Modal d'Ajout de Rapport --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Clôturer l'Intervention et Ajouter le Rapport</h3>
            
            <form onSubmit={handleUpdate}>
              
              <div className="mb-6">
                <label htmlFor="nouveauStatut" className="block text-sm font-medium text-gray-700 mb-1">1. Changer le Statut</label>
                <select
                  id="nouveauStatut"
                  value={nouveauStatut}
                  onChange={(e) => setNouveauStatut(e.target.value as Maintenance['statut'])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  required
                >
                  {statutsTechnicien.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {nouveauStatut === 'Terminée' && (
                    <p className="mt-2 text-sm text-red-600 font-semibold">
                        ⚠️ Le rapport ci-dessous devient obligatoire pour terminer la tâche.
                    </p>
                )}
              </div>

              {/* 🎯 CHAMPS DU RAPPORT DE MAINTENANCE */}
              <div className="mb-6">
                <label htmlFor="rapportTechnicien" className="block text-sm font-medium text-gray-700 mb-1">
                    2. Rapport d'Intervention
                    {nouveauStatut === 'Terminée' && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  id="rapportTechnicien"
                  value={rapportTechnicien}
                  onChange={(e) => setRapportTechnicien(e.target.value)}
                  rows={6}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Décrivez précisément les étapes, le temps passé, les pièces remplacées et le statut final de l'équipement."
                ></textarea>
              </div>

              {/* Boutons d'Action */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition duration-150"
                >
                  Valider & Sauvegarder le Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MettreAJourRapportTechnicien;