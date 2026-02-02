import React from "react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "Do you really want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  icon = "?",
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9998]">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-4">
          <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <span className="text-white text-4xl font-bold">{icon}</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-700 text-center mb-2">
            {title}
          </h2>
        </div>

        <p className="text-lg text-gray-600 text-center mb-8">{message}</p>

        <div className="flex gap-6 w-full justify-center">
          <button
            className="border border-gray-400 text-black px-8 py-3 rounded-lg bg-white text-lg"
            onClick={onClose}
          >
            {cancelText}
          </button>

          <button
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold"
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
