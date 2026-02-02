import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import { motion } from "framer-motion";
import { 
  Download, 
  Box, 
  Activity, 
  AlertCircle, 
  Calendar, 
  TrendingUp,
  Layers,
  DollarSign,
  Clock,
  ArrowUpRight,
  ArrowDownRight
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
  AreaChart,
  Area
} from "recharts";
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { JAVA_BASE, ASSET_NODE_BASE } from "../../config/apiBase";

const STATUS_COLORS = {
  Repository: "#f97316", // Orange
  Inventory: "#3b82f6",  // Blue
  Active: "#10b981",     // Emerald
  Inactive: "#ef4444",   // Red
};

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
      <h4 className="text-2xl font-bold text-gray-800 tracking-tight">{value}</h4>
      {trend !== undefined && (
        <div className={`flex items-center mt-2 text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
          <TrendingUp className={`w-3 h-3 mr-1 ${trend < 0 ? 'rotate-180' : ''}`} />
          <span>{Math.abs(trend)}% vs last month</span>
        </div>
      )}
    </div>
    <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10 group-hover:bg-opacity-20 transition-all duration-300`}>
      <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
  </motion.div>
);

const RawMaterialDashboard = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState(null);
  
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const lineChartRef = useRef(null);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${JAVA_BASE}api/categories/rawmaterials`, {
          headers: { Authorization: `Bearer ${token}` }
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
    setMaterials([]);
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(`${ASSET_NODE_BASE}getAllCategoriesData?type=RawMaterials`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const records = res.data?.records || [];
      setMaterials(records.flatMap((rec) => rec.data || []));
    } catch (err) {
      console.error("Error fetching all raw materials:", err.message);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryData = async (categoryName) => {
    if (!categoryName) return;
    setMaterials([]);
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const res = await axios.get(
        `${ASSET_NODE_BASE}getColumnTypesAndData/${categoryName}?type=Raw material`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMaterials(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching materials:", err.message);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCategory === "All") {
      fetchAllCategoriesData();
    } else {
      fetchCategoryData(selectedCategory);
    }
  }, [selectedCategory]);

  // --- KPIs ---
  const totalMaterials = materials.length;
  const inventoryMaterials = materials.filter(m => m.status === "Inventory").length;
  const repositoryMaterials = materials.filter(m => m.status === "Repository").length;
  
  // Date calculations
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const materialsToday = materials.filter(m => m.created_at?.slice(0, 10) === todayStr).length;
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(today.getDate() - 7);
  const materialsThisWeek = materials.filter(m => m.created_at && new Date(m.created_at) >= oneWeekAgo).length;

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const materialsThisMonth = materials.filter(m => m.created_at && new Date(m.created_at) >= startOfMonth).length;

  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  const materialsLastMonth = materials.filter(m => 
    m.created_at && new Date(m.created_at) >= startOfLastMonth && new Date(m.created_at) <= endOfLastMonth
  ).length;

  const monthGrowth = materialsLastMonth === 0 ? 100 : Math.round(((materialsThisMonth - materialsLastMonth) / materialsLastMonth) * 100);

  // Financials
  const totalValue = materials.reduce((sum, m) => sum + (parseFloat(m["Total Cost"]) || 0), 0);

  // Charts Data
  const statusCounts = materials.reduce((acc, item) => {
    const key = item.status || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));

  const stageCounts = materials.reduce((acc, item) => {
    const key = item.stages || "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.keys(stageCounts).map(stage => ({ stage, count: stageCounts[stage] }));

  const timeData = materials
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

  // Recent / High Value Items
  // Sort by created_at desc for "Recent"
  const recentMaterials = [...materials].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);

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
          <p className="text-gray-500 font-medium">Loading Materials...</p>
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
              <Box className="w-6 h-6 text-white" />
            </div>
            Raw Material Analytics
          </h1>
          <p className="text-gray-500 mt-2 ml-1 font-medium">Overview of raw material inventory and valuation.</p>
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
        <KPICard label="Total Materials" value={totalMaterials} icon={Box} colorClass="bg-indigo-500" delay={0.1} />
        <KPICard label="Inventory" value={inventoryMaterials} icon={Activity} colorClass="bg-emerald-500" delay={0.2} />
        <KPICard label="Repository" value={repositoryMaterials} icon={AlertCircle} colorClass="bg-red-500" delay={0.3} />
        <KPICard label="Added Today" value={materialsToday} icon={Calendar} colorClass="bg-blue-500" delay={0.4} />
        <KPICard label="This Week" value={materialsThisWeek} icon={Layers} colorClass="bg-orange-500" delay={0.5} />
        <KPICard label="Total Value" value={`₹${(totalValue/100000).toFixed(1)}L`} icon={DollarSign} colorClass="bg-purple-500" delay={0.6} />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <DashboardCard 
          title="Status Distribution" 
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
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
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
          title="Stage-wise Materials"
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
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
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
        title="Material Acquisition Trend"
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
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.95)' }} />
              <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* Recent Additions Table */}
      <DashboardCard title="Recent Material Additions" className="w-full">
        {recentMaterials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 font-bold text-gray-600">Material Name</th>
                  <th className="px-4 py-3 font-bold text-gray-600">Status</th>
                  <th className="px-4 py-3 font-bold text-gray-600">Stage</th>
                  <th className="px-4 py-3 font-bold text-gray-600">Purchase Date</th>
                  <th className="px-4 py-3 font-bold text-gray-600 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentMaterials.map((m, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-gray-800">{m.material_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        m.status === 'Inventory' ? 'bg-blue-100 text-blue-800' : 
                        m.status === 'Repository' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.stages}</td>
                    <td className="px-4 py-3 text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {m["Purchase Date"] ? new Date(m["Purchase Date"]).toLocaleDateString() : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {m["Total Cost"] ? `₹${parseFloat(m["Total Cost"]).toLocaleString()}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[200px] text-gray-400">
            <Box className="w-12 h-12 mb-2 opacity-20" />
            <p>No materials found.</p>
          </div>
        )}
      </DashboardCard>
    </div>
  );
};

export default RawMaterialDashboard;
