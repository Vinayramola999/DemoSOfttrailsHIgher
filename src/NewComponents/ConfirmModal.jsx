import React from "react";

const ConfirmModal = ({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = "?",
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 flex flex-col items-center animate-fadeIn">
        {/* Icon + Title */}
        <div className="flex flex-col items-center mb-4">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-white text-4xl font-bold">{icon}</span>
          </div>
          <h2 className="text-3xl font-bold text-blue-700 text-center mb-2 whitespace-pre-line">
            {title}
          </h2>
        </div>

        {/* Message */}
        <p className="text-lg text-gray-600 text-center mb-8">{message}</p>

        {/* Buttons */}
        <div className="flex gap-6 w-full justify-center">
          <button
            className="border border-gray-400 text-black px-8 py-3 rounded-lg bg-white text-lg hover:bg-gray-100"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
