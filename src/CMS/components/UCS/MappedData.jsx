import React, { useState } from "react";
import Pagination from "./Pagination";

const MappedData = ({ data }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Rows per page adjust karein

  // guard for incoming data
  const safeData = Array.isArray(data) ? data : [];

  // Calculate the total number of pages
  const totalPages = Math.ceil(safeData.length / itemsPerPage);

  // Get the data for the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = safeData.slice(indexOfFirstItem, indexOfLastItem);

  // Function to change page
  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="p-4 relative overflow-x-auto">
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
          {currentItems.length > 0 ? (
            currentItems.map((item, index) => {
              // Variables ko comma separated string ya list me convert karein
              const variableText = Array.isArray(item.variables)
                ? item.variables.join(", ")
                : item.variables || "-";

              const mappedText = Array.isArray(item.mappedVariables)
                ? item.mappedVariables.join(", ")
                : item.mappedVariables || "-";

              return (
                <tr key={index}> {/* Ab unique key index use kar sakte hain ya item.templateId + item.moduleName */}
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">
                    {item.serviceName}
                  </td>
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">
                    {item.templateId}
                  </td>
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">
                    {item.moduleName}
                  </td>
                  <td className="border px-4 py-2 align-top break-words whitespace-normal">
                    {item.notificationType}
                  </td>
                  <td className="border px-4 py-2 align-top">
                    <div className="break-words whitespace-normal text-left max-h-32 overflow-auto">
                      {variableText}
                    </div>
                  </td>
                  <td className="border px-4 py-2 align-top">
                    <div className="break-words whitespace-normal text-left max-h-32 overflow-auto">
                      {mappedText}
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No mapped data found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            show={totalPages > 1}
          />
        </div>
      )}
    </div>
  );
};

export default MappedData;