import express from "express";
import cors from "cors";
import utilisateurRoutes from "./routes/utilisateur.routes";
import domaineRoutes from './routes/domaine.routes'
import categorieRoutes from "./routes/categorie.routes";
import materielRoutes from './routes/materiel.routes'
import maintenanceRoutes from "./routes/maintenance.routes";
import dashboardRoutes from "./routes/dashboard.route";
import notificationRoutes from './routes/notification.route'
import rapportRoutes from './routes/rapport.route'
import path from "path";
const app = express();

// ✅ Configuration CORS correcte

app.use(cors({
  origin: "http://localhost:5173", // ton front React
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // 🔥 ajoute PATCH ici
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // si tu utilises les cookies / sessions
}));

// ✅ Pour lire le corps JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// ✅ Routes
app.use("/api/utilisateurs", utilisateurRoutes);
app.use("/api/domaines", domaineRoutes);
app.use("/api/categories", categorieRoutes);
app.use("/api/materiels", materielRoutes);
app.use("/api/notifications", notificationRoutes);
// --- Routes principales ---
app.use("/api/rapports", rapportRoutes);

app.use("/api/maintenances", maintenanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/dashboard", dashboardRoutes);
export default app;
