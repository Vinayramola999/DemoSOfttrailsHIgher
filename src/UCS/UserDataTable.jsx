// import React from 'react';
// import { faTrash } from "@fortawesome/free-solid-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/solid";
// import Pagination from './Pagination';
// const UserDataTable = ({ data, onUpdateClick, onDeleteClick }) => {
//   // तारीख को अच्छे फॉर्मेट में दिखाने के लिए एक हेल्पर फंक्शन
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   // कुल पेजों की संख्या कैलकुलेट करें
//   const totalPages = Math.ceil(data.length / itemsPerPage);

//   // वर्तमान पेज के लिए डेटा प्राप्त करें
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

//   // पेज बदलने का फ़ंक्शन
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A'; // अगर तारीख नहीं है तो N/A दिखाएँ
//     const options = { year: 'numeric', month: 'long', day: 'numeric' };
//     return new Date(dateString).toLocaleDateString('en-US', options);
//   };

//   return (

//     <div className="w-full max-w-7xl mx-auto mt-10">
//       <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto">
//         <div className="relative mb-4">
//           <div className="flex justify-center">
//             <h2 className="text-xl font-semibold text-gray-800">Existing Modules Data</h2>
//           </div>
//           <div className="absolute left-0 top-1/2 -translate-y-1/2">
//             <input
//               type="text"
//               placeholder="Search by Template Name..."
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>
//         <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm">
//           <thead className="bg-gray-100">
//             <tr>
//               <th className="border px-4 py-2 text-left">Application Name</th>
//               <th className="border px-4 py-2 text-left">Module Name</th>
//               <th className="border px-4 py-2 text-left">Sub Module Name</th>
//               <th className="border px-4 py-2 text-left">Unique Identifier</th>
//               <th className="border px-4 py-2 text-left">Table Name</th>
//               <th className="border px-4 py-2 text-left">Created At</th>
//               <th className="border px-4 py-2 text-center">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {/* API से मिले डेटा पर लूप चलाकर टेबल रो बनाना */}
//             {data.map((item) => (
//               <tr key={item.id} className="hover:bg-gray-50">
//                 <td className="border px-4 py-2">{item.applicationName || 'N/A'}</td>
//                 <td className="border px-4 py-2">{item.moduleName || 'N/A'}</td>
//                 <td className="border px-4 py-2">{item.subModuleName || 'N/A'}</td>
//                 <td className="border px-4 py-2">{item.uniqueIdentifierName || 'N/A'}</td>
//                 <td className="border px-4 py-2">{item.tableName || 'N/A'}</td>
//                 <td className="border px-4 py-2">{formatDate(item.createdAt)}</td>
//                 <td className="border px-4 py-2 text-center">
//                   <button
//                     onClick={() => onUpdateClick(item)}
//                     className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
//                   >
//                     <PencilSquareIcon className="h-4 w-4" />
//                   </button>
//                   <button
//                     onClick={() => onDeleteClick(item.id)}
//                     className="text-red-600 hover:text-red-800 font-semibold"
//                   >
//                     <FontAwesomeIcon icon={faTrash} />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         {/* अगर कोई डेटा नहीं है तो यह मैसेज दिखाएँ */}
//         {data.length === 0 && (
//           <p className="text-center py-4 text-gray-500">No data available to display.</p>
//         )}
//       </div>
//       {/* Pagination Controls */}
//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={handlePageChange}
//       />
//     </div>
//   );
// };

// export default UserDataTable;


import React, { useState } from 'react'; // useState इंपोर्ट करें
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PencilSquareIcon } from "@heroicons/react/24/solid"; // TrashIcon अब FontAwesome से आ रहा है
import Pagination from './Pagination'; // Pagination कंपोनेंट इंपोर्ट करें

const UserDataTable = ({ data, onUpdateClick, onDeleteClick }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // आप इस संख्या को एडजस्ट कर सकते हैं

  // कुल पेजों की संख्या कैलकुलेट करें
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // वर्तमान पेज के लिए डेटा प्राप्त करें
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);

  // पेज बदलने का फ़ंक्शन
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // तारीख को अच्छे फॉर्मेट में दिखाने के लिए एक हेल्पर फंक्शन
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'; // अगर तारीख नहीं है तो N/A दिखाएँ
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="w-full max-w-7xl mx-auto mt-10">
      <div className="bg-white shadow-lg rounded-xl p-4 overflow-x-auto relative"> {/* Add relative here */}
        <div className="relative mb-4">
          <div className="flex justify-center">
            <h2 className="text-xl font-semibold text-gray-800">Existing Modules Data</h2>
          </div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <input
              type="text"
              placeholder="Search by Template Name..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <table className="min-w-full table-auto border-collapse border border-gray-300 text-sm w-full"> {/* Add w-full */}
          <thead className="bg-gray-100 sticky top-0 z-10"> {/* sticky top-0 z-10 for sticky header */}
            <tr>
              <th className="border px-4 py-2 text-left">Application Name</th>
              <th className="border px-4 py-2 text-left">Module Name</th>
              <th className="border px-4 py-2 text-left">Sub Module Name</th>
              <th className="border px-4 py-2 text-left">Unique Identifier</th>
              <th className="border px-4 py-2 text-left">Table Name</th>
              <th className="border px-4 py-2 text-left">Created At</th>
              <th className="border px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* API से मिले डेटा पर लूप चलाकर टेबल रो बनाना */}
            {currentItems.map((item) => ( 
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{item.applicationName || 'N/A'}</td>
                <td className="border px-4 py-2">{item.moduleName || 'N/A'}</td>
                <td className="border px-4 py-2">{item.subModuleName || 'N/A'}</td>
                <td className="border px-4 py-2">{item.uniqueIdentifierName || 'N/A'}</td>
                <td className="border px-4 py-2">{item.tableName || 'N/A'}</td>
                <td className="border px-4 py-2">{formatDate(item.createdAt)}</td>
                <td className="border px-4 py-2 text-center">
                  <button
                    onClick={() => onUpdateClick(item)}
                    className="text-blue-600 hover:text-blue-800 font-semibold mr-3"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteClick(item.id)}
                    className="text-red-600 hover:text-red-800 font-semibold"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            ))}
            {/* Optional: Add empty rows to maintain minimum height */}
            {currentItems.length < itemsPerPage && (
              [...Array(itemsPerPage - currentItems.length)].map((_, i) => (
                <tr key={`empty-user-${i}`} className="h-[40px]"> {/* Adjust height as needed */}
                  <td className="border px-3 py-2" colSpan="7"></td> {/* Adjust colSpan based on columns */}
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* अगर कोई डेटा नहीं है तो यह मैसेज दिखाएँ */}
        {data.length === 0 && (
          <p className="text-center py-4 text-gray-500">No data available to display.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default UserDataTable;