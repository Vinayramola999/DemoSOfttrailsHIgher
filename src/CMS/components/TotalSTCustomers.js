import React, { useEffect, useState } from "react";
import { GoPersonAdd } from "react-icons/go";
import { MdPeopleOutline } from "react-icons/md";

export default function TotalSTCustomers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://devdemo.softtrails.net/customers//stats")
      .then((res) => res.json())
      .then((json) => {
        // API returns { data: { softrailsCustomers: '2', newSoftrailsCustomers: { ... } } }
        setData(json.data || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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

  // Extract SoftTrails customers and trend info
  const totalCustomers = data?.softrailsCustomers ?? "0";
  const softrailsMetrics = data?.newSoftrailsCustomers || {};
  const trend =
    softrailsMetrics.yearTrend ||
    softrailsMetrics.monthTrend ||
    softrailsMetrics.weekTrend ||
    "steady";
  const percentageChange =
    softrailsMetrics.yearPercentageChange ||
    softrailsMetrics.monthPercentageChange ||
    softrailsMetrics.weekPercentageChange ||
    "+0%";

  const parsedPercent = (() => {
    if (!percentageChange) return 0;
    const num = parseFloat(String(percentageChange).replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(num) ? num : 0;
  })();
  const isPositive = parsedPercent >= 0;

  return (
    <div className=" p-5 bg-white rounded-lg shadow-md w-[240px]">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[#6B7280] text-[12px] font-medium">
              SoftTrails Customers
            </p>
            <div>
              <p className="text-[#1F2937] text-[20px] font-semibold">
                {totalCustomers}
              </p>
              <p className="text-[#6B7280] text-[12px]">All Time</p>
            </div>
          </div>
          <div className="rounded-full p-2 bg-blue-200">
            <MdPeopleOutline size={24} color="#2563EB" />{" "}
          </div>
        </div>
        <p
          className={`${
            trend === "down" || trend === "Decrease"
              ? "text-red-600"
              : "text-green-600"
          } text-[12px] font-medium mt-2`}
        >
          <span className="pr-4">
            {Math.abs(parsedPercent)}%{" "}
            {trend === "down" || trend === "Decrease"
              ? "dec"
              : trend === "steady"
              ? "steady"
              : "inc"}
          </span>
        </p>
      </div>
    </div>
  );
}
