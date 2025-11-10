import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { SidebarAdmin } from "../../components/SidebarAdmin";

// --- Interfaces TypeScript ---
interface Materiel {
  id: number;
  nom: string;
  numeroSerie: string;
  categorieId: number;
  statut: "ACTIF" | "EN_MAINTENANCE" | "EN_PANNE" | "STOCK";
  dateAcquisition: string;
  localisation: string;
  categorie?: { id: number; nom: string };
}

interface Categorie {
  id: number;
  nom: string;
}

// --- Statuts disponibles (Liste complète pour l'affichage/filtre) ---
const statutsMateriel: Materiel["statut"][] = [
  "ACTIF",
  "EN_MAINTENANCE",
  "EN_PANNE",

];

// --- Statuts modifiables dans le formulaire (Exclut souvent 'STOCK') ---
// L'admin gère l'état opérationnel, pas l'état initial de stock.
const statutsModifiables: Materiel["statut"][] = [
  "ACTIF",

  "EN_PANNE",
];

// --- Notification Toast ---
const ToastNotification = ({
  message,
  type,
}: {
  message: string;
  type: "success" | "error" | "info";
}) => {
  if (!message) return null;
  const color =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";
  return (
    <div
      className={`fixed top-4 right-4 ${color} text-white p-3 rounded-lg shadow-xl z-50 transition-opacity duration-300`}
    >
      {message}
    </div>
  );
};

// =========================================================================
// Composant Principal : GererMateriels
// =========================================================================

const GererMateriels: React.FC = () => {
  // États
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMateriel, setEditingMateriel] = useState<Materiel | null>(null);

  // Filtres / Recherche
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorieId, setFilterCategorieId] = useState<string>("");
  const [filterStatut, setFilterStatut] = useState<string>("");

  // Formulaire
  const [nom, setNom] = useState("");
  const [numeroSerie, setNumeroSerie] = useState("");
  const [categorieId, setCategorieId] = useState<number | "">("");
  // Statut par défaut pour l'ajout : ACTIF
  const [statut, setStatut] = useState<Materiel["statut"]>("ACTIF"); 
  const [dateAcquisition, setDateAcquisition] = useState("");
  const [localisation, setLocalisation] = useState("");

  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  // ---------------- Notifications ----------------

  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  // ---------------- API via Axios ----------------

  const fetchMateriels = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/materiels");
      setMateriels(data);
    } catch {
      showNotification("Erreur lors du chargement des matériels.", "error");
    }
  }, [showNotification]);

  const fetchCategories = useCallback(async () => {
    try {
      const { data } = await axios.get("http://localhost:3000/api/categories");
      setCategories(data);
    } catch {
      showNotification("Erreur lors du chargement des catégories.", "error");
    }
  }, [showNotification]);

  useEffect(() => {
    fetchMateriels();
    fetchCategories();
  }, [fetchMateriels, fetchCategories]);

  // ---------------- Utilitaires ----------------

  const getCategorieNom = (id: number) =>
    categories.find((c) => c.id === id)?.nom || "Inconnu";

  const getStatutBadge = (statut: Materiel["statut"]) => {
    const base = "px-3 py-1 text-xs font-semibold rounded-full";
    switch (statut) {
      case "ACTIF":
        return `${base} bg-green-100 text-green-800`;
      case "EN_MAINTENANCE":
        return `${base} bg-yellow-100 text-yellow-800`;
      case "EN_PANNE":
        return `${base} bg-red-100 text-red-800`;
      default: // STOCK
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  // ---------------- Filtrage / Recherche ----------------

  const filteredMateriels = useMemo(() => {
    let result = [...materiels];

    if (filterCategorieId)
      result = result.filter(
        (m) => m.categorieId === parseInt(filterCategorieId)
      );

    if (filterStatut) result = result.filter((m) => m.statut === filterStatut);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          m.nom.toLowerCase().includes(term) ||
          m.numeroSerie.toLowerCase().includes(term) ||
          m.localisation.toLowerCase().includes(term)
      );
    }

    return result;
  }, [materiels, filterCategorieId, filterStatut, searchTerm]);

  // ---------------- Gestion Formulaire ----------------

  const resetForm = () => {
    setNom("");
    setNumeroSerie("");
    setCategorieId("");
    setStatut("ACTIF"); // Statut par défaut
    setDateAcquisition("");
    setLocalisation("");
    setEditingMateriel(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (materiel: Materiel) => {
    setEditingMateriel(materiel);
    setNom(materiel.nom);
    setNumeroSerie(materiel.numeroSerie);
    setCategorieId(materiel.categorieId);
    setStatut(materiel.statut);
    setDateAcquisition(materiel.dateAcquisition.split("T")[0]);
    setLocalisation(materiel.localisation);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // ---------------- Sauvegarde (Add / Update) ----------------

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom || !numeroSerie || !categorieId || !dateAcquisition || !localisation) {
      showNotification("Tous les champs sont requis.", "error");
      return;
    }

    // --- LOGIQUE DE VALIDATION DU STATUT AJOUTÉE ---
    if (editingMateriel && statut === "STOCK") {
        // Interdire la modification vers 'STOCK' pour un matériel existant
        showNotification("Un matériel existant ne peut pas être remis en statut 'STOCK' via la modification.", "error");
        return;
    }
    // Si on ajoute, 'STOCK' est aussi exclu des options du select (voir Rendu),
    // donc pas besoin de le valider ici pour l'ajout (il sera 'ACTIF' par défaut).
    // ------------------------------------------------
    const statutsModifiables: Materiel["statut"][] = [
      "ACTIF",
      "EN_PANNE",
    ];
    const payload = {
      nom,
      numeroSerie,
      categorieId: Number(categorieId),
      statut,
      dateAcquisition,
      localisation,
    };

    try {
      if (editingMateriel) {
        await axios.put(
          `http://localhost:3000/api/materiels/${editingMateriel.id}`,
          payload
        );
        showNotification("Matériel modifié avec succès.", "success");
      } else {
        // Logique d'ajout : le statut sera le statut par défaut ou celui sélectionné (par défaut ACTIF)
        await axios.post("http://localhost:3000/api/materiels", payload);
        showNotification("Matériel ajouté avec succès.", "success");
      }

      await fetchMateriels();
      closeModal();
    } catch {
      showNotification("Erreur lors de l’enregistrement.", "error");
    }
  };

  // ---------------- Suppression ----------------

  const handleDelete = async (id: number, nom: string) => {
    if (!window.confirm(`Supprimer le matériel "${nom}" ?`)) return;
    try {
      await axios.delete(`http://localhost:3000/api/materiels/${id}`);
      await fetchMateriels();
      showNotification(`Matériel "${nom}" supprimé.`, "success");
    } catch {
      showNotification("Erreur lors de la suppression.", "error");
    }
  };

  // ---------------- Rendu ----------------

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />

      <div className="flex-1 ml-0 md:ml-64 p-6 transition-all duration-300">
        <ToastNotification
          message={notification?.message || ""}
          type={notification?.type || "info"}
        />

        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📦 Gestion de l'Inventaire Matériel
          </h1>
          <button
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            ➕ Ajouter un Matériel
          </button>
        </header>

        {/* --- Filtres et Recherche --- */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8 flex flex-wrap gap-4 items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un équipement ou une localisation..."
            className="flex-1 min-w-[250px] p-2 border border-gray-300 rounded-lg"
          />
          <select
            value={filterCategorieId}
            onChange={(e) => setFilterCategorieId(e.target.value)}
            className="min-w-[150px] p-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nom}
              </option>
            ))}
          </select>
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="min-w-[150px] p-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="">Tous les statuts</option>
            {statutsMateriel.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* --- Tableau --- */}
        <div className="bg-white shadow-xl rounded-xl overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Série</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Localisation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acquisition</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMateriels.map((m) => (
                <tr key={m.id} className="hover:bg-indigo-50 transition">
                  <td className="px-6 py-4">{m.nom}</td>
                  <td className="px-6 py-4">{m.numeroSerie}</td>
                  <td className="px-6 py-4">{getCategorieNom(m.categorieId)}</td>
                  <td className="px-6 py-4">
                    <span className={getStatutBadge(m.statut)}>{m.statut}</span>
                  </td>
                  <td className="px-6 py-4">{m.localisation}</td>
                  <td className="px-6 py-4">
                    {new Date(m.dateAcquisition).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(m)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(m.id, m.nom)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMateriels.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              Aucun matériel trouvé.
            </div>
          )}
        </div>
      </div>

      {/* --- Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-40">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingMateriel ? "📝 Modifier" : "➕ Ajouter"} un Matériel
            </h3>
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="w-full p-3 border rounded-lg mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Numéro de Série</label>
                  <input
                    value={numeroSerie}
                    onChange={(e) => setNumeroSerie(e.target.value)}
                    className="w-full p-3 border rounded-lg mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                  <select
                    value={categorieId}
                    onChange={(e) => setCategorieId(Number(e.target.value))}
                    className="w-full p-3 border rounded-lg bg-white mt-1"
                    required
                  >
                    <option value="">Choisir une catégorie</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  {/* Utilisation de statutsModifiables pour le contrôle de l'état */}
                  <select
  value={statut}
  onChange={(e) => setStatut(e.target.value as Materiel["statut"])}
  className="w-full p-3 border rounded-lg bg-white mt-1"
  disabled={
    editingMateriel?.statut === "EN_PANNE" || 
    editingMateriel?.statut === "EN_MAINTENANCE"
  }
>
  {/* Ajouter la valeur actuelle si elle ne fait pas partie de statutsModifiables */}
  {!statutsModifiables.includes(statut) && (
    <option value={statut}>{statut}</option>
  )}

  {statutsModifiables.map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
</select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Localisation</label>
                  <input
                    value={localisation}
                    onChange={(e) => setLocalisation(e.target.value)}
                    placeholder="Ex : Bureau A1, Entrepôt, etc."
                    className="w-full p-3 border rounded-lg mt-1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date d’Acquisition</label>
                  <input
                    type="date"
                    value={dateAcquisition}
                    onChange={(e) => setDateAcquisition(e.target.value)}
                    className="w-full p-3 border rounded-lg mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  {editingMateriel ? "Sauvegarder les modifications" : "Ajouter le Matériel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GererMateriels;