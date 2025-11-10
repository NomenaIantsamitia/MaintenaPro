import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { SidebarAdmin } from "../../components/SidebarAdmin";
import PlanifierMaintenanceModal from "../../modals/admin/PlanifierMaintenanceModal";
import ModifierMaintenanceModal from "../../modals/admin/ModifierMaintenanceModal";
import ConfirmerSuppressionModal from "../../modals/admin/ConfirmerSuppressionModal";
import { Loader2, Pencil, Trash2, PlusCircle, Search } from "lucide-react";

// --- Interfaces (inchangées) ---

interface Categorie {
  id: number;
  nom: string;
  description: string;
}

interface Materiel {
  id: number;
  nom: string;
  numeroSerie: string;
  localisation: string;
  statut: string;
  categorie: Categorie;
}

interface Technicien {
  id: number;
  nom_complet: string;
  email: string;
  role: string;
}

interface Maintenance {
  id: number;
  materiel: Materiel;
  technicien: Technicien;
  description: string; // ✅ description de la tâche
  dateDebut: string;
  priorite: "BASSE" | "MOYENNE" | "HAUTE" | "URGENTE";
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";
}

// --- Composant Principal ---

const AssignerMaintenances: React.FC = () => {
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]); // Nouvel état pour les techniciens
  const [loading, setLoading] = useState(true);

  // --- États des Modals ---
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] =
    useState<Maintenance | null>(null);

  // --- États de Filtrage et Recherche (Nouveaux) ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterTechnicianId, setFilterTechnicianId] = useState<string>("");

  // --- Fonctions de Chargement des Données ---

  const fetchMaintenances = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/api/maintenances/");
      setMaintenances(response.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement des maintenances :", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/utilisateurs/");
      // Si la réponse est un tableau directement :
      const users = Array.isArray(response.data) ? response.data : response.data.data;
      const techs = users.filter((user: Technicien) => user.role === "TECHNICIEN");
      setTechniciens(techs);
    } catch (error) {
      console.error("Erreur lors du chargement des techniciens :", error);
    }
  };
  

  // --- Effets de Chargement ---

  useEffect(() => {
    fetchMaintenances();
    fetchTechnicians(); // Charger les techniciens au montage
  }, []);

  // --- Logique de Filtrage et Recherche (Utilisation de useMemo pour l'optimisation) ---

  const filteredMaintenances = useMemo(() => {
    let list = maintenances;

    // 1. Filtrage par Statut
    if (filterStatus) {
      list = list.filter((m) => m.statut === filterStatus);
    }

    // 2. Filtrage par Technicien
    if (filterTechnicianId) {
      const id = parseInt(filterTechnicianId, 10);
      list = list.filter((m) => m.technicien.id === id);
    }

    // 3. Recherche par Terme (Materiel, Numéro de Série, Technicien, Description)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      list = list.filter((m) =>
        m.materiel.nom.toLowerCase().includes(searchLower) ||
        m.materiel.numeroSerie.toLowerCase().includes(searchLower) ||
        m.technicien.nom_complet.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
      );
    }

    return list;
  }, [maintenances, filterStatus, filterTechnicianId, searchTerm]);

  // --- Fonction de Suppression ---

  const handleDeleteMaintenance = async () => {
    if (!selectedMaintenance) return;
    try {
      await axios.delete(`http://localhost:3000/api/maintenances/${selectedMaintenance.id}`);
      setShowDeleteModal(false);
      fetchMaintenances(); // Recharger la liste après suppression
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  // --- Rendu du Composant ---

  // Définition des options pour le filtre de statut
  const statutOptions = [
    { value: "", label: "Tous les statuts" },
    { value: "PLANIFIEE", label: "Planifiée" },
    { value: "EN_COURS", label: "En cours" },
    { value: "TERMINEE", label: "Terminée" },
    { value: "ANNULEE", label: "Annulée" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />

      <main className="flex-1 ml-64 p-8 transition-all">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-2">
            🧰 Gestion des Maintenances
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition transform hover:scale-[1.02]"
          >
            <PlusCircle className="w-5 h-5" />
            Planifier une maintenance
          </button>
        </div>

        {/* --- Section Filtres et Recherche (Amélioration UX) --- */}
        <div className="bg-white p-6 rounded-2xl shadow-md mb-8 flex flex-wrap gap-4 items-end">
          {/* Recherche */}
          <div className="flex-1 min-w-[200px]">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Rechercher (Matériel, Technicien, Tâche...)
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                placeholder="Entrez un mot-clé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          {/* Filtre Statut */}
          <div className="min-w-[150px]">
            <label
              htmlFor="filterStatus"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrer par statut
            </label>
            <select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            >
              {statutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre Technicien */}
          <div className="min-w-[200px]">
            <label
              htmlFor="filterTechnician"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Filtrer par technicien
            </label>
            <select
  id="filterTechnician"
  value={filterTechnicianId}
  onChange={(e) => setFilterTechnicianId(e.target.value)}
  className="w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
>
  <option value="">Tous les techniciens</option>
  {techniciens.map((tech) => (
    <option key={tech.id} value={tech.id}>
      {tech.nom_complet}
    </option>
  ))}
</select>

          </div>
        </div>
        {/* --- Fin Section Filtres --- */}

        {/* Tableau des Maintenances */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-10 text-gray-500">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Chargement des maintenances...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50 text-gray-700 sticky top-0">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-bold uppercase tracking-wider">
                    Matériel
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold uppercase tracking-wider">
                    Technicien
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold uppercase tracking-wider">
                    Date prévue
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold uppercase tracking-wider">
                    Priorité
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="py-3 px-4 text-left text-sm font-bold uppercase tracking-wider">
                    Tâche
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-bold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredMaintenances.length > 0 ? (
                  filteredMaintenances.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-800">
                          {m.materiel.nom}
                        </span>
                        <span className="text-gray-500 text-xs block">
                          N° Série: {m.materiel.numeroSerie}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-700 font-medium">
                        {m.technicien.nom_complet}
                      </td>

                      <td className="py-3 px-4 text-gray-700 text-sm">
                        {new Date(m.dateDebut).toLocaleDateString("fr-FR")}
                      </td>

                      {/* Priorité (Meilleure lisibilité) */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                            m.priorite === "URGENTE"
                              ? "bg-red-50 text-red-700 ring-1 ring-red-600/20"
                              : m.priorite === "HAUTE"
                              ? "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20"
                              : m.priorite === "MOYENNE"
                              ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                              : "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                          }`}
                        >
                          {m.priorite}
                        </span>
                      </td>

                      {/* Statut (Meilleure lisibilité) */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${
                            m.statut === "PLANIFIEE"
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20"
                              : m.statut === "EN_COURS"
                              ? "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20"
                              : m.statut === "TERMINEE"
                              ? "bg-green-50 text-green-700 ring-1 ring-green-600/20"
                              : "bg-gray-100 text-gray-600 ring-1 ring-gray-400/20"
                          }`}
                        >
                          {m.statut.replace("_", " ")}
                        </span>
                      </td>

                      {/* Tâche à effectuer */}
                      <td className="py-3 px-4 text-gray-700 max-w-xs text-sm">
                        <p className="truncate" title={m.description}>
                          {m.description || "N/A"}
                        </p>
                      </td>

                      {/* Actions avec icônes uniquement */}
                      <td className="py-3 px-4 text-center flex justify-center gap-2">
                        <button
                          title="Modifier"
                          disabled={m.statut === "EN_COURS" || m.statut === "TERMINEE"}
                          onClick={() => {
                            setSelectedMaintenance(m);
                            setShowEditModal(true);
                          }}
                          className={`p-2 rounded-full transition duration-150 ease-in-out ${
                            m.statut === "EN_COURS" || m.statut === "TERMINEE"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "text-yellow-700 hover:bg-yellow-100/70"
                          }`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>

                        <button
                          title="Supprimer"
                          disabled={m.statut === "EN_COURS" || m.statut === "TERMINEE"}
                          onClick={() => {
                            setSelectedMaintenance(m);
                            setShowDeleteModal(true);
                          }}
                          className={`p-2 rounded-full transition duration-150 ease-in-out ${
                            m.statut === "EN_COURS" || m.statut === "TERMINEE"
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "text-red-700 hover:bg-red-100/70"
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8 text-gray-500 text-lg italic bg-gray-50"
                    >
                      {loading ? (
                        <div className="flex justify-center items-center">
                          <Loader2 className="animate-spin w-5 h-5 mr-2" />
                          Recherche en cours...
                        </div>
                      ) : (
                        "Aucune maintenance ne correspond à vos critères de recherche/filtrage."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Modals */}
      {showModal && (
        <PlanifierMaintenanceModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchMaintenances}
        />
      )}
      {showEditModal && selectedMaintenance && (
        <ModifierMaintenanceModal
          maintenance={selectedMaintenance}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchMaintenances}
        />
      )}
      {showDeleteModal && selectedMaintenance && (
        <ConfirmerSuppressionModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteMaintenance}
          message={`Supprimer la maintenance du matériel "${selectedMaintenance.materiel.nom}" ?`}
        />
      )}
    </div>
  );
};

export default AssignerMaintenances;