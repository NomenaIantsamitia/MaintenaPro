import React, { useState, useMemo, useCallback } from 'react';

// --- Interfaces TypeScript ---

// Informations de base de la Maintenance
interface Maintenance {
  id: number;
  materielId: number;
  technicienId: number;
  description: string;
  dateDebut: string; // Format YYYY-MM-DD
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  priorite: 'Basse' | 'Moyenne' | 'Haute' | 'Urgente';
}

// Données externes
interface Materiel {
  id: number;
  nom: string;
  numeroSerie: string;
}

interface Technicien {
  id: number;
  nom: string;
}

// --- Données de démonstration (à remplacer par l'appel API) ---

const mockMateriels: Materiel[] = [
  { id: 101, nom: 'Cisco ISR 4331', numeroSerie: 'SN-4331-001' },
  { id: 102, nom: 'Dell PowerEdge R740', numeroSerie: 'SN-R740-A01' },
  { id: 103, nom: 'HP ProLiant DL380', numeroSerie: 'SN-DL380-B02' },
];

const mockTechniciens: Technicien[] = [
  { id: 1, nom: 'Alice Dupont' },
  { id: 2, nom: 'Bob Martin' },
  { id: 3, nom: 'Chloé Leroy' },
];

const mockMaintenances: Maintenance[] = [
  { 
    id: 1, materielId: 101, technicienId: 1, 
    description: 'Mise à jour firmware et contrôle de sécurité annuel.', 
    dateDebut: '2025-11-15', statut: 'Planifiée', priorite: 'Moyenne' 
  },
  { 
    id: 2, materielId: 103, technicienId: 2, 
    description: 'Remplacement disque dur défectueux (Raid 1).', 
    dateDebut: '2025-10-31', statut: 'En cours', priorite: 'Haute' 
  },
];

// Options statiques
const priorites: Array<Maintenance['priorite']> = ['Basse', 'Moyenne', 'Haute', 'Urgente'];
const statutsMaintenance: Array<Maintenance['statut']> = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];

// --- Composant Notification (réutilisé) ---
const ToastNotification = ({ message, type }: { message: string, type: 'success' | 'error' | 'info' }) => {
    if (!message) return null;
    const color = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    return (
        <div className={`fixed top-4 right-4 ${color} text-white p-3 rounded-lg shadow-xl z-50 transition-opacity duration-300`}>
            {message}
        </div>
    );
};

// =========================================================================
// Composant Principal : AssignerMaintenance
// =========================================================================

const AssignerMaintenance: React.FC = () => {
  // --- États ---
  const [maintenances, setMaintenances] = useState<Maintenance[]>(mockMaintenances);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);

  // --- États du Formulaire ---
  const [materielId, setMaterielId] = useState<number | ''>('');
  const [technicienId, setTechnicienId] = useState<number | ''>('');
  const [dateDebut, setDateDebut] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState<Maintenance['priorite']>('Moyenne');
  const [statut, setStatut] = useState<Maintenance['statut']>('Planifiée'); // Statut par défaut pour l'Admin

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  // --- Fonctions utilitaires ---
  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const getMaterielNom = (id: number) => mockMateriels.find(m => m.id === id)?.nom || 'N/A';
  const getTechnicienNom = (id: number) => mockTechniciens.find(t => t.id === id)?.nom || 'N/A';

  const getPrioriteBadge = (priorite: Maintenance['priorite']) => {
    const baseStyle = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (priorite) {
      case 'Urgente': return `${baseStyle} bg-red-100 text-red-800`;
      case 'Haute': return `${baseStyle} bg-orange-100 text-orange-800`;
      case 'Moyenne': return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case 'Basse': return `${baseStyle} bg-blue-100 text-blue-800`;
      default: return `${baseStyle} bg-gray-100 text-gray-800`;
    }
  };

  const getStatutBadge = (statut: Maintenance['statut']) => {
    const baseStyle = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (statut) {
      case 'Planifiée': return `${baseStyle} bg-indigo-100 text-indigo-800`;
      case 'En cours': return `${baseStyle} bg-yellow-100 text-yellow-800`;
      case 'Terminée': return `${baseStyle} bg-green-100 text-green-800`;
      case 'Annulée': return `${baseStyle} bg-gray-300 text-gray-800`;
      default: return `${baseStyle} bg-blue-100 text-blue-800`;
    }
  };


  // --- Gestion du Formulaire et des Modals ---

  const resetForm = () => {
    setMaterielId('');
    setTechnicienId('');
    setDateDebut('');
    setDescription('');
    setPriorite('Moyenne');
    setStatut('Planifiée');
    setEditingMaintenance(null);
  }

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    setMaterielId(maintenance.materielId);
    setTechnicienId(maintenance.technicienId);
    setDateDebut(maintenance.dateDebut);
    setDescription(maintenance.description);
    setPriorite(maintenance.priorite);
    setStatut(maintenance.statut);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!materielId || !technicienId || !dateDebut || !description) {
      showNotification('Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    const newMaintenanceData: Omit<Maintenance, 'id'> = {
        materielId: materielId as number,
        technicienId: technicienId as number,
        description,
        dateDebut,
        priorite,
        statut,
    };

    // SIMULATION DE L'APPEL API POST/PUT
    if (editingMaintenance) {
      // Modification
      const updatedMaintenances = maintenances.map(m =>
        m.id === editingMaintenance.id ? { ...m, ...newMaintenanceData } : m
      );
      setMaintenances(updatedMaintenances);
      showNotification(`Maintenance pour ${getMaterielNom(newMaintenanceData.materielId)} mise à jour.`, 'success');
    } else {
      // Ajout
      const newMaintenance: Maintenance = {
        id: Date.now(),
        ...newMaintenanceData
      };
      setMaintenances([...maintenances, newMaintenance]);
      showNotification(`Maintenance planifiée pour ${getMaterielNom(newMaintenance.materielId)}.`, 'success');
    }
    closeModal();
  };
  
  const handleDelete = (id: number, nomMateriel: string) => {
      // Dans une application réelle, une modal de confirmation serait nécessaire.
      if (window.confirm(`Êtes-vous sûr de vouloir supprimer la planification de maintenance pour le matériel "${nomMateriel}" ?`)) {
          setMaintenances(maintenances.filter(m => m.id !== id));
          showNotification(`Maintenance pour ${nomMateriel} annulée et supprimée.`, 'success');
      }
  };


  // --- Rendu du composant ---

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ToastNotification message={notification?.message || ''} type={notification?.type || 'info'} />

      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">🗓️ Planification et Assignation des Maintenances</h1>
        <button
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
        >
          ➕ Planifier une Maintenance
        </button>
      </header>

      {/* --- Tableau des Maintenances Planifiées --- */}
      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matériel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technicien Assigné</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Prévue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {maintenances.map((maintenance) => (
              <tr key={maintenance.id} className="hover:bg-indigo-50 transition duration-150">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{getMaterielNom(maintenance.materielId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getTechnicienNom(maintenance.technicienId)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maintenance.dateDebut}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getPrioriteBadge(maintenance.priorite)}>{maintenance.priorite}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={getStatutBadge(maintenance.statut)}>{maintenance.statut}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(maintenance)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-150"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(maintenance.id, getMaterielNom(maintenance.materielId))}
                    className="text-red-600 hover:text-red-900 transition duration-150"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {maintenances.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p>Aucune maintenance planifiée. Cliquez sur "Planifier une Maintenance" pour commencer.</p>
            </div>
        )}
      </div>

      {/* --- Modal d'Assignation/Modification de Maintenance --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-40 flex justify-center items-center">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-3xl m-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
                {editingMaintenance ? '📝 Modifier la Planification' : '📅 Planifier une Nouvelle Maintenance'}
            </h3>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                
                {/* Ligne 1 : Matériel et Technicien */}
                <div>
                  <label htmlFor="materiel" className="block text-sm font-medium text-gray-700 mb-1">Équipement à maintenir <span className="text-red-500">*</span></label>
                  <select
                    id="materiel"
                    value={materielId}
                    onChange={(e) => setMaterielId(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    required
                  >
                    <option value="" disabled>Sélectionner un matériel</option>
                    {mockMateriels.map(m => (
                      <option key={m.id} value={m.id}>{m.nom} ({m.numeroSerie})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="technicien" className="block text-sm font-medium text-gray-700 mb-1">Technicien Assigné <span className="text-red-500">*</span></label>
                  <select
                    id="technicien"
                    value={technicienId}
                    onChange={(e) => setTechnicienId(parseInt(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                    required
                  >
                    <option value="" disabled>Sélectionner un technicien</option>
                    {mockTechniciens.map(t => (
                      <option key={t.id} value={t.id}>{t.nom}</option>
                    ))}
                  </select>
                </div>

                {/* Ligne 2 : Date et Priorité */}
                <div>
                  <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">Date de Début Prévue <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    id="dateDebut"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="priorite" className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    id="priorite"
                    value={priorite}
                    onChange={(e) => setPriorite(e.target.value as Maintenance['priorite'])}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                  >
                    {priorites.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Afficher le statut seulement en modification pour l'Admin */}
                {editingMaintenance && (
                    <div>
                        <label htmlFor="statut" className="block text-sm font-medium text-gray-700 mb-1">Statut de la Maintenance</label>
                        <select
                            id="statut"
                            value={statut}
                            onChange={(e) => setStatut(e.target.value as Maintenance['statut'])}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        >
                            {statutsMaintenance.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                )}
                
              </div>
              
              {/* Description (Pleine largeur) */}
              <div className="mb-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description/Tâches <span className="text-red-500">*</span></label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Décrivez les tâches à effectuer (ex: Remplacement pièce, vérification de sécurité, mise à niveau...)"
                  required
                ></textarea>
              </div>

              {/* Boutons d'Action */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-md transition duration-150"
                >
                  {editingMaintenance ? 'Sauvegarder la Planification' : 'Assigner et Planifier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignerMaintenance;