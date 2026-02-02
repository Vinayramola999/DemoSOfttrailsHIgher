import { useState, useEffect, useRef } from "react";

export default function SearchableDropdown({ options, placeholder, onSelect, value }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Update displayed input when `value` prop changes.
    // If value is provided, show its label; if cleared (null/""/undefined) clear the input.
    if (value) {
      setSearchTerm(value.workflow_name || value.module_name || value.label || value.sub_module || "");
    } else {
      setSearchTerm("");
    }
  }, [value]);

  const handleSelect = (item) => {
    onSelect(item);
    setSearchTerm(item.workflow_name || item.module_name || item.label || item.sub_module || "");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    // Notify parent that selection was cleared
    if (typeof onSelect === "function") onSelect(null);
  };

  return (
    <div ref={wrapperRef} className="relative w-full bg-white">
      <div className="relative">
        <input
          required
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full border border-gray-300 px-4 py-2 pr-10 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-black cursor-pointer"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 "
          >
            ✕
          </button>
        )}
      </div>
      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded max-h-60 overflow-y-auto shadow">
          {options.length > 0 ? (
            options.map((item) => (
              <li
                key={item.id || item.workflow_id || item.module_id || item.sub_id}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                {item.label || item.workflow_name || item.value || item.module_name || item.sub_module}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-500">No results found</li>
          )}
        </ul>
      )}
    </div>
  );
}
