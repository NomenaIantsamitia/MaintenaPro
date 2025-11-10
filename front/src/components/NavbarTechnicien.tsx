import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Wrench,
  ClipboardCheck,
  FileText,
  Info,
  LogOut,
  Bell,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io, Socket } from "socket.io-client";

const navLinks = [
  {
    name: "Maintenances assignées",
    to: "/technicien/maintenances",
    icon: <Wrench className="w-5 h-5" />,
  },
  
];

// ⚙️ Connexion Socket.io (unique)
let socket: Socket;

export const SidebarTechnicien = () => {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  const utilisateur = JSON.parse(localStorage.getItem("utilisateur") || "{}");

  const fetchUnreadNotifications = async () => {
    try {
      if (!utilisateur?.id) return;
      const res = await axios.get(
        `http://localhost:3000/api/notifications/user/${utilisateur.id}/unread/count`
      );
      setUnreadCount(res.data.unreadCount || 0);
    } catch (error) {
      console.error("Erreur de chargement des notifications :", error);
    }
  };
  

  // ⚡ Initialisation du socket et écoute en temps réel
  useEffect(() => {
    if (!utilisateur?.id) return;

    // 1️⃣ Charger le nombre initial de notifications non lues
    fetchUnreadNotifications();

    // 2️⃣ Connexion socket
    if (!socket) {
      socket = io("http://localhost:3000");
      socket.emit("register_user", utilisateur.id);
    }

    // 3️⃣ Écoute d’un nouvel événement
    socket.on("nouvelle_notification", (notif) => {
      console.log("📩 Nouvelle notification reçue :", notif);
      setUnreadCount((prev) => prev + 1);
    });

    // 4️⃣ Nettoyage
    return () => {
      if (socket) {
        socket.off("nouvelle_notification");
      }
    };
  }, [utilisateur]);

  // ✅ Déconnexion
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("utilisateur");
    navigate("/connexion");
  };

  // 📬 Quand on clique sur l’icône de notification → aller à la page + tout marquer comme lu
  const handleNotificationsClick = async () => {
    try {
      await axios.put(
        `http://localhost:3000/api/notifications/user/${utilisateur.id}/markAllRead`
      );
      setUnreadCount(0);
      navigate("/technicien/notifications");
    } catch (error) {
      console.error("Erreur lors du marquage des notifications :", error);
    }
  };

  return (
    <>
      {/* Bouton mobile */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-4 left-4 z-50 bg-teal-700 text-white p-2 rounded-lg shadow-lg"
      >
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-teal-900 to-emerald-700 text-white w-64 transform ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl z-40 flex flex-col`}
      >
        {/* En-tête avec logo et notifications */}
        <div className="flex items-center justify-between h-16 border-b border-emerald-600 px-4">
          <h1 className="text-lg font-bold tracking-wide">MaintenaPro</h1>

          {/* 🔔 Icône de notification dynamique */}
          <div className="relative">
            <button
              onClick={handleNotificationsClick}
              className="relative p-2 rounded-full bg-emerald-800 hover:bg-emerald-700 transition"
            >
              <Bell className="w-5 h-5 text-emerald-100" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Liens */}
        <nav className="flex-1 overflow-y-auto mt-4 px-3">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-sm font-medium transition-all duration-150 ${
                location.pathname === link.to
                  ? "bg-emerald-600 text-white shadow-md scale-[1.02]"
                  : "text-emerald-100 hover:bg-emerald-800 hover:text-white"
              }`}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-emerald-600 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm md:hidden z-30"
          onClick={() => setOpen(false)}
        ></div>
      )}
    </>
  );
};
