import React, { useState } from "react";
import Pagination from "./Pagination";
const MappedData = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2; // You can adjust this number

  // guard for incoming data
  const safeData = Array.isArray(data) ? data : [];

  // Calculate the total number of pages
  const totalPages = Math.ceil(safeData.length / itemsPerPage);

  // Get the data for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = safeData.slice(indexOfFirstItem, indexOfLastItem);
  console.log('Pagination Details:', {
  dataLength: data.length,
  totalPages,
  currentPage,
  indexOfFirstItem,
  indexOfLastItem,
  currentItemsLength: currentItems.length,
  currentItems
});


  // Function to change page
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getServiceName = (item) => {
    console.warn('Item service :', item);
  if (item.emailService) {
    return item.emailService;  // ✅ sirf email service
  } else if (item.smsService) {
    return item.smsService;    // ✅ sirf sms service
  } else {
    return "Notttt mapped";       // ✅ dono missing/null
  }
};
  return (
    <div className="p-4 relative overflow-x-auto">
      {/* table-fixed + colgroup ensures columns have fixed widths so long text wraps instead of expanding table */}
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col style={{ width: "16%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "12%" }} />
          <col style={{ width: "21%" }} />
          <col style={{ width: "21%" }} />
        </colgroup>
        <thead className="bg-gray-100 sticky top-0 z-10">
          <tr>
            <th className="border px-4 py-2 text-left">Service Name</th>
            <th className="border px-4 py-2 text-left">Template ID</th>
            <th className="border px-4 py-2 text-left">Module Name</th>
            <th className="border px-4 py-2 text-left">Notification Type</th>
            <th className="border px-4 py-2 text-left">Variable</th>
            <th className="border px-4 py-2 text-left">Mapped Variable</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 &&
            currentItems.map(([key, value]) => {
               const item = value;

              // Variable / mappedValue may be arrays or strings; normalize to safe text
              const variable =
                item.mappedVariables === null && item.othersMappedVariables
                  ? item.othersMappedVariables // treat othersMappedVariables as mapped if mappedVariables null
                  : item.variables;

              const mappedValue =
                item.mappedVariables === null && item.othersMappedVariables
                  ? item.othersMappedVariables
                  : item.mappedVariables;

              const variableText = Array.isArray(variable)
                ? variable.join(", ")
                : variable || "-";
              const mappedText = Array.isArray(mappedValue)
                ? mappedValue.join(", ")
                : mappedValue || "-";

              return (
                <tr key={key}>
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">{item.serviceName}</td>
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">{item.templateId}</td>
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">{item.moduleName}</td>
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">{item.notificationType || item.type}</td>
                  {/* wrap long text inside a div so it breaks to next line instead of widening table */}
                  <td className="border px-4 py-2 align-top">
                    <div className="break-words whitespace-normal text-left max-h-32 overflow-auto">{variableText}</div>
                  </td>
                  <td className="border px-4 py-2 align-top">
                    <div className="break-words whitespace-normal text-left max-h-32 overflow-auto">{mappedText}</div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
     <div className="mt-4">
       <Pagination
         currentPage={currentPage}
         totalPages={totalPages}
         onPageChange={handlePageChange}
         show={totalPages > 1}
       />
     </div>
     </div>
    );
  };
  
  export default MappedData;