import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { MAIN_API_BASE } from "../config/apiBase";

const DashboardCharts = () => {
    const [series, setSeries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const [designationRes, usersRes] = await Promise.all([
                    fetch(`${MAIN_API_BASE}/designation`, {
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    }),
                    fetch(`${MAIN_API_BASE}/users`, {
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    }),
                ]);

                if (!designationRes.ok || !usersRes.ok) throw new Error("Failed to fetch data");

                const designations = await designationRes.json();
                const usersData = await usersRes.json();
                const users = usersData.users || [];

                const designationCounts = {};
                users.forEach((user) => {
                    const designation = user.designation || "Unknown";
                    designationCounts[designation] = (designationCounts[designation] || 0) + 1;
                });

                // Top 10 Designations to keep it clean
                const sortedDesignations = Object.keys(designationCounts)
                    .filter(d => designationCounts[d] > 0)
                    .sort((a,b) => designationCounts[b] - designationCounts[a])
                    .slice(0, 10);

                setCategories(sortedDesignations);
                setSeries([{
                    name: 'Users',
                    data: sortedDesignations.map(d => designationCounts[d])
                }]);

            } catch (error) {
                setError(error.message);
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
        },
        // Varied palette for bars: Indigo, Violet, Purple, Pink, Rose...
        colors: ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#F59E0B', '#10B981'],
        plotOptions: {
            bar: {
                horizontal: true,
                barHeight: '50%',
                borderRadius: 4,
                distributed: true // Enable different colors per bar
            }
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: '#64748B',
                     fontSize: '11px',
                     fontFamily: 'Inter, sans-serif',
                }
            },
            axisBorder: { show: false },
            axisTicks: { show: false }
        },
        yaxis: {
             labels: {
                maxWidth: 150,
                style: {
                    colors: '#475569',
                     fontSize: '11px',
                     fontWeight: 500,
                     fontFamily: 'Inter, sans-serif',
                }
            }
        },
        grid: {
            borderColor: '#F1F5F9',
            xaxis: { lines: { show: true } },
            yaxis: { lines: { show: false } },
             padding: { top: 0, right: 10, bottom: 0, left: 10 }
        },
        tooltip: {
            theme: 'light',
            y: {
                formatter: function (val) {
                    return val + " User(s)"
                }
            }
        }
    };

    return (
        <div className="w-full h-full min-h-[320px] bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Top Roles</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Highest count designations</p>
                </div>
            </div>

            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
            )}
            {error && <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>}

            {!loading && !error && (
                <div className="flex-1 w-full overflow-hidden">
                    <Chart options={chartOptions} series={series} type="bar" height={220} width="100%" />
                </div>
            )}
        </div>
    );
};
export default DashboardCharts;