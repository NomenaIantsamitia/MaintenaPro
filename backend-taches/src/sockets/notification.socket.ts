// src/sockets/notification.socket.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🟢 Nouvelle connexion socket :", socket.id);

    // 🧠 L'utilisateur envoie son ID juste après connexion
    socket.on("register_user", (userId) => {
      socket.join(`user_${userId}`);
      console.log(`✅ Utilisateur ${userId} rejoint la room user_${userId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Déconnexion socket :", socket.id);
    });
  });
}

export { io };
