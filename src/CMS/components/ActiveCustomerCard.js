import React, { useEffect, useState, useRef } from "react";
import { GoPersonAdd } from "react-icons/go";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdFilterListAlt } from "react-icons/md";

const FILTERS = [
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "This Year", value: "year" },
];

export default function ActiveCustomerCard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("month");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch("https://saaspro.softtrails.net/cms/pro/dashboard/stats/license/ActiveCustomer")
      .then((res) => res.json())
      .then((json) => {
        setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  if (loading) {
    return <div className="p-6 bg-white rounded-lg shadow-md">Loading...</div>;
  }

  if (!data) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md">
        Error loading data.
      </div>
    );
  }

  // Select values based on filter
  let current, previous, trend, percentageChange, label;
  if (filter === "week") {
    current = data.thisWeek;
    previous = data.previousWeek;
    trend = data.weekTrend;
    percentageChange = data.weekPercentageChange;
    label = "This Week";
  } else if (filter === "month") {
    current = data.thisMonth;
    previous = data.previousMonth;
    trend = data.monthTrend;
    percentageChange = data.monthPercentageChange;
    label = "This Month";
  } else {
    current = data.thisYear;
    previous = data.previousYear;
    trend = data.yearTrend;
    percentageChange = data.yearPercentageChange;
    label = "This Year";
  }

  // Determine if percentageChange is positive or negative
  const isPositive = Number(percentageChange) >= 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md w-[240px] relative">
        <div className="absolute right-0" ref={dropdownRef}>
          <button
            className="p-1 rounded hover:bg-gray-100"
            onClick={() => setShowDropdown((prev) => !prev)}
          >
            <MdFilterListAlt size={16} />
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-32 bg-white border rounded shadow-lg z-10">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    filter === f.value ? "font-semibold text-blue-600" : ""
                  }`}
                  onClick={() => {
                    setFilter(f.value);
                    setShowDropdown(false);
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 ">
          <div className="flex justify-between items-start">
            <div className="">
              <p className="text-[#6B7280] text-[12px] font-medium">
                Active Customers
              </p>
              <div>
                <p className="text-[#1F2937] text-[20px] font-semibold">
                  {current}
                </p>
                <p className="text-[#6B7280] text-[12px]">{label}</p>
              </div>
            </div>

            <div
              className={`rounded-full p-2 ${
                isPositive ? "bg-green-200" : "bg-red-200"
              }`}
            >
              <GoPersonAdd
                size={24}
                color={isPositive ? "#22C55E" : "#EF4444"}
              />
            </div>
          </div>

          <p
            className={`text-${
              trend === "Decrease" ? "red" : "green"
            }-600 text-[12px] font-medium mt-2`}
          >
            <span className="pr-4">
              {Math.abs(Number(percentageChange))}%{" "}
              {trend === "Decrease" ? "dec" : "inc"}
            </span>
            since last {filter}
          </p>
        </div>
      </div>
    </>
  );
}
