import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2, XCircle, Save } from "lucide-react";

interface MaintenanceModalProps {
  maintenance: any;
  onClose: () => void;
  onUpdated: () => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  maintenance,
  onClose,
  onUpdated,
}) => {
  const [statut, setStatut] = useState(maintenance?.statut || "PLANIFIEE");
  const [rapportTechnicien, setRapportTechnicien] = useState("");
  const [loadingRapport, setLoadingRapport] = useState(true);
  const [loading, setLoading] = useState(false);

  // --- Chargement du rapport existant ---
  useEffect(() => {
    if (maintenance) {
      setStatut(maintenance.statut);
      const fetchRapport = async () => {
        try {
          const res = await axios.get(
            `http://localhost:3000/api/rapports/${maintenance.id}`
          );
          if (res.data && res.data.length > 0) {
            setRapportTechnicien(res.data[0].contenu);
          } else {
            setRapportTechnicien("");
          }
        } catch (error) {
          console.error("Erreur lors du chargement du rapport :", error);
        } finally {
          setLoadingRapport(false);
        }
      };
      fetchRapport();
    }
  }, [maintenance]);

  if (!maintenance) return null;

  // --- Règles de transitions ---
  const transitions: Record<string, string[]> = {
    PLANIFIEE: ["EN_COURS", "ANNULEE"],
    EN_COURS: ["TERMINEE", "ANNULEE"],
    TERMINEE: [],
    ANNULEE: [],
  };

  const isTerminee = maintenance.statut === "TERMINEE";
  const isAnnulee = maintenance.statut === "ANNULEE";
  const statutPossible = transitions[maintenance.statut] || [];

  // --- Soumission du formulaire ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ⚠️ Blocage si close
      if (isTerminee || isAnnulee) {
        toast.warning("⚠️ Cette maintenance est close et ne peut plus être modifiée.");
        setLoading(false);
        return;
      }

      // ✅ Mise à jour du statut
      await axios.put(
        `http://localhost:3000/api/maintenances/${maintenance.id}/statut`,
        { statut }
      );

      // 🧾 Création ou mise à jour du rapport (uniquement si en cours ou terminée)
      if (["EN_COURS", "TERMINEE"].includes(statut)) {
        await axios.post("http://localhost:3000/api/rapports", {
          maintenanceId: maintenance.id,
          contenu: rapportTechnicien.trim(),
        });
      }

      toast.success("✅ Maintenance mise à jour avec succès !");
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de la mise à jour de la maintenance.");
    } finally {
      setLoading(false);
    }
  };

  const { materiel } = maintenance;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-3xl transition-all animate-fadeIn">
        {/* --- En-tête --- */}
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h3 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
            🛠️ Détails de la maintenance
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 transition-colors"
          >
            <XCircle size={28} />
          </button>
        </div>

        {/* --- Infos Matériel --- */}
        <div className="bg-indigo-50 p-5 rounded-xl mb-6">
          <h4 className="text-lg font-semibold text-indigo-700 mb-3">
            Informations du matériel
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Nom :</p>
              <p>{materiel?.nom}</p>
            </div>
            <div>
              <p className="font-semibold">N° Série :</p>
              <p>{materiel?.numeroSerie}</p>
            </div>
            <div>
              <p className="font-semibold">Localisation :</p>
              <p>{materiel?.localisation}</p>
            </div>
            <div>
              <p className="font-semibold">Catégorie :</p>
              <p>{materiel?.categorie?.nom || "Non spécifiée"}</p>
            </div>
          </div>
        </div>

        {/* --- Formulaire --- */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* --- Statut + Tâche --- */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau Statut
              </label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                disabled={isTerminee || isAnnulee || statutPossible.length === 0}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-400 transition ${
                  isTerminee || isAnnulee
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white"
                }`}
              >
                <option value={maintenance.statut}>
                  {maintenance.statut.replace("_", " ")}
                </option>
                {statutPossible.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tâche planifiée
              </label>
              <div className="p-3 bg-gray-100 border border-gray-300 rounded-lg h-full text-sm text-gray-800">
                {maintenance.description}
              </div>
            </div>
          </div>

          {/* --- Rapport du technicien --- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rapport du technicien
            </label>
            {loadingRapport ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="animate-spin" /> Chargement du rapport...
              </div>
            ) : (
              <textarea
                value={rapportTechnicien}
                onChange={(e) => setRapportTechnicien(e.target.value)}
                rows={6}
                disabled={isAnnulee || isTerminee}
                className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 transition resize-none ${
                  isAnnulee || isTerminee
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-white"
                }`}
                placeholder="Décrivez ici votre intervention..."
              />
            )}
          </div>

          {/* --- Boutons --- */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              <XCircle size={18} /> Fermer
            </button>

            <button
              type="submit"
              disabled={loading || isTerminee || isAnnulee}
              className={`flex items-center gap-2 px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow-md transition ${
                loading || isTerminee || isAnnulee
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Enregistrement...
                </>
              ) : (
                <>
                  <Save size={18} /> Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;
