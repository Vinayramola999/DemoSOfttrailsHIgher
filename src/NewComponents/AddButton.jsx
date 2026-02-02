import React from "react";

const PrimaryButton = ({ onClick, children, className = "", icon: Icon }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-[#005AE6] text-white px-6 py-2 rounded-lg hover:bg-[#004bb5] transition duration-300 flex items-center gap-2 ${className}`}
    >
      {Icon && <Icon />}
      {children}
    </button>
  );
};

export default PrimaryButton;
