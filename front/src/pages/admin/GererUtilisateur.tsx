import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Search, Eye, Loader2 } from "lucide-react";
import { SidebarAdmin } from "../../components/SidebarAdmin";

import { ModifierStatusModal } from "../../modals/admin/ModifierStatusModal";
import { ConfirmDeleteModal } from "../../modals/admin/ConfirmDeleteModal";

interface Domaine {
  id: number;
  nom: string;
}

interface Utilisateur {
  id: number;
  nom_complet: string;
  email: string;
  photo?: string | null;
  role: "ADMIN" | "TECHNICIEN";
  status: "ACTIF" | "INACTIF";
  domaineId?: number | null;
  domaine?: Domaine | null;
  createdAt: string;
  updatedAt: string;
}

export const GererUtilisateur = () => {
  const [deleteModalUser, setDeleteModalUser] = useState<Utilisateur | null>(null);
  const [search, setSearch] = useState("");
  const [utilisateurs, setUtilisateurs] = useState<Utilisateur[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState<Utilisateur | null>(null);
  const [refresh, setRefresh] = useState(false); // pour recharger après suppression
  const [deleting, setDeleting] = useState<number | null>(null);

  const [statusModalUser, setStatusModalUser] = useState<Utilisateur | null>(null);
  // 🔹 Charger les utilisateurs depuis le backend
  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const res = await axios.get<Utilisateur[]>(
          "http://localhost:3000/api/utilisateurs"
        );
        setUtilisateurs(res.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des utilisateurs");
      } finally {
        setLoading(false);
      }
    };
    fetchUtilisateurs();
  }, [refresh]);

  // 🔹 Filtrer par nom ou email
  const filtered = utilisateurs.filter(
    (u) =>
      u.nom_complet.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    try {
      setDeleting(id);
      await axios.delete(`http://localhost:3000/api/utilisateurs/${id}`);
      setRefresh(!refresh);
      setDeleteModalUser(null);
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression de l'utilisateur.");
    } finally {
      setDeleting(null);
    }
  };
  

  return (
    <>
      <SidebarAdmin />

      <div className="min-h-screen bg-gray-50 p-6 md:ml-64">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md p-6 mt-4">
          {/* 🔹 En-tête */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Gestion des utilisateurs
            </h1>
            
          </div>

          {/* 🔹 Recherche */}
          <div className="mt-6 flex items-center bg-gray-100 rounded-lg px-3 py-2 w-full md:w-1/2">
            <Search className="text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none px-2 w-full text-gray-700"
            />
          </div>

          {/* 🔹 Table */}
          {loading ? (
            <p className="text-center py-6 text-gray-500">
              Chargement des utilisateurs...
            </p>
          ) : error ? (
            <p className="text-center py-6 text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto mt-6">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-100 text-blue-900 text-left">
                    <th className="px-4 py-3 rounded-tl-lg">Photo</th>
                    <th className="px-4 py-3">Nom complet</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Rôle</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="px-4 py-3">Domaine</th>
                    <th className="px-4 py-3 text-center rounded-tr-lg">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr
                      key={u.id}
                      className={`border-b hover:bg-gray-50 ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      {/* Photo */}
                      <td className="px-4 py-3">
                        {u.photo ? (
                          <img
                            src={
                              u.photo.startsWith("http")
                                ? u.photo
                                : `http://localhost:3000${u.photo}`
                            }
                            alt={u.nom_complet}
                            className="w-10 h-10 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                            ?
                          </div>
                        )}
                      </td>

                      {/* Nom / Email */}
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {u.nom_complet}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.email}</td>

                      {/* Rôle */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.role === "ADMIN"
                              ? "bg-blue-200 text-blue-800"
                              : "bg-green-200 text-green-800"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Statut */}
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            u.status === "ACTIF"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>

                      {/* Domaine */}
                      <td className="px-4 py-3 text-gray-700">
                        {u.domaine?.nom || "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-center flex justify-center gap-2">
                       

                        <button
  onClick={() => setStatusModalUser(u)}
  className="p-2 bg-green-100 hover:bg-green-200 rounded-lg"
>
  <Edit className="w-4 h-4 text-green-700" />
</button>

<button
  onClick={() => setDeleteModalUser(u)}
  className="p-2 bg-red-100 hover:bg-red-200 rounded-lg"
>
  <Trash2 className="w-4 h-4 text-red-700" />
</button>
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-gray-400">
                        Aucun utilisateur trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

 

{statusModalUser && (
  <ModifierStatusModal
    utilisateur={statusModalUser}
    onClose={() => setStatusModalUser(null)}
    onUpdated={() => setRefresh(!refresh)}
  />
)}


{deleteModalUser && (
  <ConfirmDeleteModal
    userName={deleteModalUser.nom_complet}
    loading={deleting === deleteModalUser.id}
    onCancel={() => setDeleteModalUser(null)}
    onConfirm={() => handleDelete(deleteModalUser.id)}
  />
)}

    </>
  );
};
