import React from "react";

const SearchButton = ({
 value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-50 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 placeholder-gray-400 ${className}`}
    />
  );
};

export default SearchButton;
