import React from "react";
import { FiSearch } from "react-icons/fi";
import { IoChevronDown } from "react-icons/io5";

const CustomerFilters = ({ filtersConfig, filterState, setFilterState }) => {
  const handleChange = (key, value) => {
    setFilterState((prev) => ({ ...prev, [key]: value }));
  };

  const handleDateRangeChange = (rangeKey, field, value) => {
    setFilterState((prev) => ({
      ...prev,
      [rangeKey]: { ...prev[rangeKey], [field]: value },
    }));
  };

  const handleClearFilters = () => {
    const cleared = {};
    filtersConfig.forEach((f) => {
      if (f.type === "dateRange") {
        cleared[f.key] = { start: "", end: "" };
      } else {
        cleared[f.key] = "";
      }
    });
    setFilterState(cleared);
  };

  const isClearDisabled = Object.values(filterState).every((val) =>
    typeof val === "object" ? !val.start && !val.end : !val
  );

  return (
    <div
      className="
        w-full flex flex-wrap sm:flex-row items-center justify-start
        gap-2 sm:gap-3 lg:gap-4 py-2
        px-3 sm:px-0
        select-none cursor-default    /* ✅ Prevent selection + text cursor */
      "
    >
      {filtersConfig.map((filter, i) => {
        const value = filterState[filter.key];

        switch (filter.type) {
          case "search":
            return (
              <div
                key={i}
                className="relative w-full sm:w-48 md:w-52 lg:w-[204px] h-9"
              >
                <input
                  type="text"
                  value={value}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  placeholder={filter.placeholder || 'Search'}
                  className="w-full h-full bg-white border border-[#CDCDCD] rounded-lg pl-8 pr-3 text-sm text-[#494949] outline-none font-inter"
                />
                <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-black w-4 h-4" />
              </div>
            );

          case "select":
            return (
              <div
                key={i}
                className="relative w-full sm:w-36 md:w-40 lg:w-[131px] h-9"
              >
                <select
                  value={value}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="w-full h-full bg-white border border-[#CDCDCD] rounded-lg px-2 pr-6 text-sm text-[#616060] outline-none font-inter appearance-none cursor-pointer"
                >
                  <option value="">{filter.label || "Select"}</option>
                  {(filter.options || []).map((opt, idx) => (
                    <option key={idx} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <IoChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-black w-3 h-3 pointer-events-none" />
              </div>
            );

          case "dateRange":
            return (
              <div
                key={i}
                className="
                  flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2
                  bg-white border border-[#CDCDCD] rounded-lg px-2 py-1
                  w-full sm:w-auto h-auto sm:h-9
                  select-none cursor-default   /* ✅ Prevent selection/cursor */
                "
              >
                <div className="flex items-center gap-1">
                  <input
                    type="date"
                    id={`start-date-${i}`}
                    value={value?.start || ""}
                    onChange={(e) =>
                      handleDateRangeChange(filter.key, "start", e.target.value)
                    }
                    className="text-xs text-[#616060] bg-transparent outline-none font-inter"
                  />
                  <span className="text-[10px] text-black sm:px-1">TO</span>
                  <input
                    type="date"
                    id={`end-date-${i}`}
                    value={value?.end || ""}
                    onChange={(e) =>
                      handleDateRangeChange(filter.key, "end", e.target.value)
                    }
                    className="text-xs text-[#616060] bg-transparent outline-none font-inter"
                  />
                </div>
              </div>
            );

          default:
            return null;
        }
      })}

      {/* Clear Button */}
      <div className="w-full sm:w-auto">
        <button
          onClick={handleClearFilters}
          disabled={isClearDisabled}
          className={`w-full sm:w-auto bg-white border border-[#CDCDCD] rounded-lg px-3 py-2 text-sm font-inter ${
            isClearDisabled
              ? "opacity-50 cursor-not-allowed text-[#616060]"
              : "hover:bg-gray-50 text-black"
          }`}
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default CustomerFilters;
