import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Calendar, ClipboardList, Wrench, UserCog, Loader2, AlertTriangle } from "lucide-react";

interface Domaine {
  id: number;
  nom: string;
}

interface Categorie {
  id: number;
  nom: string;
  description: string;
  domaine: Domaine;
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
  domaine?: Domaine;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const PlanifierMaintenanceModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [materiels, setMateriels] = useState<Materiel[]>([]);
  const [techniciens, setTechniciens] = useState<Technicien[]>([]);
  const [filteredMateriels, setFilteredMateriels] = useState<Materiel[]>([]);
  const [filteredTechniciens, setFilteredTechniciens] = useState<Technicien[]>([]);
  const [materielId, setMaterielId] = useState<number | null>(null);
  const [technicienId, setTechnicienId] = useState<number | null>(null);
  const [description, setDescription] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [priorite, setPriorite] = useState<"BASSE" | "MOYENNE" | "HAUTE" | "URGENTE">("MOYENNE");
  const [loading, setLoading] = useState(false);

  // Charger les données
  useEffect(() => {
    const fetchSelectionData = async () => {
      try {
        const [materielsRes, techniciensRes] = await Promise.all([
          axios.get("http://localhost:3000/api/maintenances/materiels-en-panne"),
          axios.get("http://localhost:3000/api/maintenances/techniciens-du-domaine-pannes"),
        ]);
        setMateriels(materielsRes.data.data);
        setTechniciens(techniciensRes.data.data);
        setFilteredMateriels(materielsRes.data.data);
        setFilteredTechniciens(techniciensRes.data.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des données ⚠️");
        console.error(error);
      }
    };
    fetchSelectionData();
  }, []);

  // Filtrer les techniciens selon le domaine du matériel choisi
  useEffect(() => {
    if (materielId !== null) {
      const materiel = materiels.find((m) => m.id === materielId);
      if (materiel) {
        const domaineNom = materiel.categorie?.domaine?.nom;
        const techniciensFiltres = techniciens.filter(
          (t) => t.domaine?.nom === domaineNom
        );
        setFilteredTechniciens(techniciensFiltres);
      }
    } else {
      setFilteredTechniciens(techniciens);
    }
  }, [materielId, materiels, techniciens]);

  // Filtrer les matériels selon le domaine du technicien choisi
  useEffect(() => {
    if (technicienId !== null) {
      const technicien = techniciens.find((t) => t.id === technicienId);
      if (technicien?.domaine) {
        const domaineNom = technicien.domaine.nom;
        const materielsFiltres = materiels.filter(
          (m) => m.categorie?.domaine?.nom === domaineNom
        );
        setFilteredMateriels(materielsFiltres);
      }
    } else {
      setFilteredMateriels(materiels);
    }
  }, [technicienId, techniciens, materiels]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materielId || !technicienId || !description || !dateDebut) {
      toast.error("Veuillez remplir tous les champs ⚠️");
      return;
    }

    const payload = {
      materielId,
      technicienId,
      description,
      dateDebut,
      priorite,
      statut: "PLANIFIEE",
    };

    try {
      setLoading(true);
      await axios.post("http://localhost:3000/api/maintenances", payload);
      toast.success("✅ Maintenance planifiée avec succès !");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Erreur lors de la création :", error.response?.data);
      toast.error(error.response?.data?.message || "Erreur lors de la planification ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-40">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Wrench className="text-blue-600 w-6 h-6" />
          Planifier une maintenance
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Matériel */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Matériel en panne
            </label>
            <div className="relative">
              <ClipboardList className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <select
                value={materielId ?? ""}
                onChange={(e) => setMaterielId(e.target.value ? Number(e.target.value) : null)}
                className="w-full border rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Sélectionner --</option>
                {filteredMateriels.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nom} ({m.numeroSerie}) — {m.categorie?.domaine?.nom}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Technicien */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Technicien
            </label>
            <div className="relative">
              <UserCog className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <select
                value={technicienId ?? ""}
                onChange={(e) => setTechnicienId(e.target.value ? Number(e.target.value) : null)}
                className="w-full border rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">-- Sélectionner --</option>
                {filteredTechniciens.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nom_complet} — {t.domaine?.nom || "Aucun domaine"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Date prévue
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
                className="w-full border rounded-lg pl-10 p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Priorité
            </label>
            <select
              value={priorite}
              onChange={(e) => setPriorite(e.target.value as "BASSE" | "MOYENNE" | "HAUTE" | "URGENTE")}
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="BASSE">Basse</option>
              <option value="MOYENNE">Moyenne</option>
              <option value="HAUTE">Haute</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Décrire la maintenance à effectuer..."
              className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          {/* Boutons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wrench className="w-5 h-5" />}
              {loading ? "En cours..." : "Planifier"}
            </button>
          </div>
        </form>

        {/* Alerte en cas de filtrage */}
        {materielId && filteredTechniciens.length === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Aucun technicien trouvé pour ce domaine.
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanifierMaintenanceModal;
