  // This file is named SearchableDropdown.jsx and is already in PascalCase.
import { useState, useEffect, useRef } from "react";

export default function SearchableDropdown({ options, placeholder, onSelect }) {
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

  const filteredOptions = options.filter((item) =>
    (item.name || item.doctype || item.doc_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSelect = (item) => {
    onSelect(item);
    setSearchTerm(item.name || item.doctype || item.doc_name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSelect("");
  };

  return (
    <div ref={wrapperRef} className="relative w-full ">
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
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => (
              <li
                key={item.id}
                className="px-4 py-2 hover:bg-blue-100 cursor-pointer"
                onClick={() => handleSelect(item)}
              >
                {item.name || item.doctype || item.doc_name}
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
