import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config(); // ⬅️ Charge les variables du fichier .env

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL!;
  const password = process.env.ADMIN_PASSWORD!;
  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.utilisateur.create({
    data: {
      nom_complet: "Administrateur Principal",
      email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIF",
    },
  });

  console.log("✅ Admin créé avec succès :", admin);
}

createAdmin()
  .catch((err) => console.error("❌ Erreur :", err))
  .finally(async () => await prisma.$disconnect());
