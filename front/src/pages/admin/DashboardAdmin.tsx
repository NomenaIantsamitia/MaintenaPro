import { useEffect, useState } from "react";
import axios from "axios";
import { SidebarAdmin } from "../../components/SidebarAdmin";
import {
  Wrench,
  Users,
  Server,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

export const DashboardAdmin = () => {
  const [stats, setStats] = useState({
    totalMateriels: 0,
    techniciensActifs: 0,
    maintenancesEnCours: 0,
    maintenancesTerminees: 0,
    pannesDetectees: 0,
    maintenancesPlanifiees: 0,
    maintenancesAnnulees: 0,
  });

  const [monthlyData, setMonthlyData] = useState<{ mois: string; maintenances: number }[]>([]);

  // ✅ Fonction générique pour les requêtes simples
  const fetchData = async (url: string, key: keyof typeof stats) => {
    try {
      const res = await axios.get(url);
      setStats((prev) => ({ ...prev, [key]: res.data[key] ?? 0 }));
    } catch (err) {
      console.error(`❌ Erreur lors du chargement de ${key} :`, err);
    }
  };

  // ✅ Charger les données statistiques
  useEffect(() => {
    fetchData("http://localhost:3000/api/dashboard/total-materiels", "totalMateriels");
    fetchData("http://localhost:3000/api/dashboard/techniciens-actifs", "techniciensActifs");
    fetchData("http://localhost:3000/api/dashboard/maintenances-en-cours", "maintenancesEnCours");
    fetchData("http://localhost:3000/api/dashboard/maintenances-terminees", "maintenancesTerminees");
    fetchData("http://localhost:3000/api/dashboard/pannes-detectees", "pannesDetectees");
    fetchData("http://localhost:3000/api/dashboard/maintenances-planifiees", "maintenancesPlanifiees");
    fetchData("http://localhost:3000/api/dashboard/maintenances-annulees", "maintenancesAnnulees");
    fetchEvolutionMensuelle(); // ✅ appel pour le graphique
  }, []);

  // ✅ Charger les données du graphique d’évolution mensuelle
  const fetchEvolutionMensuelle = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/dashboard/evolution-mensuelle");
      // Vérifie que la réponse est bien un tableau
      if (Array.isArray(res.data)) {
        setMonthlyData(res.data);
      } else {
        console.warn("⚠️ Format inattendu pour evolution-mensuelle :", res.data);
      }
    } catch (err) {
      console.error("❌ Erreur chargement évolution mensuelle :", err);
    }
  };

  // ✅ Données du graphique circulaire
  const maintenanceData = [
    { statut: "Planifiée", value: stats.maintenancesPlanifiees },
    { statut: "En cours", value: stats.maintenancesEnCours },
    { statut: "Terminée", value: stats.maintenancesTerminees },
    { statut: "Annulée", value: stats.maintenancesAnnulees },
  ];

  const COLORS = ["#60A5FA", "#FBBF24", "#34D399", "#EF4444"];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <SidebarAdmin />

      <main className="flex-1 ml-64 p-8 transition-all">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          📊 Tableau de bord administrateur
        </h1>

        {/* 🔹 Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <StatCard
            icon={<Server className="text-blue-600 w-8 h-8" />}
            label="Total matériels"
            value={stats.totalMateriels}
            color="bg-blue-50"
          />
          <StatCard
            icon={<Users className="text-green-600 w-8 h-8" />}
            label="Techniciens actifs"
            value={stats.techniciensActifs}
            color="bg-green-50"
          />
          <StatCard
            icon={<Wrench className="text-yellow-600 w-8 h-8" />}
            label="Maintenances en cours"
            value={stats.maintenancesEnCours}
            color="bg-yellow-50"
          />
          <StatCard
            icon={<CheckCircle className="text-emerald-600 w-8 h-8" />}
            label="Maintenances terminées"
            value={stats.maintenancesTerminees}
            color="bg-emerald-50"
          />
          <StatCard
            icon={<AlertTriangle className="text-red-600 w-8 h-8" />}
            label="Pannes détectées"
            value={stats.pannesDetectees}
            color="bg-red-50"
          />
          <StatCard
            icon={<BarChart3 className="text-indigo-600 w-8 h-8" />}
            label="Planifiées"
            value={stats.maintenancesPlanifiees}
            color="bg-indigo-50"
          />
        </div>

        {/* 🔹 Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-10">
          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Répartition des maintenances
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={maintenanceData} dataKey="value" nameKey="statut" outerRadius={100} label>
                    {maintenanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Évolution mensuelle des maintenances
            </h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mois" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="maintenances"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

/* 🔹 Composant StatCard réutilisable */
const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div
    className={`flex items-center gap-4 p-6 rounded-2xl shadow-md hover:shadow-lg transition ${color}`}
  >
    <div className="p-3 bg-white rounded-xl shadow-inner">{icon}</div>
    <div>
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);
