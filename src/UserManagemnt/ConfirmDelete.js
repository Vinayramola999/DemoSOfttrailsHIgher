import React from 'react';

const ConfirmDelete = ({ isOpen, onClose, onConfirm,errorMessage}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                {errorMessage && (
                    <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
                        {errorMessage}
                    </div>
                )}
                <p className="mb-6">Are you sure you want to delete this user?</p>
                <div className="flex justify-end space-x-4">
                    <button
                        className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        onClick={onConfirm}
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDelete;
