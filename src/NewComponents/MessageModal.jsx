import React from "react";

const MessageModal = ({ message, type, setMessage }) => {
  if (!message) return null; 

  const isSuccess = type === "success"; 

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={() => setMessage("")} // Close modal when clicking outside
    >
      <div
        className="relative bg-white w-[390px] max-w-md mx-4 sm:mx-auto p-10 rounded-2xl shadow-xl transform transition-all ease-in-out duration-300"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Icon */}
        <div className="modal-icon mt-4">
          <div
            className={`w-16 h-16 mx-auto flex items-center justify-center bg-blue-600 rounded-full ${isSuccess ? "bg-blue-500" : "bg-red-500"}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSuccess ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Header */}
        <h2
          className={`text-center text-3xl font-semibold mt-6 ${isSuccess ? "text-blue-600" : "text-red-600"}`}
        >
          {isSuccess ? "Success!" : "Error!"}
        </h2>

        {/* Message */}
        <p className="mt-4 text-center text-gray-700 text-lg font-semibold ">{message}</p>

        {/* Close Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setMessage("")} // Close modal on button click
            className={`w-48 py-2 rounded-lg font-medium text-white ${
              isSuccess
                ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-300"
                : "bg-red-600 hover:bg-red-700 focus:ring-red-300"
            } focus:outline-none focus:ring-2 transition-all`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
