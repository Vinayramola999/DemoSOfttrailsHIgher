import React from "react";

const RegisterPatient = ({ open, onCancel, onConfirm }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-50">
            <div className="bg-white rounded-2xl shadow-xl max-w-xs w-full px-6 pt-7 pb-6 flex flex-col items-center">
                <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-600 mb-4">
                    <span className="text-white text-4xl font-bold">?</span>
                </div>
                <h2 className="text-2xl font-bold text-blue-700 mb-2 text-center">Register patient?</h2>
                <p className="text-gray-500 text-base mb-7 text-center">Are you sure you want to register patient?</p>
                <div className="flex w-full gap-3 mt-2">
                    <button
                        className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-800 font-semibold bg-white hover:bg-gray-100 transition"
                        onClick={onCancel}
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow"
                        onClick={() => {
                            console.log('About to show success modal!');
                            onConfirm();
                        }}
                        type="button"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPatient;
