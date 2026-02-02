import React, { useEffect, useState } from "react";
import axios from "axios";
import Chart from "react-apexcharts";
import { MAIN_API_BASE } from "../config/apiBase";

const CityUserChart = () => {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        const [locRes, usersRes] = await Promise.all([
          axios.get(`${MAIN_API_BASE}/loc`, { headers }),
          axios.get(`${MAIN_API_BASE}/users`, { headers })
        ]);

        const locations = locRes.data || [];
        const users = usersRes.data?.users || [];

        const localityCounts = {};
        locations.forEach(loc => { localityCounts[loc.locality] = 0; });

        users.forEach(user => {
          if (user.locality) {
            localityCounts[user.locality] = (localityCounts[user.locality] || 0) + 1;
          }
        });

        // Sort by count desc and take top 10 to clear clutter
        const sortedLocs = Object.keys(localityCounts)
          .filter(loc => localityCounts[loc] > 0)
          .sort((a, b) => localityCounts[b] - localityCounts[a]);

        // Limit x-axis if too many
        const topLocs = sortedLocs.length > 15 ? sortedLocs.slice(0, 15) : sortedLocs;

        setCategories(topLocs);
        setSeries([{
          name: 'Employees',
          data: topLocs.map(loc => localityCounts[loc])
        }]);

      } catch (err) {
        console.error("Error fetching data:", err);
        setSeries([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartOptions = {
    chart: {
      type: 'bar',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    // Varied palette: Emerald, Teal, Cyan, Sky, Blue, Indigo
    colors: ['#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1'],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 4,
        columnWidth: '55%',
        distributed: true, // Distributed colors
      }
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: categories,
      labels: {
        rotate: -45,
        style: {
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
          colors: '#64748B'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748B',
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif',
        },
        formatter: (val) => Math.floor(val)
      },
      axisBorder: { show: false }
    },
    grid: {
      borderColor: '#F1F5F9',
      strokeDashArray: 4,
      yaxis: { lines: { show: true } },
      xaxis: { lines: { show: false } },
      padding: { top: 0, right: 0, bottom: 0, left: 10 }
    },
    tooltip: {
      theme: 'light',
      y: {
        formatter: function (val) {
          return val + " User(s)"
        }
      },
      style: { fontSize: '12px' }
    }
  };

  return (
    <div className="w-full h-full min-h-[320px] bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">User Distribution</h2>
          <p className="text-xs text-gray-500 mt-0.5">Active users by location</p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="flex-1 w-full">
          <Chart options={chartOptions} series={series} type="bar" height={220} width="100%" />
        </div>
      )}
    </div>
  );
};
export default CityUserChart;