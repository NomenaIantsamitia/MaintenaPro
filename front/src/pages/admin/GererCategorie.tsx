import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { SidebarAdmin } from "../../components/SidebarAdmin";

// ============================================================================
// 🌟 Interfaces
// ============================================================================
interface Domaine {
  id: number;
  nom: string;
  description: string;
}

interface Categorie {
  id: number;
  nom: string;
  description: string;
  domaineId?: number;
  domaine?: Domaine;
  nombreMateriels?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// 🔔 Notification
// ============================================================================
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
      ? "bg-green-600"
      : type === "error"
      ? "bg-red-600"
      : "bg-blue-600";
  return (
    <div
      className={`fixed top-5 right-5 ${color} text-white px-4 py-3 rounded-xl shadow-lg z-50`}
    >
      {message}
    </div>
  );
};

// ============================================================================
// 🌟 Composant Principal
// ============================================================================
const GererCategorie: React.FC = () => {
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [selectedDomaine, setSelectedDomaine] = useState<number | "">("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Categorie | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Categorie | null>(
    null
  );

  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const API_URL = "http://localhost:3000/api/categories";
  const API_DOMAINES = "http://localhost:3000/api/domaines/";

  // =====================================================================
  // 🔹 Charger les données
  // =====================================================================
  useEffect(() => {
    fetchCategories();
    fetchDomaines();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get(API_URL);
      setCategories(res.data);
    } catch (error) {
      console.error(error);
      showNotification("Erreur de chargement des catégories.", "error");
    }
  };

  const fetchDomaines = async () => {
    try {
      const res = await axios.get(API_DOMAINES);
      setDomaines(res.data);
    } catch (error) {
      console.error(error);
      showNotification("Erreur de chargement des domaines.", "error");
    }
  };

  // =====================================================================
  // 🔹 Notifications
  // =====================================================================
  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  // =====================================================================
  // 🔹 Gestion des modals
  // =====================================================================
  const openAddModal = () => {
    setEditingCategory(null);
    setNom("");
    setDescription("");
    setSelectedDomaine("");
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Categorie) => {
    setEditingCategory(cat);
    setNom(cat.nom);
    setDescription(cat.description);
    setSelectedDomaine(cat.domaineId || "");
    setIsModalOpen(true);
  };

  const openDeleteModal = (cat: Categorie) => {
    if (cat.nombreMateriels && cat.nombreMateriels > 0) {
      showNotification(
        `Impossible de supprimer : ${cat.nombreMateriels} matériels liés.`,
        "error"
      );
      return;
    }
    setCategoryToDelete(cat);
    setIsDeleteModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);
  const closeDeleteModal = () => setIsDeleteModalOpen(false);

  const modalTitle = useMemo(
    () =>
      editingCategory
        ? "Modifier la Catégorie"
        : "Ajouter une Nouvelle Catégorie",
    [editingCategory]
  );

  // =====================================================================
  // 🔹 Ajouter / Modifier une catégorie
  // =====================================================================
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom.trim()) {
      showNotification("Le nom de la catégorie est obligatoire.", "error");
      return;
    }

    if (!selectedDomaine) {
      showNotification("Veuillez sélectionner un domaine.", "error");
      return;
    }

    try {
      if (editingCategory) {
        await axios.put(`${API_URL}/${editingCategory.id}`, {
          nom,
          description,
          domaineId: selectedDomaine,
        });
        showNotification(`Catégorie "${nom}" modifiée.`, "success");
      } else {
        await axios.post(API_URL, {
          nom,
          description,
          domaineId: selectedDomaine,
        });
        showNotification(`Catégorie "${nom}" ajoutée.`, "success");
      }

      closeModal();
      fetchCategories();
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors de la sauvegarde.", "error");
    }
  };

  // =====================================================================
  // 🔹 Supprimer une catégorie
  // =====================================================================
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(`${API_URL}/${categoryToDelete.id}`);
      showNotification(
        `Catégorie "${categoryToDelete.nom}" supprimée.`,
        "success"
      );
      fetchCategories();
      closeDeleteModal();
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors de la suppression.", "error");
    }
  };

  // =====================================================================
  // 🌈 DESIGN UI/UX
  // =====================================================================
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar Fixe */}
      <SidebarAdmin />

      {/* Contenu principal */}
      <main className="flex-1 md:ml-64 p-6 transition-all duration-300">
        <ToastNotification
          message={notification?.message || ""}
          type={notification?.type || "info"}
        />

        <div className="max-w-7xl mx-auto">
          {/* En-tête */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">
              📁 Gestion des Catégories
            </h1>
            <button
              onClick={openAddModal}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition-all"
            >
              ➕ Nouvelle Catégorie
            </button>
          </header>

          {/* Tableau */}
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Domaine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">
                    Matériels Liés
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-blue-50 transition-all">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {cat.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cat.description || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cat.domaine?.nom || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          cat.nombreMateriels && cat.nombreMateriels > 0
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {cat.nombreMateriels ?? 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => openDeleteModal(cat)}
                        className={`font-semibold ${
                          cat.nombreMateriels && cat.nombreMateriels > 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-600 hover:text-red-800"
                        }`}
                        disabled={!!(cat.nombreMateriels && cat.nombreMateriels > 0)}
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {categories.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Aucune catégorie disponible.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- Modal d'ajout/modification --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">{modalTitle}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  placeholder="Ex: Serveurs"
                  required
                />
              </div>

              {/* Sélection Domaine */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domaine
                </label>
                <select
                  value={selectedDomaine}
                  onChange={(e) =>
                    setSelectedDomaine(
                      e.target.value ? Number(e.target.value) : ""
                    )
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
                  required
                >
                  <option value="">-- Sélectionnez un domaine --</option>
                  {domaines.map((domaine) => (
                    <option key={domaine.id} value={domaine.id}>
                      {domaine.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-semibold shadow"
                >
                  {editingCategory ? "Sauvegarder" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- Modal de suppression --- */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-red-600 mb-3">Confirmation</h2>
            <p className="text-gray-700 mb-6">
              Supprimer la catégorie{" "}
              <strong>{categoryToDelete.nom}</strong> ? Cette action est
              irréversible.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GererCategorie;
