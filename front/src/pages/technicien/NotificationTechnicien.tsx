import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell, Wrench, Info } from "lucide-react";
import { SidebarTechnicien } from "../../components/NavbarTechnicien";
import { toast } from "react-toastify";
import { io, Socket } from "socket.io-client";

// ⚙️ Connexion au socket backend
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

const NotificationsTechnicien: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // 🧠 Récupérer le technicien connecté depuis le localStorage
  const [technicienId, setTechnicienId] = useState<number | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("utilisateur");
    if (storedUser) {
      try {
        const utilisateur = JSON.parse(storedUser);
        if (utilisateur && utilisateur.id) {
          setTechnicienId(utilisateur.id);
          console.log("👤 Technicien connecté :", utilisateur);
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

  useEffect(() => {
    if (!technicienId) return;

    // 🧠 Initialisation du socket
    if (!socket) {
      socket = io("http://localhost:3000", {
        transports: ["websocket"],
        reconnection: true,
      });
    }

    // 🔐 Enregistrement du technicien sur le serveur Socket.io
    socket.emit("register_user", technicienId);
    console.log("🧠 Utilisateur enregistré sur le socket :", technicienId);

    // 📥 Charger les notifications existantes depuis l’API
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/notifications/user/${technicienId}`
        );
        setNotifications(response.data.data);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications :", error);
        toast.error("Erreur de chargement des notifications ⚠️");
      }
    };

    fetchNotifications();

    // ⚡ Écouter les notifications en temps réel
    socket.on("nouvelle_notification", (notification: Notification) => {
      console.log("🎯 Notification reçue côté client :", notification);
      toast.info("🔔 Nouvelle notification reçue !");
      setNotifications((prev) => [notification, ...prev]);
    });

    // 🔴 Nettoyage lors du démontage du composant
    return () => {
      socket.off("nouvelle_notification");
    };
  }, [technicienId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:ml-64 transition-all">
      <SidebarTechnicien />

      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-6 h-6 text-emerald-700" />
        <h1 className="text-2xl font-bold text-emerald-800">Notifications</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-4 divide-y divide-gray-200">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-3 py-3 hover:bg-gray-100 rounded-lg px-2 transition"
            >
              {notif.type === "ASSIGNATION" ? (
                <Wrench className="w-5 h-5 text-blue-600 mt-1" />
              ) : (
                <Info className="w-5 h-5 text-emerald-600 mt-1" />
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

export default NotificationsTechnicien;
