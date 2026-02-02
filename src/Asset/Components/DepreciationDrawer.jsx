import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import {
  FiDollarSign,
  FiTrendingDown,
  FiCalendar,
  FiAlertTriangle,
  FiPieChart,
  FiDownloadCloud,
} from "react-icons/fi";
import Drawer from "./Drawer";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { DMS_BASE,JAVA_BASE, ASSET_NODE_BASE, UCS_BASE ,MAIN_BASE } from "../../config/apiBase";
export default function DepreciationDrawer({ categoryName, assetId, open, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchDepreciationData = async () => {
    if (!categoryName || !assetId) return;
    setLoading(true);
    setError("");
    const token = sessionStorage.getItem("token");

    try {
      const res = await axios.get(
        `${JAVA_BASE}api/dep/yearlyWDB/${categoryName}/${assetId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setData(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to load depreciation data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchDepreciationData();
  }, [open]);

  const handleExportExcel = () => {
    if (!data?.yearlyDepreciation) return;
    const exportData = data.yearlyDepreciation.map((item) => ({
      Year: item.year,
      "Depreciation Value (₹)": item.value,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Depreciation");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${data.assetName.replace(/\s+/g, "_")}_Depreciation.xlsx`);
  };

  // 📉 Calculate total depreciation percentage
  const depreciationPercentage = useMemo(() => {
    if (!data?.yearlyDepreciation?.length) return 0;
    const latest = data.yearlyDepreciation[data.yearlyDepreciation.length - 1].value;
    const percent = ((data.originalCost - latest) / data.originalCost) * 100;
    return percent.toFixed(1);
  }, [data]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={
        data
          ? `Depreciation Overview — ${data.assetName} (₹ Analytics)`
          : "Depreciation Overview"
      }
    >
      {/* Loader */}
      {loading && (
        <div className="flex justify-center items-center py-20 text-blue-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full"
          />
          <span className="ml-3 font-medium text-gray-600">Analyzing depreciation...</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex flex-col justify-center items-center text-center py-16 text-red-600">
          <FiAlertTriangle className="text-4xl mb-2" />
          <p className="font-semibold">{error}</p>
        </div>
      )}

      {!loading && !error && !data && (
        <p className="text-center text-gray-500 py-16">
          No depreciation insights available.
        </p>
      )}

      {/* Main Content */}
      {!loading && !error && data && (
        <div className="space-y-10 relative">
          {/* Soft background glow */}
          <div className="absolute inset-0 opacity-10 blur-3xl bg-gradient-to-br from-blue-400 via-indigo-400 to-sky-400"></div>

          {/* KPI Section */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative grid grid-cols-1 sm:grid-cols-3 gap-5 bg-white/80 backdrop-blur-lg border border-gray-200 rounded-2xl shadow-md p-6"
          >
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm">Original Cost</span>
              <span className="text-2xl font-semibold text-blue-700">
                ₹{data.originalCost.toLocaleString("en-IN")}
              </span>
              <FiDollarSign className="text-blue-500 text-lg mt-1" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm">Scrap Value</span>
              <span className="text-2xl font-semibold text-green-700">
                ₹{data.scrapValue.toLocaleString("en-IN")}
              </span>
              <FiTrendingDown className="text-green-500 text-lg mt-1" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-500 text-sm">Total Depreciation</span>
              <motion.span
                className="text-2xl font-bold text-indigo-700"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {depreciationPercentage}%
              </motion.span>
              <FiPieChart className="text-indigo-500 text-lg mt-1" />
            </div>
          </motion.div>

          {/* Chart Section */}
          <div className="bg-white/90 rounded-2xl shadow-xl border border-gray-200 p-6 relative backdrop-blur-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <FiTrendingDown className="text-blue-600" />
              Yearly Depreciation Chart
            </h3>

            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={data.yearlyDepreciation}>
                <defs>
                  <linearGradient id="rupeeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => `₹${v.toLocaleString("en-IN")}`}
                  tick={{ fontSize: 12 }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    borderRadius: "12px",
                    border: "1px solid #ccc",
                    fontSize: "13px",
                  }}
                  formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Depreciation Value"]}
                />
                <Legend verticalAlign="bottom" height={30} />
                <Bar
                  dataKey="value"
                  fill="url(#rupeeGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={14}
                  name="₹ Value"
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#1e3a8a"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  name="Trend"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Yearly Breakdown */}
          <div className="relative space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Yearly Breakdown</h3>
              {/* Floating icon button for Excel */}
              <motion.button
                onClick={handleExportExcel}
                whileHover={{ scale: 1.1, rotate: 10 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all"
                title="Download as Excel"
              >
                <FiDownloadCloud className="text-xl" />
              </motion.button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {data.yearlyDepreciation.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-white via-blue-50 to-indigo-50 border border-gray-200 rounded-xl shadow-sm p-4 hover:shadow-lg transition transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">Year {item.year}</h4>
                    <span className="text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      ₹{item.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${Math.min((item.value / data.originalCost) * 100, 100)}%`,
                      }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                    ></motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}
