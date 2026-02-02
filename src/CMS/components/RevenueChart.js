import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BsThreeDotsVertical } from "react-icons/bs"; // <-- Add this import

const API_BASE = "https://saaspro.softtrails.net/cms/pro/dashboard/stats/revenue";

const options = [
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Data" },
];

function getApiFilter(range) {
  if (range === "all") return "/All";
  if (range === "year") return "/year";
  if (range === "month") return "/month";
  if (range === "week") return "/week";
  return "/All";
}

function mapApiData(range, apiStats) {
  if (!Array.isArray(apiStats)) return [];
  if (range === "year") {
    return apiStats.map((item) => ({
      name: item.month || item.year || item.date,
      uv: Number(item.total_amount),
    }));
  }
  if (range === "month" || range === "week" || range === "all") {
    return apiStats.map((item) => ({
      name: item.month || item.year || item.date,
      uv: Number(item.total_amount),
    }));
  }
  return [];
}

export default function RevenueChart() {
  const [range, setRange] = useState("year");
  const [open, setOpen] = useState(false);
  const [data, setData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(API_BASE + getApiFilter(range));
        const json = await res.json();
        const stats = json?.data?.stats || [];
        const chartData = mapApiData(range, stats);
        setData(chartData);
        setTotalRevenue(chartData.reduce((acc, item) => acc + item.uv, 0));
      } catch (e) {
        setData([]);
        setTotalRevenue(0);
      }
      setLoading(false);
    }
    fetchData();
  }, [range]);

  const currentLabel = options.find((o) => o.value === range)?.label;

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center relative">
        <p className="font-semibold text-[#1F2937]">
          Revenue{" "}
          <span className="text-[#005AE6]">
            {`( ₹ ${totalRevenue.toLocaleString()} )`}
          </span>
        </p>
        {/* Dots Button */}
        <div className="relative">
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="px-2 py-1 rounded-lg  bg-white text-[#1F2937] hover:bg-gray-100 flex items-center"
          >
            <BsThreeDotsVertical size={16} className="text-black" />
          </button>
          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-10">
              {options.map((o) => (
                <div
                  key={o.value}
                  onClick={() => {
                    setRange(o.value);
                    setOpen(false);
                  }}
                  className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                    range === o.value ? "bg-gray-100 font-semibold" : ""
                  }`}
                >
                  {o.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Current label at top right of chart */}
      <div className="flex justify-end mb-2">
        <span className="text-xs text-gray-600">
          {currentLabel}
        </span>
      </div>
      <div style={{ width: "100%", height: 400 }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            Loading...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="1"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="#3B82F600" />
                  <stop offset="100%" stopColor="#005AE6" />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                horizontal={true}
                strokeDasharray="3 3"
                stroke="#e5e7eb"
              />
              <XAxis dataKey="name" />
              <YAxis domain={[0, "auto"]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="uv"
                stroke="#005AE6"
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Show months below chart if year filter is selected */}
      {range === "year" && (
        <div className="flex  justify-between  text-[10px] text-gray-500 pl-12">
          {[
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}
      {/* Show days below chart if week filter is selected */}
      {range === "week" && (
        <div className="flex justify-between text-[10px] text-gray-500 pl-12">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
      )}
    </div>
  );
}
