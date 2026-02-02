import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null; // No need to show pagination if only one page

  return (
    <div className="sticky bottom-0 left-0 w-full flex justify-center items-center flex-wrap gap-2 px-4 py-2 z-10 bg-gray-100">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &lt;
      </button>

      {/* Current Page of Total Pages */}
      <span className="px-3 py-1 bg-blue-600 text-white rounded">
        {currentPage}
      </span>
      <span>of</span>
      <span className="px-3 py-1 border border-blue-500 text-blue-600 rounded">
        {totalPages}
      </span>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
      >
        &gt;
      </button>
    </div>
  );
};
export default Pagination;