import React from "react";
import { createRoot } from "react-dom/client";

// Simple custom alert modal used in SalesManagement features.
// Usage: call showCustomAlert(options) which returns a Promise<boolean>

const Modal = ({ type = "info", title, message, showCancel = false, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }) => {
  const icon = type === "success" ? (
    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
      <span className="text-white text-4xl">✓</span>
    </div>
  ) : (
    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
      <span className="text-white text-4xl">?</span>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-40" onClick={onCancel} />
      <div className="bg-white rounded-2xl p-8 relative z-10 max-w-lg mx-4">
        <div className="flex flex-col items-center text-center">
          {icon}
          {title && <h2 className="text-[24px] font-semibold text-blue-600 mb-3">{title}</h2>}
          {message && <div className="text-gray-600 mb-6">{message}</div>}
          <div className="flex gap-4 mt-2">
            {showCancel && (
              <button
                className="bg-white text-gray-700 px-6 py-2 rounded border border-gray-300"
                onClick={onCancel}
              >
                {cancelText}
              </button>
            )}
            <button
              className="bg-blue-600 text-white px-6 py-2 rounded"
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export function showCustomAlert({ type = "info", title = "", message = "", showCancel = false, confirmText = "Confirm", cancelText = "Cancel" } = {}) {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = (value) => {
      try {
        root.unmount();
      } catch (e) {
        // ignore
      }
      if (container.parentNode) container.parentNode.removeChild(container);
      resolve(value);
    };

    const handleConfirm = () => cleanup(true);
    const handleCancel = () => cleanup(false);

    root.render(
      <Modal
        type={type}
        title={title}
        message={message}
        showCancel={showCancel}
        confirmText={confirmText}
        cancelText={cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    );
  });
}

export default Modal;
