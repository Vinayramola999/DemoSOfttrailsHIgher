import { useEffect, useRef, useState } from "react";

export default function FormatDropdown({ formats, onChange, initialSelected = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFormats, setSelectedFormats] = useState(Array.isArray(initialSelected) ? initialSelected : []);
  const [searchTerm, setSearchTerm] = useState("");

  const dropdownRef = useRef();

  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleFormatToggle = (extension) => {
    const updated = selectedFormats.includes(extension)
      ? selectedFormats.filter((item) => item !== extension)
      : [...selectedFormats, extension];
    setSelectedFormats(updated);
  };

  const handleSelectAll = () => {
    setSelectedFormats(formats.map((f) => f.extension));
  };

  const handleDeselectAll = () => {
    setSelectedFormats([]);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const filteredFormats = formats.filter(
    (f) =>
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.extension.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current(selectedFormats);
  }, [selectedFormats]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        placeholder="select file format"
        onClick={toggleDropdown}
        className="w-full flex justify-between items-center px-4 py-2 text-left bg-white border border-gray-300 rounded focus:outline-none"
      >
        <span className="truncate">
          {selectedFormats?.length > 0
            ? `Selected: ${selectedFormats.join(", ")}`
            : "Select file formats"}
        </span>
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 ring-1 ring-black ring-opacity-5 overflow-auto">
          <div className="sticky top-0 bg-white px-3 py-2 border-b">
            <div className="relative">
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-8"
                placeholder="Search formats..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                  onClick={handleClearSearch}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="border-b px-4 py-2 flex justify-between text-sm">
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={handleSelectAll}
            >
              Select All
            </button>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={handleDeselectAll}
            >
              Deselect All
            </button>
          </div>

          {filteredFormats.length > 0 ? (
            filteredFormats.map((f) => (
              <div
                key={f.id}
                className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleFormatToggle(f.extension)}
              >
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(f.extension)}
                  readOnly
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700 cursor-pointer">
                  <strong>.{f.extension}</strong> - {f.name}
                </label>
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
