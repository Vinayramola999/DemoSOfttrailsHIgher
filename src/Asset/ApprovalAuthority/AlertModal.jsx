import React from 'react';

const AlertModal = ({ message, isOpen, onConfirm, onCancel, confirmText = "Yes", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-lg font-bold text-center">{message}</h2>
        <div className="flex justify-between mt-4">
          <button
            onClick={onConfirm}
            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            {confirmText}
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
