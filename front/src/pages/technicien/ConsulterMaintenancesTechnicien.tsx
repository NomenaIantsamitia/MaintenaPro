import React, { useState, useEffect } from "react";
import axios from "axios";
import MaintenanceModal from "../../modals/technicien/MaintenanceModal";
import { SidebarTechnicien } from "../../components/NavbarTechnicien";
import { Loader2 } from "lucide-react";

const ConsulterMaintenancesTechnicien: React.FC = () => {
  const [maintenances, setMaintenances] = useState<any[]>([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [technicienId, setTechnicienId] = useState<number | null>(null);

  // --- Récupération de l'ID du technicien connecté ---
  useEffect(() => {
    const utilisateurData = localStorage.getItem("utilisateur");
    if (utilisateurData) {
      try {
        const utilisateur = JSON.parse(utilisateurData);
        if (utilisateur.role === "TECHNICIEN") {
          setTechnicienId(utilisateur.id);
        } else {
          console.warn("⚠️ L'utilisateur connecté n'est pas un technicien.");
        }
      } catch (err) {
        console.error("❌ Erreur lors de la lecture du localStorage :", err);
      }
    }
  }, []);

  // --- Charger les maintenances ---
  const fetchMaintenances = async (id: number) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:3000/api/maintenances/technicien/${id}`);
      setMaintenances(res.data);
    } catch (err) {
      console.error("❌ Erreur de chargement :", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (technicienId) {
      fetchMaintenances(technicienId);
    }
  }, [technicienId]);

  const openModal = (maintenance: any) => setSelectedMaintenance(maintenance);
  const closeModal = () => setSelectedMaintenance(null);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* ✅ Sidebar persistante */}
      <SidebarTechnicien />

      {/* ✅ Contenu principal */}
      <main className="flex-1 md:ml-64 p-6 sm:p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-emerald-700 flex items-center gap-2">
            🧰 Mes maintenances assignées
          </h1>

          {!technicienId ? (
            <div className="text-center text-gray-600 py-10">
              <Loader2 className="animate-spin w-6 h-6 inline-block mr-2 text-emerald-600" />
              Chargement du profil technicien...
            </div>
          ) : loading ? (
            <div className="flex justify-center items-center py-10 text-emerald-600">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              Chargement des maintenances...
            </div>
          ) : maintenances.length === 0 ? (
            <p className="text-gray-600 text-center py-10">
              Aucune maintenance assignée pour le moment.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-emerald-700 text-white text-left uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">Matériel</th>
                    <th className="px-6 py-3">Description</th>
                    <th className="px-6 py-3">Date début</th>
                    <th className="px-6 py-3">Statut</th>
                    <th className="px-6 py-3">Priorité</th>
                    <th className="px-6 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenances.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-emerald-50 border-b border-gray-200 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">
                        {m.materiel?.nom || "—"}
                      </td>
                      <td className="px-6 py-4">{m.description}</td>
                      <td className="px-6 py-4">
                        {new Date(m.dateDebut).toLocaleDateString()}
                      </td>
                      <td
                        className={`px-6 py-4 font-semibold ${
                          m.statut === "TERMINEE"
                            ? "text-green-600"
                            : m.statut === "EN_COURS"
                            ? "text-yellow-600"
                            : m.statut === "ANNULEE"
                            ? "text-red-500"
                            : "text-gray-700"
                        }`}
                      >
                        {m.statut.replace("_", " ")}
                      </td>
                      <td className="px-6 py-4">{m.priorite}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openModal(m)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md transition-transform hover:scale-105"
                        >
                          Voir / Mettre à jour
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* --- Modal de mise à jour --- */}
      {selectedMaintenance && (
        <MaintenanceModal
          maintenance={selectedMaintenance}
          onClose={closeModal}
          onUpdated={() => technicienId && fetchMaintenances(technicienId)}
        />
      )}
    </div>
  );
};

export default ConsulterMaintenancesTechnicien;
