import React from "react";

interface ConfirmerSuppressionModalProps {
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
}

const ConfirmerSuppressionModal: React.FC<ConfirmerSuppressionModalProps> = ({
  onClose,
  onConfirm,
  message = "Voulez-vous vraiment supprimer cette maintenance ?",
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmation</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmerSuppressionModal;
