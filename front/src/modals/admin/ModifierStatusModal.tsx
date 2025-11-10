import React, { useState } from "react";
import axios from "axios";
import { X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface ModifierStatusModalProps {
  utilisateur: {
    id: number;
    nom_complet: string;
    email: string;
    status: "ACTIF" | "INACTIF";
  };
  onClose: () => void;
  onUpdated: () => void;
}

export const ModifierStatusModal: React.FC<ModifierStatusModalProps> = ({
  utilisateur,
  onClose,
  onUpdated,
}) => {
  const [status, setStatus] = useState(utilisateur.status);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await axios.patch(`http://localhost:3000/api/utilisateurs/${utilisateur.id}/status`, {
        status,
      });

      toast.success("✅ Statut mis à jour avec succès !");
      onUpdated();
      onClose();
    } catch (error) {
      console.error(error);
      toast.error("❌ Erreur lors de la mise à jour du statut !");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white w-[95%] max-w-md rounded-2xl shadow-2xl p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Modifier le statut
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Informations utilisateur */}
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <p className="text-gray-800 font-medium">{utilisateur.nom_complet}</p>
          <p className="text-sm text-gray-500">{utilisateur.email}</p>
        </div>

        {/* Sélection du statut */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Nouveau statut :
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setStatus("ACTIF")}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                status === "ACTIF"
                  ? "bg-green-600 text-white border-green-600"
                  : "border-gray-300 text-gray-600 hover:bg-green-50"
              }`}
            >
              ✅ Actif
            </button>
            <button
              type="button"
              onClick={() => setStatus("INACTIF")}
              className={`flex-1 px-4 py-2 rounded-lg border font-medium transition-all ${
                status === "INACTIF"
                  ? "bg-red-600 text-white border-red-600"
                  : "border-gray-300 text-gray-600 hover:bg-red-50"
              }`}
            >
              🚫 Inactif
            </button>
          </div>
        </div>

        {/* Boutons d’action */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-2 transition-all disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
