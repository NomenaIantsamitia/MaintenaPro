import React, { useState } from "react";
import axios from "axios";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

interface Maintenance {
  id: number;
  description: string;
  dateDebut: string;
  priorite: "BASSE" | "MOYENNE" | "HAUTE" | "URGENTE";
  statut: "PLANIFIEE" | "EN_COURS" | "TERMINEE" | "ANNULEE";
}

interface Props {
  maintenance: Maintenance;
  onClose: () => void;
  onSuccess: () => void;
}

const ModifierMaintenanceModal: React.FC<Props> = ({ maintenance, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    description: maintenance.description,
    dateDebut: maintenance.dateDebut.split("T")[0],
    priorite: maintenance.priorite,
    statut: maintenance.statut,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:3000/api/maintenances/${maintenance.id}`, formData);
      toast.success("✅ Maintenance modifiée avec succès !");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur :", error);
      toast.error("❌ Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg relative overflow-hidden transform transition-all scale-100 hover:scale-[1.01]">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors"
        >
          <XCircle className="w-6 h-6" />
        </button>

        {/* Titre */}
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          🛠️ Modifier la maintenance
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Description */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              placeholder="Entrez la description de la maintenance"
            />
          </div>

          {/* Date */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">Date de début</label>
            <input
              type="date"
              name="dateDebut"
              value={formData.dateDebut}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>

          {/* Priorité + Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1">Priorité</label>
              <select
                name="priorite"
                value={formData.priorite}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:outline-none transition-all ${
                  formData.priorite === "URGENTE"
                    ? "border-red-400 focus:ring-red-400"
                    : formData.priorite === "HAUTE"
                    ? "border-orange-400 focus:ring-orange-400"
                    : "border-blue-300 focus:ring-blue-400"
                }`}
              >
                <option value="BASSE">🟢 Basse</option>
                <option value="MOYENNE">🟡 Moyenne</option>
                <option value="HAUTE">🟠 Haute</option>
                <option value="URGENTE">🔴 Urgente</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-600 mb-1">Statut</label>
              <select
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              >
                <option value="PLANIFIEE">📅 Planifiée</option>
                <option value="ANNULEE">❌ Annulée</option>
              </select>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "💾 Enregistrer"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierMaintenanceModal;
