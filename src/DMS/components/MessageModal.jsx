const MessageModal = ({ message, type, onClose }) => {
  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-fit aspect-square border border-black max-w-md mx-4 px-10 sm:mx-auto p-6 rounded-3xl shadow-xl transform transition-all ease-in-out duration-300 flex flex-col items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon mt-4">
          <div
            className={`w-16 h-16 mx-auto flex items-center justify-center rounded-full ${
              isSuccess ? "bg-blue-500" : "bg-red-500"
            }`}
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

        <h2
          className={`text-center text-2xl font-semibold mt-6 ${
            isSuccess ? "text-blue-600" : "text-red-600"
          }`}
        >
          {isSuccess ? "Success!" : "Error!"}
        </h2>

        <p className="mt-4 text-center text-gray-800 text-lg">{message}</p>

        <div className="mt-6 flex justify-center items-end">
          <button
            onClick={onClose}
            className={`px-10 py-2 rounded-md font-medium text-white text-lg ${
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
