import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Connexion } from "./pages/Connexion";
import { Inscription } from "./pages/Inscription";
import { SidebarAdmin } from "./components/SidebarAdmin";
import { SidebarTechnicien } from "./components/NavbarTechnicien";

import GererCategorie from "./pages/admin/GererCategorie";
import GererMateriels from "./pages/admin/GererMateriels";

import ExporterDonnees from "./pages/admin/ExporterDonnees";
import ConsulterMaintenancesTechnicien from "./pages/technicien/ConsulterMaintenancesTechnicien";
import MettreAJourRapportTechnicien from "./pages/technicien/MettreAJourRapportTechnicien";
import MaterielDetailWrapper from "./pages/technicien/ConsulterDetailMateriel";

import GererDomaines from "./pages/admin/GererDomaines";
import Inscriptions from "./pages/Inscriptions";
import AssignerMaintenances from "./pages/admin/AssignerMaintenances";
import { ToastContainer } from "react-toastify";
import NotificationsTechnicien from "./pages/technicien/NotificationTechnicien";
import { DashboardAdmin } from "./pages/admin/DashboardAdmin";
import { NotificationsAdmin } from "./pages/admin/NotificationsAdmin";
import { GererUtilisateur } from "./pages/admin/GererUtilisateur";
interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("utilisateur");

  if (!token || !userData) return <Navigate to="/connexion" replace />;

  const user = JSON.parse(userData);
  if (!allowedRoles.includes(user.role)) return <Navigate to="/connexion" replace />;

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
     <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <Routes>
        <Route path="/" element={<Navigate to="/connexion" />} />
        <Route path="/connexion" element={<Connexion />} />
        <Route path="/inscrit" element={<Inscription />} />

        <Route path="/inscription" element={<Inscriptions/>} />

        /* Technicien */
   
        <Route path="/technicien/rapport" element={<MettreAJourRapportTechnicien  />} />
       
        <Route path="/technicien/materiel" element={<MaterielDetailWrapper />} />
       
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <SidebarAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/technicien"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIEN"]}>
              <ConsulterMaintenancesTechnicien/>
            </ProtectedRoute>
          }
        />
           <Route
          path="/technicien/maintenances"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIEN"]}>
              <ConsulterMaintenancesTechnicien/>
            </ProtectedRoute>
          }
        />

<Route
          path="/technicien/notifications"
          element={
            <ProtectedRoute allowedRoles={["TECHNICIEN"]}>
              <NotificationsTechnicien/>
            </ProtectedRoute>
          }
        />

/* ADMIN */

<Route path="/admin/notifications"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <NotificationsAdmin />
    </ProtectedRoute>
  }
/>
<Route path="/exporter"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <ExporterDonnees />
    </ProtectedRoute>
  }
/>
<Route path="/maintenance"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <AssignerMaintenances />
    </ProtectedRoute>
  }
/>
<Route path="/categories"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <GererCategorie />
    </ProtectedRoute>
  }
/>
<Route path="/utilisateurs"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <GererUtilisateur />
    </ProtectedRoute>
  }
/>

<Route path="/domaines"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <GererDomaines />
    </ProtectedRoute>
  }
/>

<Route path="/materiels"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <GererMateriels/>
    </ProtectedRoute>
  }
/>

<Route path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <DashboardAdmin/>
    </ProtectedRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
