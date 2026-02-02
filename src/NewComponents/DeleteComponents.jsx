import React from "react";
import { FaTrash } from "react-icons/fa";

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title = "Delete vendor", message = "Are you sure you want to delete vendor?" }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg py-10 px-6 w-full max-w-xs text-center shadow-lg min-h-[250px] flex flex-col justify-between">
                <div className="w-12 h-12 rounded-full bg-gray-200 mx-auto flex items-center justify-center mb-4">
                    <FaTrash className="text-black-600 text-xl" />
                </div>
                <h2 className="text-[20px] font-[600]">{title}</h2>
                <p className="text-[12px] text-gray-600 mt-1 mb-4">{message}</p>
                <div className="flex justify-center gap-2">
                    <button
                        onClick={onClose}
                        className="px-10 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-10 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};
export default DeleteConfirmationModal;