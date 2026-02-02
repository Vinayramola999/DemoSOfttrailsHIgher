import React, { useState, useEffect } from "react";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Cell,
  Legend,
} from "recharts";
import { BsThreeDotsVertical } from "react-icons/bs";

type CustomPieProps = {
  cx?: number,
  cy?: number,
  midAngle?: number,
  innerRadius?: number,
  outerRadius?: number,
  startAngle?: number,
  endAngle?: number,
  fill?: string,
  payload?: { name?: string, fill?: string },
  percent?: number,
  value?: number,
};

type ApiProduct = {
  productName: string,
  totalActivations: number,
  thisYear: number,
  previousYear: number,
  thisMonth: number,
  previousMonth: number,
  thisWeek: number,
  previousWeek: number,
};

const COLORS = [
  "#4285F4",
  "#34A853",
  "#A142F4",
  "#FBBC05",
  "#F500DD",
  "#FF7043",
  "#00ACC1",
];

// ---------- Custom Shape ----------
const renderActiveShape = (props: CustomPieProps) => {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    value,
    percent,
  } = props;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * (midAngle ?? 0));
  const cos = Math.cos(-RADIAN * (midAngle ?? 0));
  const sx = (cx ?? 0) + ((outerRadius ?? 0) + 10) * cos;
  const sy = (cy ?? 0) + ((outerRadius ?? 0) + 10) * sin;
  const mx = (cx ?? 0) + ((outerRadius ?? 0) + 30) * cos;
  const my = (cy ?? 0) + ((outerRadius ?? 0) + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      {/* Removed product name text from center */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={(outerRadius ?? 0) + 6}
        outerRadius={(outerRadius ?? 0) + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >
        {`Product Sold - ${value}`}
      </text>
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`(${((percent ?? 0) * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

// Custom Legend Renderer
const renderCustomLegend = (props) => {
  const { payload, chartData } = props;
  // chartData is passed from Legend content prop
  // If not, fallback to payload
  const data = chartData || payload;
  const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
  return (
    <ul
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "start",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      {data.map((entry, index) => {
        const percent =
          total > 0 ? ((entry.value / total) * 100).toFixed(2) : "0.00";
        return (
          <li
            key={`item-${index}`}
            style={{
              marginRight: 20,
              display: "flex",
              alignItems: "center",
              fontSize: "13px",
              fontWeight: "300",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: entry.color || entry.fill,
                marginRight: 6,
                borderRadius: "50%",
              }}
            />
            {entry.name} &nbsp;
            <span style={{ color: "#333", fontWeight: 400 }}>
              ({entry.value} , {percent}%)
            </span>
          </li>
        );
      })}
    </ul>
  );
};

// ---------- Component ----------
export default function ProductSalesChart() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [range, setRange] = useState("year");
  const [open, setOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch API Data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          "https://saaspro.softtrails.net/cms/pro/dashboard/stats/license/ProductStats"
        );
        const json = await res.json();
        if (json.success && json.data) {
          setApiData(json.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Transform API data into chart data
  function filterByRange(range: string) {
    if (!apiData.length) return [];

    return apiData.map((item, index) => {
      let value = item.totalActivations;

      if (range === "month") value = item.thisMonth;
      else if (range === "year") value = item.thisYear;
      else if (range === "week") value = item.thisWeek;
      else value = item.totalActivations;

      return {
        name: item.productName,
        value,
        fill: COLORS[index % COLORS.length],
      };
    });
  }

  const data = filterByRange(range);

  const onPieEnter = (_: CustomPieProps, index: number) => {
    setActiveIndex(index);
  };

  const options = [
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "week", label: "This Week" },
    { value: "all", label: "All Time" },
  ];

  const currentLabel = options.find((o) => o.value === range)?.label;

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center relative">
        <p className="font-semibold text-[#1F2937]">Product Activations</p>

        {/* Dropdown */}
        <div className="relative flex flex-col items-end">
          {/* Three dots button */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <BsThreeDotsVertical size={16} className="text-black " />
          </button>

          {/* Current filter label */}
          <span className="text-xs text-gray-600 mt-1">{currentLabel}</span>

          {/* Dropdown menu */}
          {open && (
            <div className="absolute right-0 mt-10 w-40 bg-white border rounded-lg shadow-lg z-10">
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

      {/* ✅ Active product name outside chart (top-Left) */}
      {data.length > 0 && (
        <div className="flex justify-start mb-2">
          <span className="text-sm font-light black">
            {data[activeIndex]?.name}
          </span>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="value"
                onMouseEnter={onPieEnter}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                content={(props) =>
                  renderCustomLegend({ ...props, chartData: data })
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
