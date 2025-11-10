import React from "react";
import { XCircle, Trash2, Loader2 } from "lucide-react";

interface ConfirmDeleteModalProps {
  userName: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  userName,
  loading,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] max-w-md p-6 animate-fadeIn">
        {/* En-tête */}
        <div className="flex items-center gap-2 mb-4">
          <Trash2 className="text-red-600 w-6 h-6" />
          <h2 className="text-lg font-semibold text-gray-800">
            Supprimer l’utilisateur
          </h2>
        </div>

        {/* Contenu */}
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer{" "}
          <span className="font-medium text-gray-800">{userName}</span> ?
          <br />
          Cette action est irréversible.
        </p>

        {/* Boutons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center gap-2 transition disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};
