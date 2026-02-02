import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { motion } from "framer-motion";
import { 
  Info, 
  Download, 
  LayoutDashboard, 
  Box, 
  Activity, 
  AlertCircle, 
  Calendar, 
  TrendingUp,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { DMS_BASE, JAVA_BASE, ASSET_NODE_BASE, UCS_BASE, MAIN_BASE } from "../../config/apiBase";

const STATUS_COLORS = {
  Repository: "#f97316", // Orange
  Inventory: "#3b82f6",  // Blue
  Active: "#10b981",     // Emerald
  Inactive: "#ef4444",   // Red
  Maintanence: "#eab308" // Yellow
};

const BUCKET_COLORS = [
  "#ef4444", // 0-10% (Red)
  "#f97316", // 11-25% (Orange)
  "#eab308", // 26-50% (Yellow)
  "#3b82f6", // 51-75% (Blue)
  "#10b981", // 76-100% (Green)
];

// Custom Card Component with Glassmorphism
const DashboardCard = ({ children, className = "", title, action }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 transition-all duration-300 hover:shadow-xl hover:bg-white/90 ${className}`}
  >
    {(title || action) && (
      <div className="flex justify-between items-center mb-6">
        {title && <h3 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h3>}
        {action}
      </div>
    )}
    {children}
  </motion.div>
);

// KPI Card Component
const KPICard = ({ label, value, icon: Icon, trend, colorClass, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 flex items-start justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group"
  >
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1 group-hover:text-gray-700 transition-colors">{label}</p>
      <h4 className="text-3xl font-bold text-gray-800 tracking-tight">{value}</h4>
      {trend && (
        <div className={`flex items-center mt-2 text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </motion.div>
);

const ReportsDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState(null);
  
  // Refs for chart downloads
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);
  const lifecycleRef = useRef(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${JAVA_BASE}api/categories/movable`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err.message);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Data
  const fetchAllCategoriesData = async () => {
    setAssets([]);
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${ASSET_NODE_BASE}getAllCategoriesData?type=Movable`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const records = res.data?.records || [];
      setAssets(records.flatMap((rec) => rec.data || []));
    } catch (err) {
      console.error("Error fetching data:", err.message);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableData = async (categoryName) => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}?type=Movable`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAssets(res.data?.data || []);
    } catch (err) {
      console.error(err);
      setAssets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCategory || selectedCategory === "All") {
      fetchAllCategoriesData();
    } else {
      fetchTableData(selectedCategory);
    }
  }, [selectedCategory]);

  // --- Calculations ---
  const totalAssets = assets.length;
  const activeAssets = assets.filter(a => a.status === "Active" || (a.status === "Inventory" && a.stages === "Active")).length;
  const inactiveAssets = assets.filter(a => a.status === "Inactive" || (a.status === "Inventory" && a.stages === "Inactive")).length;
  
  // Date calculations
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const assetsToday = assets.filter(a => a.created_at?.slice(0, 10) === todayStr).length;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  const assetsThisWeek = assets.filter(a => a.created_at && new Date(a.created_at) >= oneWeekAgo).length;

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const assetsThisMonth = assets.filter(a => a.created_at && new Date(a.created_at) >= startOfMonth).length;

  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  const assetsLastMonth = assets.filter(a => 
    a.created_at && new Date(a.created_at) >= startOfLastMonth && new Date(a.created_at) <= endOfLastMonth
  ).length;

  const monthGrowth = assetsLastMonth === 0 ? 100 : Math.round(((assetsThisMonth - assetsLastMonth) / assetsLastMonth) * 100);

  // Charts Data
  const statusCounts = assets.reduce((acc, item) => {
    const key = item.status || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));

  const stageCounts = assets.reduce((acc, item) => {
    const key = item.stages || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(stageCounts).map(stage => ({ stage, count: stageCounts[stage] }));

  const timeData = assets
    .filter(it => it.created_at)
    .map(item => {
      const d = new Date(item.created_at);
      return { date: `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth()+1).padStart(2, '0')}-${d.getFullYear()}`, count: 1 };
    });
  
  const groupedTimeData = Object.values(timeData.reduce((acc, item) => {
    acc[item.date] = acc[item.date] || { date: item.date, count: 0 };
    acc[item.date].count++;
    return acc;
  }, {}));

  // Lifecycle
  const lifecycleData = assets
    .filter(a => a["Purchase Date"] && a["Useful Life"])
    .map(a => {
      const purchaseDate = new Date(a["Purchase Date"]);
      if (isNaN(purchaseDate.getTime())) return null; // Skip invalid dates

      const today = new Date();
      const monthsSince = (today.getFullYear() - purchaseDate.getFullYear()) * 12 + (today.getMonth() - purchaseDate.getMonth());
      
      // Handle "Useful Life" which might be a string like "5 years" or just "60"
      let usefulLife = 0;
      if (typeof a["Useful Life"] === 'string') {
          // Extract the first number found in the string
          const match = a["Useful Life"].match(/(\d+)/);
          if (match) {
              usefulLife = parseFloat(match[0]);
              // If the string contains "year" or "yr", convert to months (assuming input is in years if specified)
              if (a["Useful Life"].toLowerCase().includes('year') || a["Useful Life"].toLowerCase().includes('yr')) {
                  usefulLife *= 12;
              }
          }
      } else {
          usefulLife = parseFloat(a["Useful Life"]) || 0;
      }

      const remaining = usefulLife - monthsSince;
      const percent = usefulLife > 0 ? (remaining / usefulLife) * 100 : 0;
      
      return {
        name: a["Asset Name"] || `Asset-${a.unique_id}`,
        usefulLifeMonths: Math.max(0, Math.round(usefulLife)),
        remainingLifeMonths: Math.max(0, Math.round(remaining)),
        remainingPercent: percent, // Allow negative percent to show overdue assets
        status: percent <= 0 ? "Overdue" : percent <= 10 ? "Critical" : "Good"
      };
    })
    .filter(item => item !== null); // Filter out invalid items

  const lifecycleSummary = [
    { name: "0-10%", value: lifecycleData.filter(a => a.remainingPercent <= 10).length },
    { name: "11-25%", value: lifecycleData.filter(a => a.remainingPercent > 10 && a.remainingPercent <= 25).length },
    { name: "26-50%", value: lifecycleData.filter(a => a.remainingPercent > 25 && a.remainingPercent <= 50).length },
    { name: "51-75%", value: lifecycleData.filter(a => a.remainingPercent > 50 && a.remainingPercent <= 75).length },
    { name: "76-100%", value: lifecycleData.filter(a => a.remainingPercent > 75).length },
  ];

  const criticalAssets = lifecycleData.filter(a => a.remainingPercent <= 10);

  const downloadChart = (ref, fileName) => {
    if (!ref?.current) return;
    html2canvas(ref.current, { scale: 2, backgroundColor: "#ffffff" }).then((canvas) => {
      canvas.toBlob((blob) => saveAs(blob, fileName));
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-8 font-sans text-gray-800 bg-transparent">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            Asset Analytics
          </h1>
          <p className="text-gray-500 mt-2 ml-1 font-medium">Real-time insights into your asset inventory and performance.</p>
        </div>
        
        <div className="w-full md:w-72">
          <Select
            options={[{ value: "All", label: "All Categories" }, ...categories.map(c => ({ value: c.categoriesname, label: c.categoriesname }))]}
            value={selectedCategory === "All" ? { value: "All", label: "All Categories" } : { value: selectedCategory, label: selectedCategory }}
            onChange={(opt) => setSelectedCategory(opt.value)}
            classNamePrefix="react-select"
            placeholder="Filter by Category"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '1rem',
                borderColor: 'rgba(255,255,255,0.5)',
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(8px)',
                padding: '4px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                '&:hover': { borderColor: '#6366f1' }
              }),
              menu: (base) => ({
                ...base,
                borderRadius: '1rem',
                overflow: 'hidden',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(16px)',
                backgroundColor: 'rgba(255,255,255,0.95)'
              })
            }}
          />
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <KPICard label="Total Assets" value={totalAssets} icon={Box} colorClass="bg-indigo-500" delay={0.1} />
        <KPICard label="Active" value={activeAssets} icon={Activity} colorClass="bg-emerald-500" delay={0.2} />
        <KPICard label="Inactive" value={inactiveAssets} icon={AlertCircle} colorClass="bg-red-500" delay={0.3} />
        <KPICard label="Added Today" value={assetsToday} icon={Calendar} colorClass="bg-blue-500" delay={0.4} />
        <KPICard label="This Week" value={assetsThisWeek} icon={Layers} colorClass="bg-orange-500" delay={0.5} />
        <KPICard label="Monthly Growth" value={`${monthGrowth}%`} icon={TrendingUp} trend={monthGrowth} colorClass="bg-purple-500" delay={0.6} />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <DashboardCard 
          title="Asset Status Distribution" 
          action={
            <button onClick={() => downloadChart(pieChartRef, "status_chart.png")} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          }
        >
          <div ref={pieChartRef} className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(entry) => setFilteredStatus(entry.name === filteredStatus ? null : entry.name)}
                  cursor="pointer"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || "#94a3b8"} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            {filteredStatus && (
              <div className="text-center mt-2 text-sm text-indigo-600 font-bold bg-indigo-50 py-1 px-4 rounded-full inline-block mx-auto shadow-sm">
                Filtered by: {filteredStatus}
              </div>
            )}
          </div>
        </DashboardCard>

        {/* Stage Analysis */}
        <DashboardCard 
          title="Assets by Stage"
          action={
            <button onClick={() => downloadChart(barChartRef, "stage_chart.png")} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
              <Download className="w-5 h-5" />
            </button>
          }
        >
          <div ref={barChartRef} className="h-[300px] w-full">
            <ResponsiveContainer>
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="stage" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={50}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#818cf8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* Growth Chart */}
      <DashboardCard 
        className="mb-8"
        title="Asset Acquisition Trend"
        action={
          <button onClick={() => downloadChart(lineChartRef, "growth_chart.png")} className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        }
      >
        <div ref={lineChartRef} className="h-[300px] w-full">
          <ResponsiveContainer>
            <AreaChart data={groupedTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#6366f1" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* Lifecycle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lifecycle Chart */}
        <DashboardCard 
          title="Lifecycle Overview" 
          className="lg:col-span-1"
          action={
            <div className="group relative">
              <Info className="w-5 h-5 text-gray-400 cursor-help" />
              <div className="absolute right-0 w-64 p-4 bg-gray-800 text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                Shows remaining useful life percentage based on purchase date and expected life span.
              </div>
            </div>
          }
        >
          <div className="h-[300px] w-full">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={lifecycleSummary}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {lifecycleSummary.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BUCKET_COLORS[index]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Critical Assets Table */}
        <DashboardCard title="Critical Assets (≤ 10% Life Remaining)" className="lg:col-span-2">
          {criticalAssets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-600">Asset Name</th>
                    <th className="px-4 py-3 font-bold text-gray-600">Useful Life</th>
                    <th className="px-4 py-3 font-bold text-gray-600">Remaining</th>
                    <th className="px-4 py-3 font-bold text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {criticalAssets.slice(0, 5).map((asset, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-800">{asset.name}</td>
                      <td className="px-4 py-3 text-gray-500">{asset.usefulLifeMonths} mo</td>
                      <td className="px-4 py-3 text-gray-500">{asset.remainingLifeMonths} mo</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          asset.remainingPercent <= 0 ? "bg-red-200 text-red-900" : "bg-red-100 text-red-800"
                        }`}>
                          {asset.remainingPercent <= 0 ? "Overdue" : `${asset.remainingPercent.toFixed(1)}% Left`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {criticalAssets.length > 5 && (
                <div className="mt-4 text-center">
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 font-bold">
                    View All Critical Assets
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
              <Box className="w-12 h-12 mb-2 opacity-20" />
              <p>No critical assets found.</p>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
};

export default ReportsDashboard;
