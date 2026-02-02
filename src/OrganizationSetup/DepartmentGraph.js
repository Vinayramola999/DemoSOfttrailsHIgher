import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { MAIN_API_BASE } from "../config/apiBase";

const DepartmentChart = () => {
    const [series, setSeries] = useState([]);
    const [labels, setLabels] = useState([]);
    const [totalDepartments, setTotalDepartments] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDepartmentAndUsers = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const deptResponse = await fetch(`${MAIN_API_BASE}/departments`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const userResponse = await fetch(`${MAIN_API_BASE}/users`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!deptResponse.ok || !userResponse.ok) throw new Error("Failed to fetch data");

                const departments = await deptResponse.json();
                const usersData = await userResponse.json();
                const users = usersData.users || [];
                setTotalDepartments(departments.length);
                const userCounts = users.reduce((acc, user) => {
                    acc[user.dept_name] = (acc[user.dept_name] || 0) + 1;
                    return acc;
                }, {});

                 const activeDepts = departments
                    .filter(dept => userCounts[dept.dept_name] > 0)
                    .sort((a,b) => (userCounts[b.dept_name] || 0) - (userCounts[a.dept_name] || 0)); // Sort by size

                 const newLabels = activeDepts.map(d => d.dept_name);
                 const newSeries = activeDepts.map(d => userCounts[d.dept_name] || 0);

                setLabels(newLabels);
                setSeries(newSeries);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentAndUsers();
    }, []);

    const chartOptions = {
        chart: {
            type: 'donut',
            fontFamily: 'Inter, sans-serif',
        },
        labels: labels,
        // Varied professional palette: Teal, Blue, Violet, Fuchsia, Rose, Amber, Emerald
        colors: ['#14B8A6', '#3B82F6', '#6366F1', '#8B5CF6', '#D946EF', '#F43F5E', '#F59E0B'],
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
        dataLabels: {
            enabled: false,
        },
        stroke: {
             show: true,
             width: 1,
             colors: ['#fff']
        },
        legend: {
            position: 'right',
            offsetY: 0,
            fontSize: '11px',
            fontFamily: 'Inter, sans-serif',
            markers: {
                radius: 4,
                width: 8,
                height: 8
            },
            itemMargin: {
                horizontal: 0,
                vertical: 4
            }
        },
        tooltip: {
            theme: 'light',
            style: {
                fontSize: '12px'
            }
        },
        responsive: [{
            breakpoint: 1280,
            options: {
                chart: { width: '100%'},
                legend: { position: 'bottom' }
            }
        }]
    };

    return (
        <div className="w-full h-full min-h-[320px] bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900">Departments</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Breakdown by team size</p>
                </div>
            </div>

            {loading && (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
            )}
            {error && <div className="flex-1 flex items-center justify-center text-red-500 text-sm">{error}</div>}

            {!loading && !error && (
                <div className="flex-1 w-full flex items-center justify-center">
                    <Chart options={chartOptions} series={series} type="donut" height={220} width={"100%"} />
                </div>
            )}
        </div>
    );
};
export default DepartmentChart;