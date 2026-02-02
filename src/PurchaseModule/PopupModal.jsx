import React from "react";
import { Icon } from "@iconify/react";

const PopupModal = ({ type, title, message, onConfirm, onCancel, onClose }) => {
  const isSuccess = type === "success";
  const isConfirm = type === "confirm";
  const isDelete = type === "delete";
  const isCancel = type === "cancel";
  const isError = type === "error";
  const isWarning = type === "warning"; // <-- Add this line

  let icon, iconStyle;
  if (isSuccess) {
    icon = (
      <Icon icon="mdi:check-circle" className="text-[64px] text-[#0066EB]" />
    );
    iconStyle = "bg-[#EAF2FD]";
  } else if (isDelete) {
    icon = <Icon icon="mdi:delete-outline" className="text-4xl text-red-600" />;
    iconStyle = "bg-red-100";
  } else if (isError) {
    icon = <Icon icon="mdi:alert-circle" className="text-4xl text-red-600" />;
    iconStyle = "bg-red-100";
  } else if (isWarning) { // <-- Add this block
    icon = <Icon icon="mdi:alert" className="text-4xl text-yellow-500" />;
    iconStyle = "bg-yellow-100";
  } else {
    icon = (
      <Icon icon="mdi:help-circle-outline" className="text-4xl text-blue-600" />
    );
    iconStyle = "bg-blue-100";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-[30px] p-0 w-[300px] h-[300px] max-w-[90vw] max-h-[90vh] flex flex-col justify-between items-center text-center shadow-xl border border-[#EAF2FD] overflow-auto">
        <div className="flex flex-col items-center w-full mt-6">
          <div
            className={`flex items-center justify-center w-[64px] h-[64px] rounded-full mb-4 ${iconStyle}`}
          >
            {icon}
          </div>
          <h2 className="text-xl font-bold text-[#0066EB] mb-3">{title}</h2>
          <p className="text-gray-500 text-base mb-0 mt-4">{message}</p>
        </div>
        {isSuccess && (
          <button
            className="w-[85%] mx-auto mb-6 bg-[#0066EB] text-white py-2 rounded-[8px] text-base font-medium hover:bg-blue-700 transition"
            onClick={onClose}
          >
            Continue
          </button>
        )}
        {(isConfirm || isDelete || isCancel) && (
          <div className="flex justify-between gap-2 w-full px-6 mb-6">
            <button
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => onCancel?.()}
            >
              Cancel
            </button>

            <button
              className={`flex-1 py-2 rounded-lg font-semibold transition ${
                isDelete
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-custome-blue text-white hover:bg-blue-700"
              }`}
              onClick={onConfirm}
            >
              {isDelete ? "Delete" : "Confirm"}
            </button>
          </div>
        )}
        {isError && (
          <div className="flex justify-between gap-2 w-full px-6 mb-6">
            <button
              className="flex-1 bg-custome-blue text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        )}
        {isWarning && ( // <-- Add this block
          <div className="flex justify-between gap-2 w-full px-6 mb-6">
            <button
              className="flex-1 bg-yellow-500 text-white py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
              onClick={onClose}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupModal;