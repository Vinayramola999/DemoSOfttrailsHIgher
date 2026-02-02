import React from "react";

const Dropdown = ({ label, options }) => {
  return (
    <div className="flex flex-col">
      <label className="text-gray-700">{label}</label>
      <select className="border p-2 rounded-md">
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
