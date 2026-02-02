import React from 'react';

const TableFilters = ({
  searchQuery,
  setSearchQuery,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onClearFilters,
  searchPlaceholder = "Search",
  showDateFilter = true,
  className = "",
  children
}) => {
  const handleClearFilters = () => {
    setSearchQuery("");
    if (showDateFilter) {
      setStartDate("");
      setEndDate("");
    }
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const toISODateString = (value) => {
    if (!value) return null;
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    // If already in DD/MM/YYYY (display), convert to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [d, m, y] = value.split('/');
      return `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
    }
    // Try Date parse as fallback
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    // toLocaleDateString('en-CA') outputs YYYY-MM-DD
    return date.toLocaleDateString('en-CA');
  };

  return {
    filterData: (data, filterKeys = []) => {
      if (!Array.isArray(data)) return [];
      return data.filter((item) => {
        // Search query filter
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = filterKeys.some((key) => {
            const value = item[key];
            return value && value.toString().toLowerCase().includes(searchLower);
          });

          if (!matchesSearch) return false;
        }

        // Date filter
        if (showDateFilter && (startDate || endDate)) {
          const itemDateRaw = item.created_at || item.date || item.displayDate || item.created_time || item.dateString;
          if (!itemDateRaw) return false;

          const dateStr = toISODateString(itemDateRaw);
          if (!dateStr) return false; // invalid date

          const isAfterStart = startDate ? dateStr >= startDate : true;
          const isBeforeEnd = endDate ? dateStr <= endDate : true;

          if (!isAfterStart || !isBeforeEnd) return false;
        }

        return true;
      });
    },

    // Render function for the filter UI
    renderFilters: () => (
      <div className={`flex gap-2 items-center ${className}`}>
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-md pl-10 pr-4 h-12 py-2 w-[250px]"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
              />
            </svg>
          </span>
        </div>

        {/* Date Range Filter */}
        {showDateFilter && (
          <div className="flex justify-center bg-white items-center m-3 h-12 border rounded-md">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 sm:w-30 rounded-2xl"
            />
            <span className="text-gray-600 px-2">TO</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 sm:w-30 rounded-2xl"
            />
          </div>
        )}

        <button
          onClick={handleClearFilters}
          className="bg-gray-200 text-black px-4 py-2 h-12 rounded-md hover:bg-gray-300"
        >
          Clear Filters
        </button>

        {children}
      </div>
    ),
  };
};

export default TableFilters;
