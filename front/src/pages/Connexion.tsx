import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { connexion } from "../services/api";

export const Connexion = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await connexion(form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("utilisateur", JSON.stringify(data.utilisateur));

      setMessage("Connexion réussie ✅");
      const role = data.utilisateur.role;

      setTimeout(() => {
        if (role === "ADMIN") navigate("/dashboard");
        else if (role === "TECHNICIEN") navigate("/technicien");
        else navigate("/connexion");
      }, 600);
    } catch (error: any) {
      setMessage(error.message || "Erreur de connexion ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Connexion à votre compte
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Adresse email
            </label>
            <input
              name="email"
              type="email"
              placeholder="exemple@domaine.com"
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
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
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-300 shadow-sm"
          >
            Se connecter
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
            Pas encore de compte ?{" "}
            <Link
              to="/inscription"
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
