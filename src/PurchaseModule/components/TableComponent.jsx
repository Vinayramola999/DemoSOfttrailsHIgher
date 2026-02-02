import React from "react";

const TableComponent = ({ columns, data }) => {
  return (
    <div className="overflow-x-auto border border-blue-400 rounded">
      <table className="w-full border-collapse text-xs">
        {/* Sticky Header with Blue Background */}
        <thead className="sticky top-0 bg-blue-50 z-20">
          <tr className="border-b border-blue-400">
            {columns.map((col, index) => (
              <th
                key={index}
                className="px-3 py-2.5 text-center font-semibold text-gray-700 border-r border-blue-400 last:border-r-0"
                style={{ fontSize: "9px" }}
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
              className="bg-white border-b border-gray-300 hover:bg-gray-50"
            >
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex} 
                  className="px-3 py-2.5 border-r border-gray-300 last:border-r-0 text-gray-800"
                  style={{ 
                    fontSize: "9px",
                    textAlign: col.align || "center"
                  }}
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