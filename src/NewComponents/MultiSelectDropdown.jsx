import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown } from "react-icons/fa";

const MultiSelectDropdown = ({ label, options = [], selected = [], onChange, required }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle Select / Deselect Logic
  const handleSelect = (optionId) => {
    const allOption = options.find((o) => o.value === "all");
    const allIds = options.filter((o) => o.value !== "all").map((o) => o.value);

    if (optionId === "all") {
      // 🔹 Toggle Select All / Deselect All
      const isAllSelected = allIds.every((id) => selected.includes(id));
      if (isAllSelected) {
        onChange([]); // deselect all
      } else {
        onChange(allIds); // select all options except "all"
      }
    } else {
      // 🔹 Normal option selection
      let newSelected;
      if (selected.includes(optionId)) {
        newSelected = selected.filter((id) => id !== optionId);
      } else {
        newSelected = [...selected, optionId];
      }

      // If all items are now selected, replace with allIds (consistent state)
      const isNowAllSelected = allIds.every((id) => newSelected.includes(id));
      onChange(isNowAllSelected ? allIds : newSelected);
    }
  };

  // ✅ Detect "All" option
  const allOption = options.find((o) => o.value === "all");
  const allIds = options.filter((o) => o.value !== "all").map((o) => o.value);
  const isAllSelected = allOption && allIds.every((id) => selected.includes(id));

  // ✅ Display logic
  const displaySelected =
    isAllSelected && allOption
      ? [allOption]
      : options.filter((opt) => selected.includes(opt.value) && opt.value !== "all");

  return (
    <div className="mb-3 relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Selected items box */}
      <div
        onClick={toggleDropdown}
        className="w-full border border-gray-300 rounded-md p-2 bg-white cursor-pointer flex flex-wrap justify-between items-center min-h-[42px]"
      >
        <div className="flex flex-wrap gap-2 flex-1">
          {displaySelected.length > 0 ? (
            displaySelected.map((opt) => (
              <span
                key={opt.value}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1"
              >
                {opt.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(opt.value);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </span>
            ))
          ) : (
            <span className="text-gray-400 text-sm">Select options</span>
          )}
        </div>

        <FaChevronDown
          className={`ml-2 text-gray-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${
                (opt.value === "all" && isAllSelected) ||
                selected.includes(opt.value)
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default MultiSelectDropdown;