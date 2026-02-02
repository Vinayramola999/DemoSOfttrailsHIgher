import React from 'react';

// Reusable table for leads. UI-only — data & handlers supplied by parent.
export default function LeadsTable({
  columns = [],
  data = [],
  indexOffset = 0,
  onRowClick,
  actionsRenderer,
  page = 1,
  totalPages = 1,
  onPageChange = () => {},
  rowKey = (r, i) => r.lead_id || r.id || i,
  className = '',
  visibleRowsPerPage = 5
}) {
  // Show all data, but container has max height to show only visibleRowsPerPage rows (with scroll)
  const maxHeight = visibleRowsPerPage * 61 + 70; // row height (61px) * visible rows + header height (70px)

  return (
    <div className={`bg-white ${className}`}>
      {/* Scrollable table container - shows max 5 rows visible, can scroll to see rest */}
      <div className="overflow-y-auto overflow-x-auto bg-white" style={{ maxHeight: `${maxHeight}px` }}>
        <table className="min-w-full text-sm bg-white">
          <thead className="h-[70px] sticky top-0 bg-white border-b-black border-b-2 z-10">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={`py-2 px-4 border-b text-center bg-white ${col.headClass || ''}`}>{col.label}</th>
              ))}
              {actionsRenderer && <th className="py-2 px-4 border-b text-center bg-white w-28 overflow-visible">Action</th>}
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actionsRenderer ? 1 : 0)} className="text-center p-4 text-gray-500 bg-white">No leads available.</td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={rowKey(row, idx)}
                  className={`border-t h-[61px] ${idx % 2 === 0 ? 'bg-blue-50' : 'bg-white'} hover:bg-blue-100 transition-colors`}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`p-3 text-center align-middle ${col.cellClass || ''}`} onClick={() => col.clickable ? onRowClick && onRowClick(row) : undefined}>
                      {col.render ? col.render(row, indexOffset + idx) : (row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-')}
                    </td>
                  ))}

                  {actionsRenderer && (
                    <td className="p-3 text-center align-middle w-28 overflow-visible">
                      {actionsRenderer({ row, rowIndex: indexOffset + idx })}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination - separated from table with margin */}
      <div className="flex items-center justify-center gap-2 pt-3 pb-3 border-t border-gray-200 bg-gray-100">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          &lt;
        </button>
        <span className="px-3 py-1 border rounded-md bg-blue-600 text-white">{page}</span>
        <span>of</span>
        <span className="px-3 py-1 border rounded-md">{totalPages}</span>
        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          className="px-3 py-1 border rounded-md disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
}