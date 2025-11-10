import React, { useState, useEffect, useMemo } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { SidebarAdmin } from "../../components/SidebarAdmin";

// --- Types génériques ---
interface DataRow {
  [key: string]: any;
}

// --- Fonctions d'export ---
const exportToCSV = (data: DataRow[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = data
    .map((row) =>
      headers
        .map((header) => `"${(row[header] ?? "").toString().replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const finalCsv = headers.join(",") + "\n" + csvContent;

  const blob = new Blob([finalCsv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.click();
};

const exportToPDF = (data: DataRow[], filename: string, title: string) => {
  if (data.length === 0) return;
  const doc = new jsPDF();
  const headers = Object.keys(data[0]);
  const head = [headers];
  const body = data.map((row) => headers.map((header) => row[header]?.toString() || ""));

  doc.text(title, 14, 15);
  autoTable(doc, {
    head,
    body,
    startY: 20,
    theme: "striped",
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229] },
  });
  doc.save(`${filename}.pdf`);
};

// --- Composant Principal ---
const ExporterDonnees: React.FC = () => {
  const [selectedDataType, setSelectedDataType] = useState<
    "materiels" | "utilisateurs" | "maintenances" | "categories" | "domaines"
  >("materiels");

  const [isLoading, setIsLoading] = useState(false);
  const [materiels, setMateriels] = useState<DataRow[]>([]);
  const [utilisateurs, setUtilisateurs] = useState<DataRow[]>([]);
  const [maintenances, setMaintenances] = useState<DataRow[]>([]);
  const [categories, setCategories] = useState<DataRow[]>([]);
  const [domaines, setDomaines] = useState<DataRow[]>([]);

  // --- Charger les matériels ---
  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/materiels");
        const formatted = res.data.map((m: any) => ({
          ID: m.id,
          Nom: m.nom,
          "N° Série": m.numeroSerie,
          Statut: m.statut,
          Localisation: m.localisation,
          "Date d’acquisition": new Date(m.dateAcquisition).toLocaleDateString(),
          Catégorie: m.categorie?.nom || "Non définie",
        }));
        setMateriels(formatted);
      } catch (error) {
        console.error("❌ Erreur de récupération des matériels :", error);
      }
    };
    fetchMateriels();
  }, []);

  // --- Charger les utilisateurs ---
  useEffect(() => {
    const fetchUtilisateurs = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/utilisateurs");
        const formatted = res.data.map((u: any) => ({
          ID: u.id,
          Nom: u.nom_complet,
          Email: u.email,
          Rôle: u.role,
          Statut: u.status,
          Domaine: u.domaine?.nom || "Non défini",
          "Date de création": new Date(u.createdAt).toLocaleDateString(),
        }));
        setUtilisateurs(formatted);
      } catch (error) {
        console.error("❌ Erreur de récupération des utilisateurs :", error);
      }
    };
    fetchUtilisateurs();
  }, []);

  // --- Charger les catégories ---
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/categories");
        const formatted = res.data.map((c: any) => ({
          ID: c.id,
          Nom: c.nom,
          Description: c.description,
          Domaine: c.domaine?.nom || "Non défini",
          "Nb Matériels": c.nombreMateriels ?? 0,
          "Créé le": new Date(c.createdAt).toLocaleDateString(),
          "Mis à jour le": new Date(c.updatedAt).toLocaleDateString(),
        }));
        setCategories(formatted);
      } catch (error) {
        console.error("❌ Erreur de récupération des catégories :", error);
      }
    };
    fetchCategories();
  }, []);

  // --- Charger les maintenances ---
  useEffect(() => {
    const fetchMaintenances = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/maintenances/");
        const data = res.data.data || [];
        const formatted = data.map((m: any) => ({
          ID: m.id,
          Matériel: m.materiel?.nom || "Non défini",
          "N° Série": m.materiel?.numeroSerie || "-",
          Technicien: m.technicien?.nom_complet || "Non assigné",
          Description: m.description || "-",
          "Date Début": new Date(m.dateDebut).toLocaleDateString(),
          Statut: m.statut,
          Priorité: m.priorite,
          "Catégorie": m.materiel?.categorie?.nom || "Non définie",
        }));
        setMaintenances(formatted);
      } catch (error) {
        console.error("❌ Erreur de récupération des maintenances :", error);
      }
    };
    fetchMaintenances();
  }, []);

  // --- Charger les domaines ---
  useEffect(() => {
    const fetchDomaines = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/domaines/");
        const data = res.data;
        const formatted = data.map((d: any) => ({
          ID: d.id,
          Nom: d.nom,
          Description: d.description,
          "Nombre de Catégories": d.nombreCategories ?? 0,
          "Créé le": new Date(d.createdAt).toLocaleDateString(),
          "Mis à jour le": new Date(d.updatedAt).toLocaleDateString(),
        }));
        setDomaines(formatted);
      } catch (error) {
        console.error("❌ Erreur de récupération des domaines :", error);
      }
    };
    fetchDomaines();
  }, []);

  // --- Sélection dynamique des données à exporter ---
  const dataToExport = useMemo(() => {
    switch (selectedDataType) {
      case "materiels":
        return materiels;
      case "utilisateurs":
        return utilisateurs;
      case "maintenances":
        return maintenances;
      case "categories":
        return categories;
      case "domaines":
        return domaines;
      default:
        return [];
    }
  }, [selectedDataType, materiels, utilisateurs, maintenances, categories, domaines]);

  // --- Gestion de l'export ---
  const handleExport = (format: "csv" | "pdf") => {
    setIsLoading(true);
    setTimeout(() => {
      const filenameBase = selectedDataType.charAt(0).toUpperCase() + selectedDataType.slice(1);
      const title = `Rapport d'Exportation - ${filenameBase}`;
      if (format === "csv") {
        exportToCSV(dataToExport, `GIN_Export_${filenameBase}`);
      } else {
        exportToPDF(dataToExport, `GIN_Export_${filenameBase}`, title);
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
        <SidebarAdmin />
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        📥 Exporter les Données du Système
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg max-w-2xl mx-auto">
        {/* --- Choix du type de données --- */}
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          1. Choisir le Type de Données
        </h2>
        <div className="mb-8">
          <label htmlFor="dataType" className="block text-sm font-medium text-gray-700 mb-2">
            Sélectionnez l'entité à exporter :
          </label>
          <select
            id="dataType"
            value={selectedDataType}
            onChange={(e) => setSelectedDataType(e.target.value as any)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            disabled={isLoading}
          >
            <option value="materiels">Inventaire Matériel</option>
            <option value="utilisateurs">Liste des Utilisateurs</option>
            <option value="maintenances">Historique des Maintenances</option>
            <option value="categories">Catégories de Matériel</option>
            <option value="domaines">Domaines</option>
          </select>
        </div>

        {/* --- Choix du format --- */}
        <h2 className="text-xl font-semibold text-gray-700 mb-6">
          2. Choisir le Format d'Exportation
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => handleExport("csv")}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white transition duration-150 shadow-md ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Préparation..." : "⬇️ Exporter en CSV"}
          </button>

          <button
            onClick={() => handleExport("pdf")}
            className={`flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-white transition duration-150 shadow-md ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Préparation..." : "⬇️ Exporter en PDF"}
          </button>
        </div>

        {isLoading && (
          <p className="mt-4 text-center text-indigo-600">
            Exportation en cours, veuillez patienter...
          </p>
        )}

        <p className="mt-8 text-sm text-gray-500 border-t pt-4">
          * Les données sont récupérées dynamiquement depuis la base via l’API.
        </p>
      </div>
    </div>
  );
};

export default ExporterDonnees;
