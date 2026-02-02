import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

/**
 * CenteredModal Component
 * A reusable modal popup for confirmations and success messages
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Callback when modal should close (ESC or outside click)
 * @param {string} title - Modal title text
 * @param {string} message - Modal description/message text
 * @param {string} type - Modal type: "confirm" or "success"
 * @param {function} onConfirm - Callback for confirm button (confirm type only)
 * @param {function} onContinue - Callback for continue button (success type only)
 */
const CenteredModal = ({
  isOpen = false,
  onClose = () => {},
  title = "",
  message = "",
  type = "confirm", // "confirm" | "success"
  onConfirm = () => {},
  onContinue = () => {},
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConfirm = type === "confirm";
  const isSuccess = type === "success";

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center transform transition-all duration-300 scale-100 opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon Badge */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              {isConfirm && (
                <span className="text-white text-4xl font-bold">?</span>
              )}
              {isSuccess && (
                <Check size={48} className="text-white" strokeWidth={3} />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-blue-600 mb-2">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 text-base leading-relaxed mb-8">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-4 justify-center">
            {isConfirm && (
              <>
                <button
                  onClick={onClose}
                  className="px-8 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  Confirm
                </button>
              </>
            )}

            {isSuccess && (
              <button
                onClick={() => {
                  onContinue();
                  onClose();
                }}
                className="px-12 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CenteredModal;
