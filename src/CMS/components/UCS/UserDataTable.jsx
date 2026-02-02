import React, { useState, useEffect } from 'react'; 
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PencilSquareIcon } from "@heroicons/react/24/solid"; 
import Pagination from './Pagination'; 
 

const UserDataTable = ({ data, onUpdateClick, onDeleteClick, filterTerm: parentFilterTerm, onFilterChange }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [localFilterTerm, setLocalFilterTerm] = useState(""); // module name filter (if parent doesn't control)
   const itemsPerPage = 5;
 
  const effectiveFilterTerm = (typeof parentFilterTerm === 'string') ? parentFilterTerm : localFilterTerm;
 
  // apply module-name filter (case-insensitive) using effectiveFilterTerm
  const filteredData = effectiveFilterTerm.trim()
    ? data.filter((item) =>
        String(item.moduleName || "").toLowerCase().includes(effectiveFilterTerm.trim().toLowerCase())
      )
    : data;
 
  // Sort so newest items (by createdAt) appear first — ensures newly added data shows at top
  const sortedData = Array.isArray(filteredData)
    ? filteredData.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    : filteredData;
 
  const totalPages = Math.ceil((sortedData || []).length / itemsPerPage);
 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = (sortedData || []).slice(indexOfFirstItem, indexOfLastItem);
 
  // reset to first page when data or filter changes so new item is visible immediately
  useEffect(() => {
    setCurrentPage(1);
  }, [data, effectiveFilterTerm]);
 
   const handlePageChange = (pageNumber) => {
     setCurrentPage(pageNumber);
   };
 
  // filter change - either notify parent (if onFilterChange provided) or update local state
  const handleFilterChange = (e) => {
    const val = e.target.value;
    if (typeof onFilterChange === 'function') {
      onFilterChange(val);
    } else {
      setLocalFilterTerm(val);
    }
    setCurrentPage(1);
  };
 
   const formatDate = (dateString) => {
     if (!dateString) return 'N/A';
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
               // show parent-controlled value if provided, otherwise local value
               value={typeof parentFilterTerm === 'string' ? parentFilterTerm : localFilterTerm}
               onChange={handleFilterChange}
               placeholder="Search by Module Name..."
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
             {currentItems.length < itemsPerPage && (
               [...Array(itemsPerPage - currentItems.length)].map((_, i) => (
                 <tr key={`empty-user-${i}`} className="h-[40px]"> {/* Adjust height as needed */}
                   <td className="border px-3 py-2" colSpan="7"></td> {/* Adjust colSpan based on columns */}
                 </tr>
               ))
             )}
           </tbody>
         </table>
         
        {filteredData.length === 0 && (
           <p className="text-center py-4 text-gray-500">No data available to display.</p>
         )}
       </div>
 
       
       <Pagination
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={handlePageChange}
       />
      
     </div>
   );
 };
 
 export default UserDataTable;