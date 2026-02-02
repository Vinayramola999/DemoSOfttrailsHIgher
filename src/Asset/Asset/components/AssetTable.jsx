import React, { useMemo } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

const AssetTable = ({
  tableData,
  filteredData,
  pagination,
  currentPage,
  itemsPerPage,
  selectedCategory,
  handleEdit,
  handleDelete,
  handlePageChange,
  formatDate,
  formatStages,
}) => {
  return (
    <div className="relative w-full bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto overflow-y-auto max-h-[75vh] sm:max-h-[60vh] md:max-h-[60vh]">
        {useMemo(
          () => (
            <table className="min-w-full table-auto text-sm border-collapse">
              <thead
                className="text-[16px] font-medium bg-white sticky top-0 "
                style={{ boxShadow: "0 2px 0 black" }}
              >
                <tr>
                  <th className="p-5 text-center">S.no</th>
                  {/* Adjust headers for All Assets */}
                  {(selectedCategory === "All Assets"
                    ? [
                        "Asset Name",
                        "Category",
                        "Created On",
                        "Status",
                        "Stage",
                      ]
                    : ["Asset Name", "Created On", "Status", "Stage"]
                  ).map((column, index) => (
                    <th key={index} className="p-5 text-center ">
                      {column}
                    </th>
                  ))}
                  <th className="p-5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((asset, index) => (
                    <tr
                      key={asset.unique_id || index}
                      className={`cursor-pointer ${
                        index % 2 === 0 ? "bg-blue-50" : "bg-white"
                      } hover:bg-blue-100`}
                    >
                      <td className="px-5 py-3 text-center">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>

                      {(selectedCategory === "All Assets"
                        ? [
                            "Asset Name",
                            "categoryName",
                            "created_at",
                            "status",
                            "stages",
                          ]
                        : ["Asset Name", "created_at", "status", "stages"]
                      ).map((column, colIndex) => (
                        <td key={colIndex} className="px-5 py-3 text-center">
                          {column === "created_at"
                            ? formatDate(asset[column])
                            : column === "stages"
                            ? formatStages(asset[column])
                            : asset[column] || ""}
                        </td>
                      ))}

                      <td className="px-5 py-3 text-center">
                        <button
                          className="text-blue-600 mx-1 md:mx-2 p-1 rounded-full hover:bg-blue-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(asset.unique_id);
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="text-red-600 mx-1 md:mx-2 p-1 rounded-full hover:bg-red-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(asset); // Pass full asset
                          }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={selectedCategory === "All Assets" ? 7 : 6}
                      className="text-center py-5 text-gray-500 font-medium italic"
                    >
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ),
          [filteredData, pagination.offset, selectedCategory]
        )}
      </div>

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="sticky bottom-0 bg-white flex flex-wrap justify-center items-center gap-2 p-3 border-t border-gray-300">
          <button
            onClick={() => handlePageChange("prev")}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            &lt;
          </button>

          <span className="px-3 py-1 rounded bg-blue-600 text-white text-sm">
            {currentPage}
          </span>

          <span className="text-sm font-medium">of</span>

          <span className="px-3 py-1 rounded border border-blue-500 text-blue-600 text-sm">
            {Math.ceil(
              (pagination.total ?? 0) / (pagination.limit ?? itemsPerPage)
            )}
          </span>

          <button
            onClick={() => handlePageChange("next")}
            disabled={
              currentPage === Math.ceil((pagination.total ?? 0) / (pagination.limit ?? itemsPerPage))
            }
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-sm disabled:bg-gray-100 disabled:text-gray-400"
          >
            &gt;
          </button>
        </div>
      )}
    </div>
  );
};

export default AssetTable;
