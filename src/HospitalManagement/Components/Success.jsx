import React from "react";
import { FaCheck } from "react-icons/fa";

const Success = ({ open, title = "Success", message = "Operation completed successfully.", onContinue }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-xl w-[400px] p-8 flex flex-col items-center transform transition-all">

        {/* Icon */}
        <div className="w-20 h-20 bg-[#005AE6] rounded-full flex items-center justify-center mb-4 shadow-sm">
          <FaCheck className="text-white text-4xl" />
        </div>

        {/* Title */}
        <h3 className="text-[32px] font-bold text-[#005AE6] mb-2 font-['Inter']">{title}</h3>

        {/* Message */}
        <p className="text-[#6B7280] text-center mb-8 text-lg font-normal leading-tight px-4 font-['Inter']">
          {message}
        </p>

        {/* Button */}
        <button
          onClick={onContinue}
          className="w-full bg-[#005AE6] text-white font-semibold text-lg py-3 rounded-xl hover:bg-blue-700 transition-colors duration-200 font-['Inter']"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default Success;
