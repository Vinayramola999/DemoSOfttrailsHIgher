import React from "react";

const TableComponent = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto" style={{ maxHeight: "600px", overflowY: "auto" }}>
      <table className="w-full border-collapse">
        {/* Header */}
        <thead className="sticky top-0 bg-white z-10">
          <tr className="border-b-2 border-gray-800">
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-6 py-3 text-center font-bold text-gray-900 text-sm"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-gray-200 ${
                rowIndex % 2 === 0 ? "bg-blue-50" : "bg-white"
              }`}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-6 py-4 text-center text-gray-700 text-sm"
                >
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;