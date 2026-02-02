//       ./CRM/Customer/component/pagination.jsx
import React from "react";
import { FaLessThan, FaGreaterThan } from "react-icons/fa";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center gap-2 pt-2 sticky bottom-0 z-10">
      {/* Previous Button */}
      <button
        className="w-[32px] h-[32px] border border-blue-500 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        <FaLessThan size={10} color="#000" />
      </button>

      {/* Current Page Number */}
      <div className="w-[32px] h-[32px] bg-blue-600 text-white rounded flex items-center justify-center text-sm font-medium">
        {currentPage}
      </div>

      <span className="text-sm font-medium">of</span>

      {/* Total Pages */}
      <div className="w-[32px] h-[32px] border border-blue-500 rounded flex items-center justify-center text-sm font-medium">
        {totalPages}
      </div>

      {/* Next Button */}
      <button
        className="w-[32px] h-[32px] border border-blue-500 rounded flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        <FaGreaterThan size={10} color="#000" />
      </button>
    </div>
  );
};

export default Pagination;
