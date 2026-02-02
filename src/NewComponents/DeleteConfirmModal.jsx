// import React from "react";
// import { FaTrash } from "react-icons/fa";

// const DeleteConfirmModal = ({
//   open,
//   title = "Delete Request?",
//   message = "Are you sure you want to delete request?",
//   onCancel,
//   onConfirm,
//   loading = false,
// }) => {
//   if (!open) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ">
//       <div className="bg-white w-[360px] p-10 rounded-xl shadow-xl text-center space-y-4">
//         <div className="flex justify-center">
//           <div className="bg-gray-100 p-4 rounded-full">
//             <FaTrash className="text-red-500 text-2xl" />
//           </div>
//         </div>

//         <h2 className="text-3xl font-semibold">{title}</h2>
//         <p className="text-lg font-semibold py-2 text-gray-600">{message}</p>

//         <div className="flex justify-center gap-4 pt-2 ">
//           <button
//             onClick={onCancel}
//             className="border border-gray-300 px-10 py-2 rounded-md text-sm hover:bg-gray-100"
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={onConfirm}
//             className="bg-red-600 text-white px-10 py-2 rounded-md text-sm hover:bg-red-700 transition"
//             disabled={loading}
//           >
//             {loading ? "Deleting..." : "Delete"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DeleteConfirmModal;


import React from "react";
import { FaTrash } from "react-icons/fa";

const DeleteConfirmModal = ({
  open,
  title = "Delete Request?",
  message = "Are you sure you want to delete request?",
  onCancel,
  onConfirm,
  loading = false,
  errorMessage = "", // ✅ add this
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white w-[360px] p-10 rounded-xl shadow-xl text-center space-y-4">
        <div className="flex justify-center">
          <div className="bg-gray-100 p-4 rounded-full">
            <FaTrash className="text-red-500 text-2xl" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold">{title}</h2>
        <p className="text-lg text-gray-600">{message}</p>

        {/* ✅ show error here if any */}
        {errorMessage && (
          <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
        )}

        <div className="flex justify-center gap-4 pt-2">
          <button
            onClick={onCancel}
            className="border border-gray-300 px-10 py-2 rounded-md text-sm hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 text-white px-10 py-2 rounded-md text-sm hover:bg-red-700 transition"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;