import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { inscrire } from "../services/api";
import type { Utilisateur } from "../types/Utilisateur";

export const Inscription = () => {
  const [form, setForm] = useState<Utilisateur>({
    nom_complet: "",
    email: "",
    password: "",
    role: "TECHNICIEN",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inscrire(form);
      setMessage("✅ Inscription réussie !");
      setTimeout(() => navigate("/connexion"), 1500);
    } catch (error: any) {
      setMessage(error.message || "Erreur d'inscription ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Créer un compte
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Nom complet
            </label>
            <input
              name="nom_complet"
              placeholder="Entrez votre nom complet"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Adresse email
            </label>
            <input
              name="email"
              type="email"
              placeholder="exemple@domaine.com"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Mot de passe
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200"
              required
            />
          </div>

          

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors duration-300 shadow-sm"
          >
            S'inscrire
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.includes("réussie") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link
              to="/connexion"
              className="text-green-600 hover:text-green-800 font-semibold transition-colors duration-200"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
