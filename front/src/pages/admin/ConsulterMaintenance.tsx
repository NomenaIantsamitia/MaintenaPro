import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // Nécessite l'installation de jspdf et jspdf-autotable

// --- Interfaces TypeScript (Réutilisées) ---
interface Maintenance {
  id: number;
  materielId: number;
  technicienId: number;
  description: string;
  dateDebut: string; 
  statut: 'Planifiée' | 'En cours' | 'Terminée' | 'Annulée';
  priorite: 'Basse' | 'Moyenne' | 'Haute' | 'Urgente';
}

interface Materiel {
  id: number;
  nom: string;
  numeroSerie: string;
}

interface Technicien {
  id: number;
  nom: string;
}

// --- Données de démonstration (Réutilisées) ---
const mockMateriels: Materiel[] = [
  { id: 101, nom: 'Cisco ISR 4331', numeroSerie: 'SN-4331-001' },
  { id: 102, nom: 'Dell PowerEdge R740', numeroSerie: 'SN-R740-A01' },
  { id: 103, nom: 'HP ProLiant DL380', numeroSerie: 'SN-DL380-B02' },
  { id: 104, nom: 'Juniper EX4300', numeroSerie: 'SN-EX4300-005' },
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
  { 
    id: 3, materielId: 102, technicienId: 1, 
    description: 'Vérification des journaux du système après mise à jour.', 
    dateDebut: '2025-09-01', statut: 'Terminée', priorite: 'Basse' 
  },
  { 
    id: 4, materielId: 104, technicienId: 3, 
    description: 'Diagnostic de la panne fibre optique.', 
    dateDebut: '2025-12-05', statut: 'Planifiée', priorite: 'Urgente' 
  },
];

// Options statiques
const statutsMaintenance: Array<Maintenance['statut']> = ['Planifiée', 'En cours', 'Terminée', 'Annulée'];

// =========================================================================
// Composant Principal : ConsulterMaintenance
// =========================================================================

const ConsulterMaintenance: React.FC = () => {
  const [maintenances] = useState<Maintenance[]>(mockMaintenances);
  
  // --- États du Filtre / Recherche ---
  const [filterStatut, setFilterStatut] = useState<string>('');
  const [filterTechnicien, setFilterTechnicien] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- Fonctions d'aide à l'affichage ---
  const getMaterielInfo = (id: number) => mockMateriels.find(m => m.id === id);
  const getTechnicienNom = (id: number) => mockTechniciens.find(t => t.id === id)?.nom || 'N/A';

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


  // --- Logique de Filtrage et Recherche ---
  const filteredMaintenances = useMemo(() => {
    let result = maintenances;

    // 1. Filtrage par statut
    if (filterStatut) {
      result = result.filter(m => m.statut === filterStatut);
    }

    // 2. Filtrage par technicien
    if (filterTechnicien) {
      result = result.filter(m => m.technicienId === parseInt(filterTechnicien));
    }

    // 3. Recherche par terme (Matériel ou Description)
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(m => {
          const materiel = getMaterielInfo(m.materielId);
          return (
              m.description.toLowerCase().includes(lowerSearchTerm) ||
              materiel?.nom.toLowerCase().includes(lowerSearchTerm) ||
              materiel?.numeroSerie.toLowerCase().includes(lowerSearchTerm)
          );
      });
    }

    return result;
  }, [maintenances, filterStatut, filterTechnicien, searchTerm]);

  
  // --- Fonction d'Export PDF (Trés "vendable") ---
  const handleExportPDF = () => {
      const doc = new jsPDF();
      
      const head = [['Matériel (N° Série)', 'Technicien', 'Date Prévue', 'Statut', 'Priorité', 'Description']];
      
      const body = filteredMaintenances.map(m => [
          `${getMaterielInfo(m.materielId)?.nom} (${getMaterielInfo(m.materielId)?.numeroSerie})`,
          getTechnicienNom(m.technicienId),
          m.dateDebut,
          m.statut,
          m.priorite,
          m.description
      ]);

      doc.text("Rapport des Maintenances - Système GIN", 14, 15);
      
      // Utilisation de jspdf-autotable pour un beau tableau
      autoTable(doc, {
          head: head,
          body: body,
          startY: 20,
          theme: 'striped',
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [58, 80, 163] }, // Couleur Indigo
      });

      doc.save('rapport_maintenances.pdf');
  };

  // --- Rendu du composant ---

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📊 Historique et Consultation des Maintenances</h1>
        <button
          onClick={handleExportPDF}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          ⬇️ Exporter en PDF
        </button>
      </header>

      {/* --- Section Filtres et Recherche --- */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-wrap gap-4 items-end">
        
        <div className="flex-1 min-w-[250px]">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Recherche (Matériel, N° Série, Description)</label>
          <input
            type="text"
            id="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Entrez un mot-clé..."
          />
        </div>

        <div className="min-w-[150px]">
          <label htmlFor="filter-statut" className="block text-sm font-medium text-gray-700 mb-1">Filtrer par Statut</label>
          <select
            id="filter-statut"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Tous les statuts</option>
            {statutsMaintenance.map(statut => (
              <option key={statut} value={statut}>{statut}</option>
            ))}
          </select>
        </div>

        <div className="min-w-[150px]">
          <label htmlFor="filter-tech" className="block text-sm font-medium text-gray-700 mb-1">Filtrer par Technicien</label>
          <select
            id="filter-tech"
            value={filterTechnicien}
            onChange={(e) => setFilterTechnicien(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
          >
            <option value="">Tous les techniciens</option>
            {mockTechniciens.map(tech => (
              <option key={tech.id} value={tech.id}>{tech.nom}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Tableau des Maintenances --- */}
      <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matériel (N° Série)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Technicien</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Prévue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priorité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMaintenances.map((maint) => {
              const materiel = getMaterielInfo(maint.materielId);
              return (
                <tr key={maint.id} className="hover:bg-gray-50 transition duration-150">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {materiel?.nom} 
                    <p className="text-xs text-gray-500 mt-1">{materiel?.numeroSerie}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getTechnicienNom(maint.technicienId)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{maint.dateDebut}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getPrioriteBadge(maint.priorite)}>{maint.priorite}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatutBadge(maint.statut)}>{maint.statut}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-sm truncate" title={maint.description}>
                    {maint.description}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredMaintenances.length === 0 && (
            <div className="text-center py-12 text-gray-500">
                <p>Aucune maintenance trouvée correspondant aux critères de consultation.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ConsulterMaintenance;