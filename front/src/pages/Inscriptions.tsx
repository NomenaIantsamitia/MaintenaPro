import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiLock,
  FiBriefcase,
  FiUpload,
  FiCheckCircle,
  FiAlertTriangle,
  FiLoader,
} from "react-icons/fi";
import { Link } from "react-router-dom"; // ✅ Import pour le lien "Se connecter"

// --- Types ---
interface Domaine {
  id: number;
  nom: string;
  description?: string;
}

interface FormData {
  nom_complet: string;
  email: string;
  password: string;
  domaineId: string;
  photo: File | null;
  previewUrl: string | null;
}

interface FormErrors {
  nom_complet?: string;
  email?: string;
  password?: string;
  domaineId?: string;
  photo?: string;
}

// --- Composant principal ---
const Inscriptions: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nom_complet: "",
    email: "",
    password: "",
    domaineId: "",
    photo: null,
    previewUrl: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [domaines, setDomaines] = useState<Domaine[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // --- Charger les domaines depuis l’API ---
  useEffect(() => {
    const fetchDomaines = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/domaines/");
        setDomaines(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des domaines :", error);
        setErrorMessage("Impossible de charger les domaines.");
      }
    };
    fetchDomaines();
  }, []);

  // --- Gestion des champs texte ---
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // --- Gestion du fichier photo ---
  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        photo: "La taille du fichier ne doit pas dépasser 5MB.",
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      photo: file,
      previewUrl: file ? URL.createObjectURL(file) : null,
    }));
    setErrors((prev) => ({ ...prev, photo: undefined }));
  };

  // --- Validation du formulaire ---
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.nom_complet.trim())
      newErrors.nom_complet = "Le nom complet est requis.";
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Format d'email invalide.";
    if (formData.password.trim().length < 6)
      newErrors.password = "Le mot de passe doit contenir au moins 6 caractères.";
    if (!formData.domaineId.trim())
      newErrors.domaineId = "Veuillez sélectionner un domaine.";
    if (!formData.photo)
      newErrors.photo = "La photo de profil est obligatoire.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- Soumission du formulaire ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const data = new FormData();
      data.append("nom_complet", formData.nom_complet);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", "TECHNICIEN");
      data.append("status", "ACTIF");
      data.append("domaineId", formData.domaineId);
      if (formData.photo) {
        data.append("photo", formData.photo);
      }

      await axios.post("http://localhost:3000/api/utilisateurs/inscrire", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccessMessage("Inscription réussie !");
      setFormData({
        nom_complet: "",
        email: "",
        password: "",
        domaineId: "",
        photo: null,
        previewUrl: null,
      });
    } catch (error) {
      console.error("Erreur d'inscription :", error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Une erreur est survenue lors de l'inscription.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Rendu ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Inscription Technicien
        </h2>

        {/* --- Messages de succès ou d’erreur --- */}
        {successMessage && (
          <div className="flex items-center bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg mb-4">
            <FiCheckCircle className="mr-2" /> {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="flex items-center bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            <FiAlertTriangle className="mr-2" /> {errorMessage}
          </div>
        )}

        {/* --- Formulaire --- */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nom complet */}
          <div className="relative">
            <FiUser className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              name="nom_complet"
              placeholder="Nom complet"
              value={formData.nom_complet}
              onChange={handleChange}
              className={`w-full border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 ${
                errors.nom_complet ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.nom_complet && (
              <p className="text-xs text-red-500 mt-1">{errors.nom_complet}</p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <FiMail className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Adresse email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Mot de passe */}
          <div className="relative">
            <FiLock className="absolute top-3 left-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              value={formData.password}
              onChange={handleChange}
              className={`w-full border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Domaine */}
          <div className="relative">
            <FiBriefcase className="absolute top-3 left-3 text-gray-400" />
            <select
              name="domaineId"
              value={formData.domaineId}
              onChange={handleChange}
              className={`w-full border rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-indigo-500 ${
                errors.domaineId ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">-- Sélectionner un domaine --</option>
              {domaines.map((domaine) => (
                <option key={domaine.id} value={domaine.id}>
                  {domaine.nom}
                </option>
              ))}
            </select>
            {errors.domaineId && (
              <p className="text-xs text-red-500 mt-1">{errors.domaineId}</p>
            )}
          </div>

          {/* Photo */}
          <div>
            <label className="text-sm text-gray-700 font-medium">
              Photo de profil
            </label>
            <div
              className={`mt-2 flex justify-center border-2 border-dashed ${
                errors.photo ? "border-red-500" : "border-gray-300"
              } rounded-lg p-4`}
            >
              {formData.previewUrl ? (
                <img
                  src={formData.previewUrl}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <FiUpload className="w-8 h-8 text-gray-400" />
              )}
              <input
                type="file"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="ml-4 text-sm text-gray-600"
              />
            </div>
            {errors.photo && (
              <p className="text-xs text-red-500 mt-1">{errors.photo}</p>
            )}
          </div>

          {/* Bouton d'inscription */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold flex justify-center items-center"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin mr-2" /> Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        {/* ✅ Bouton "Déjà un compte ? Se connecter" */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Déjà un compte ?{" "}
            <Link
              to="/connexion"
              className="text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Inscriptions;
