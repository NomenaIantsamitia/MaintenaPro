import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Info, Wrench } from "lucide-react";
import { SidebarAdmin } from "../../components/SidebarAdmin";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

// ⚙️ Connexion Socket.io
let socket: Socket;

interface Notification {
  id: number;
  titre: string;
  message: string;
  createdAt: string;
  type: string;
  maintenance?: {
    id: number;
    description: string;
    statut: string;
    priorite: string;
    materiel: {
      nom: string;
      numeroSerie: string;
    };
  };
}

export const NotificationsAdmin: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [adminId, setAdminId] = useState<number | null>(null);

  // 🧠 Récupération admin depuis le localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("utilisateur");
    if (storedUser) {
      try {
        const utilisateur = JSON.parse(storedUser);
        if (utilisateur && utilisateur.id) {
          setAdminId(utilisateur.id);
          console.log("👑 Admin connecté :", utilisateur);
        } else {
          toast.error("Utilisateur non valide ❌");
        }
      } catch (err) {
        console.error("Erreur parsing utilisateur :", err);
        toast.error("Erreur lors du chargement de l'utilisateur ❌");
      }
    } else {
      toast.error("Aucun utilisateur connecté ❌");
    }
  }, []);

  // 🔔 Gestion Socket + API notifications
  useEffect(() => {
    if (!adminId) return;

    if (!socket) {
      socket = io("http://localhost:3000", {
        transports: ["websocket"],
        reconnection: true,
      });
    }

    socket.emit("register_user", adminId);
    console.log("🧠 Admin enregistré sur le socket :", adminId);

    // 📥 Charger les notifications existantes
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/notifications/user/${adminId}`
        );

        // ✅ Vérifie si data est bien un tableau
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];

        setNotifications(data);
        console.log("🔔 Notifications chargées :", data);
      } catch (error) {
        console.error("Erreur de chargement des notifications :", error);
        toast.error("Erreur lors du chargement des notifications ⚠️");
      }
    };

    fetchNotifications();

    // ⚡ En temps réel
    socket.on("nouvelle_notification", (notif: Notification) => {
      console.log("📨 Nouvelle notification admin :", notif);
      toast.info("🔔 Nouvelle notification reçue !");
      setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      socket.off("nouvelle_notification");
    };
  }, [adminId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:ml-64 transition-all">
      <SidebarAdmin />

      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-blue-700" />
        <h1 className="text-2xl font-bold text-blue-800">Notifications</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 divide-y divide-gray-200">
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-3 py-3 hover:bg-gray-100 rounded-lg px-2 transition"
            >
              {notif.type === "MAINTENANCE" ? (
                <Wrench className="w-5 h-5 text-blue-600 mt-1" />
              ) : (
                <Info className="w-5 h-5 text-blue-600 mt-1" />
              )}

              <div>
                <p className="text-gray-800 text-sm font-semibold">
                  {notif.titre}
                </p>
                <p className="text-gray-700 text-sm">{notif.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notif.createdAt).toLocaleString("fr-FR")}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-4">
            Aucune notification pour le moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationsAdmin;
