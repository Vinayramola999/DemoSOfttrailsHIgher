import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from "react-apexcharts";
import { MAIN_API_BASE } from '../config/apiBase';

const UserCategoryChart = () => {
    const [series, setSeries] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [categoryRes, usersRes] = await Promise.all([
                    axios.get(`${MAIN_API_BASE}/user-category/all`, { headers }),
                    axios.get(`${MAIN_API_BASE}/users`, { headers })
                ]);

                const categories = categoryRes.data?.data || [];
                const users = usersRes.data?.users || [];

                // Create a map of category_id to category_name
                const categoryMap = {};
                categories.forEach(cat => {
                    categoryMap[cat.category_id] = cat.category;
                });

                // Count users per category
                const counts = {};
                users.forEach(user => {
                    const catId = user.category_id;
                    if (catId) {
                        const catName = categoryMap[catId] || 'Unknown';
                        counts[catName] = (counts[catName] || 0) + 1;
                    } else {
                        // Handle users without category if needed, or skip
                        // counts['Unassigned'] = (counts['Unassigned'] || 0) + 1;
                    }
                });

                const sortedCategories = Object.keys(counts).sort((a,b) => counts[b] - counts[a]);
                
                const finalLabels = sortedCategories;
                const finalSeries = sortedCategories.map(cat => counts[cat]);

                setLabels(finalLabels);
                setSeries(finalSeries);

            } catch (error) {
                console.error("Error fetching user category data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'Inter, sans-serif',
        },
        labels: labels,
        // Requested Palette: Orange, Blue, Green, Purple
        colors: ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#64748B'],
        stroke: {
            colors: ['#fff'],
            width: 1
        },
        plotOptions: {
            pie: {
                expandOnClick: false,
                donut: {
                    size: '70%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            offsetY: -6,
                            color: '#64748B',
                            fontSize: '11px',
                            fontWeight: 500
                        },
                        value: {
                            show: true,
                            fontSize: '18px',
                            fontWeight: 700,
                            color: '#1E293B',
                            offsetY: 6,
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            fontSize: '11px',
                            fontWeight: 500,
                            color: '#64748B',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                            }
                        }
                    }
                }
            }
        },
        dataLabels: { enabled: false },
        legend: {
            position: 'right',
            offsetY: 0,
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            markers: { radius: 4, width: 8, height: 8 },
            itemMargin: { horizontal: 0, vertical: 4 }
        },
        tooltip: {
            theme: 'light',
            style: { fontSize: '12px' },
            y: {
                formatter: function (val) {
                    return val + " User(s)"
                }
            }
        },
        responsive: [{
            breakpoint: 1280,
            options: {
                chart: { width: '100%' },
                legend: { position: 'bottom' }
            }
        }]
    };

    return (
        <div className="w-full h-full min-h-[320px] bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900">User Categories</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Employment Type Distribution</p>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="flex-1 w-full flex items-center justify-center">
                    <Chart options={chartOptions} series={series} type="donut" height={220} width={"100%"} />
                </div>
            )}
        </div>
    );
};

export default UserCategoryChart;
