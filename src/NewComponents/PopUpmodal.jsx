import React from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

const PopupModal = ({
  type = "info", // confirm | success | error
  title,
  message,
  onConfirm,
  onCancel,
  onClose,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500 w-12 h-12 mx-auto" />;
      case "error":
        return <XCircle className="text-red-500 w-12 h-12 mx-auto" />;
      case "confirm":
        return <AlertTriangle className="text-yellow-500 w-12 h-12 mx-auto" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-xl shadow-lg w-96 p-6 relative animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        {/* Icon and Title */}
        <div className="flex flex-col items-center text-center">
          {getIcon()}
          <h2 className="text-lg font-semibold mt-3 mb-1">{title}</h2>
          <p className="text-gray-600 text-sm mb-5">{message}</p>
        </div>

        {/* Buttons */}
        {type === "confirm" ? (
          <div className="flex justify-center gap-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className={`px-5 py-2 rounded-md ${
                type === "error"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              } text-white`}
            >
              OK
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupModal;
