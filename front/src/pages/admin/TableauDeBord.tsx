import React, { useMemo } from 'react';

// --- Interfaces TypeScript pour les Statuts (Simulés pour la clarté) ---
interface DashboardStats {
  materiels: {
    total: number;
    actifs: number;
    enPanne: number;
    enStock: number;
  };
  maintenances: {
    planifiees: number;
    enCours: number;
    terminees: number;
    urgentes: number;
  };
  utilisateurs: {
    admins: number;
    techniciens: number;
  };
}

interface Alerte {
    id: number;
    type: 'danger' | 'warning' | 'info';
    message: string;
}

// --- Données de démonstration (Simule un appel API global) ---
const mockDashboardData: DashboardStats = {
  materiels: {
    total: 120,
    actifs: 95,
    enPanne: 8,
    enStock: 17,
  },
  maintenances: {
    planifiees: 12,
    enCours: 5,
    terminees: 155,
    urgentes: 3,
  },
  utilisateurs: {
    admins: 2,
    techniciens: 15,
  },
};

const mockAlertes: Alerte[] = [
    { id: 1, type: 'danger', message: '3 serveurs sont en panne depuis plus de 48 heures. Vérification urgente requise.' },
    { id: 2, type: 'warning', message: 'Le stock de licences de routeurs est inférieur à 10 unités.' },
    { id: 3, type: 'info', message: 'Rapport mensuel de maintenance terminé pour Septembre.' },
    { id: 4, type: 'danger', message: 'Le matériel "HP ProLiant DL380" est critique et est en état "En panne".' },
];

// --- Composant Carte de Statistique ---
interface StatCardProps {
  title: string;
  value: number;
  icon: string; // Utiliser un emoji ou une icône réelle (ex: Lucide, Heroicons)
  color: string; // Couleur Tailwind
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className={`p-5 rounded-xl shadow-lg border-l-4 ${color} bg-white transition duration-300 hover:shadow-xl`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="text-4xl opacity-50">{icon}</div>
    </div>
  </div>
);

// --- Composant Alerte/Notification Rapide ---
const AlerteItem: React.FC<{ alerte: Alerte }> = ({ alerte }) => {
    let style = { bgColor: 'bg-red-50', textColor: 'text-red-800', icon: '🚨' };
    if (alerte.type === 'warning') {
        style = { bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', icon: '⚠️' };
    } else if (alerte.type === 'info') {
        style = { bgColor: 'bg-blue-50', textColor: 'text-blue-800', icon: 'ℹ️' };
    }

    return (
        <li className={`p-4 rounded-lg flex items-start ${style.bgColor} border-l-4 border-current`}>
            <span className={`text-xl mr-3 ${style.textColor}`}>{style.icon}</span>
            <p className={`text-sm ${style.textColor}`}>{alerte.message}</p>
        </li>
    );
};

// =========================================================================
// Composant Principal : TableauDeBord
// =========================================================================

const TableauDeBord: React.FC = () => {
  const stats = mockDashboardData;
  const alertes = mockAlertes;
  
  // Calculs simples pour les ratios (vendable)
  const ratioMaterielActif = useMemo(() => {
    return (stats.materiels.actifs / stats.materiels.total * 100).toFixed(1);
  }, [stats.materiels]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">🏠 Tableau de Bord Global</h1>
      
      {/* --- Grille des Statistique Clés --- */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Statistiques d'Inventaire et Opérationnelles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Bloc 1 : Inventaire Global */}
          <StatCard 
            title="Matériels Totaux" 
            value={stats.materiels.total} 
            icon="📦" 
            color="border-indigo-600" 
          />

          {/* Bloc 2 : Santé du Parc */}
          <StatCard 
            title="Matériels Actifs" 
            value={stats.materiels.actifs} 
            icon="🟢" 
            color="border-green-600" 
          />

          {/* Bloc 3 : Problèmes Actuels */}
          <StatCard 
            title="Matériels En Panne" 
            value={stats.materiels.enPanne} 
            icon="🔴" 
            color="border-red-600" 
          />

          {/* Bloc 4 : Charge de Travail */}
          <StatCard 
            title="Maintenances Planifiées" 
            value={stats.maintenances.planifiees} 
            icon="📅" 
            color="border-yellow-600" 
          />
        </div>
      </section>

      {/* --- Alertes & Progrès --- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        
        {/* Colonne 1 : Alertes Critiques */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center">
            <span className="mr-2">🔔 Alertes et Tâches Urgentes</span>
          </h2>
          <ul className="space-y-3">
            {alertes.length > 0 ? (
                alertes.map(alerte => <AlerteItem key={alerte.id} alerte={alerte} />)
            ) : (
                <li className="text-gray-500 py-4 text-center bg-green-50 rounded-lg">
                    ✅ Aucune alerte critique pour le moment.
                </li>
            )}
          </ul>
        </div>
        
        {/* Colonne 2 : Indicateurs Clés de Performance (KPI) */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">KPI et Ratios</h2>
          <div className="space-y-4">
            
            {/* KPI 1: Ratio Actif */}
            <div>
              <p className="text-sm font-medium text-gray-500">Ratio Matériel Actif</p>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-2xl font-bold text-indigo-700">{ratioMaterielActif}%</span>
                <span className="text-sm text-gray-500">{stats.materiels.actifs}/{stats.materiels.total}</span>
              </div>
              {/* Simulation de barre de progression */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-indigo-600 h-2.5 rounded-full" 
                  style={{ width: `${ratioMaterielActif}%` }}
                ></div>
              </div>
            </div>

            {/* KPI 2: Maintenances Terminées */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500">Maintenances Urgentes</p>
              <span className="text-2xl font-bold text-red-700">{stats.maintenances.urgentes}</span>
            </div>
            
            {/* KPI 3: Techniciens */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500">Équipe Technique</p>
              <span className="text-2xl font-bold text-green-700">{stats.utilisateurs.techniciens} Techniciens</span>
            </div>

          </div>
        </div>
        
      </section>
      
      {/* --- Section Graphiques (Simulée) --- */}
      <section className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Tendance des Maintenances (Simulé)</h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed rounded-lg text-gray-400">
          [Image de Barres de Tendance des Maintenances Mensuelles]
          <p className="ml-4">Intégration future d'un graphique (ex: Recharts, Chart.js) ici.</p>
        </div>
      </section>

    </div>
  );
};

export default TableauDeBord;