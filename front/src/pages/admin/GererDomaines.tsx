import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { SidebarAdmin } from "../../components/SidebarAdmin";

// --- Interface TypeScript ---
interface Domaine {
  id: number;
  nom: string;
  description: string;
  nombreCategories: number;
  createdAt?: string;
  updatedAt?: string;
}

// --- Notification ---
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

const GererDomaines: React.FC = () => {
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDomaine, setEditingDomaine] = useState<Domaine | null>(null);
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    domaine: Domaine | null;
  }>({ isOpen: false, domaine: null });

  const API_URL = "http://localhost:3000/api/domaines";

  // --- Notification ---
  const showNotification = useCallback(
    (message: string, type: "success" | "error" | "info" = "info") => {
      setNotification({ message, type });
      setTimeout(() => setNotification(null), 3000);
    },
    []
  );

  // --- Charger les domaines depuis l’API ---
  const fetchDomaines = useCallback(async () => {
    try {
      const res = await axios.get(API_URL);
      setDomaines(res.data);
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors du chargement des domaines.", "error");
    }
  }, [API_URL, showNotification]);

  useEffect(() => {
    fetchDomaines();
  }, [fetchDomaines]);

  // --- Formulaire ---
  const resetForm = () => {
    setNom("");
    setDescription("");
    setEditingDomaine(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (domaine: Domaine) => {
    setEditingDomaine(domaine);
    setNom(domaine.nom);
    setDescription(domaine.description);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  // --- Sauvegarder ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom || !description) {
      showNotification("Veuillez remplir le nom et la description.", "error");
      return;
    }

    try {
      if (editingDomaine) {
        await axios.put(`${API_URL}/${editingDomaine.id}`, { nom, description });
        showNotification(`Domaine "${nom}" mis à jour.`, "success");
      } else {
        await axios.post(API_URL, { nom, description });
        showNotification(`Nouveau domaine "${nom}" créé.`, "success");
      }

      await fetchDomaines();
      closeModal();
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors de l'enregistrement du domaine.", "error");
    }
  };

  // --- Ouvrir modal de suppression ---
  const openDeleteModal = (domaine: Domaine) => {
    if (domaine.nombreCategories > 0) {
      showNotification(
        `Impossible de supprimer "${domaine.nom}" : ${domaine.nombreCategories} catégorie(s) associée(s).`,
        "error"
      );
      return;
    }
    setDeleteModal({ isOpen: true, domaine });
  };

  // --- Confirmer suppression ---
  const confirmDelete = async () => {
    const domaine = deleteModal.domaine;
    if (!domaine) return;

    try {
      await axios.delete(`${API_URL}/${domaine.id}`);
      setDomaines(domaines.filter((d) => d.id !== domaine.id));
      showNotification(`Domaine "${domaine.nom}" supprimé avec succès.`, "success");
    } catch (error) {
      console.error(error);
      showNotification("Erreur lors de la suppression.", "error");
    } finally {
      setDeleteModal({ isOpen: false, domaine: null });
    }
  };

  // --- Rendu ---
  return (
    <div className="flex bg-gray-50 min-h-screen">
      <SidebarAdmin />

      <div className="flex-1 md:ml-64 p-6 transition-all duration-300">
        <ToastNotification
          message={notification?.message || ""}
          type={notification?.type || "info"}
        />

        <header className="flex flex-wrap justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            🌐 Gestion des Domaines d’Intervention
          </h1>
          <button
            onClick={openAddModal}
            className="mt-4 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300"
          >
            ➕ Ajouter un Domaine
          </button>
        </header>

        {/* ✅ Tableau */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Domaine
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    Catégories liées
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {domaines.map((domaine) => (
                  <tr
                    key={domaine.id}
                    className="hover:bg-indigo-50 transition duration-150"
                  >
                    <td className="px-6 py-4 font-medium text-indigo-700">
                      {domaine.nom}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-sm">
                      {domaine.description}
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-800">
                      {domaine.nombreCategories}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <button
                        onClick={() => openEditModal(domaine)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => openDeleteModal(domaine)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {domaines.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Aucun domaine d'intervention trouvé.</p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Modal ajout / modification */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg m-4">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {editingDomaine ? "📝 Modifier le Domaine" : "➕ Ajouter un Domaine"}
            </h3>
            <form onSubmit={handleSave}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du Domaine <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingDomaine
                    ? "Sauvegarder les Modifications"
                    : "Créer le Domaine"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ✅ Modal suppression */}
      {deleteModal.isOpen && deleteModal.domaine && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              ⚠️ Confirmation de suppression
            </h2>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer le domaine{" "}
              <span className="font-semibold text-red-600">
                "{deleteModal.domaine.nom}"
              </span>
              ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal({ isOpen: false, domaine: null })}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GererDomaines;
