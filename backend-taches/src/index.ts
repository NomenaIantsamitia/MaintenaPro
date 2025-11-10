import app from "./app";
import http from "http";
import { initSocket } from "./sockets/notification.socket";

const server = http.createServer(app); // Crée un vrai serveur HTTP basé sur Express

// Initialise Socket.io sur ce serveur
initSocket(server);

const PORT = process.env.PORT || 3000;

// 🟢 Écoute avec le même serveur !
server.listen(PORT, () => {
  console.log(`✅ Serveur (HTTP + Socket.io) en écoute sur le port ${PORT}`);
});
