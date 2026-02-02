import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from "react-apexcharts";
import { MAIN_API_BASE } from '../config/apiBase';

const DomainChart = () => {
    const [series, setSeries] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem("token");
                const headers = { Authorization: `Bearer ${token}` };

                const [domainRes, usersRes] = await Promise.all([
                    axios.get(`${MAIN_API_BASE}/domain`, { headers }),
                    axios.get(`${MAIN_API_BASE}/users`, { headers })
                ]);

                const domains = domainRes.data || [];
                const users = usersRes.data?.users || [];

                const counts = domains.map((domain) => {
                    const domainName = domain.domain_name.toLowerCase();
                    const count = users.filter((user) =>
                        user.email && user.email.toLowerCase().includes(domainName)
                    ).length;
                    return count;
                });

                const activeIndices = counts.map((c, i) => c > 0 ? i : -1).filter(i => i !== -1);
                // Sort by count desc
                activeIndices.sort((a,b) => counts[b] - counts[a]);

                const filteredSeries = activeIndices.map(i => counts[i]);
                const filteredLabels = activeIndices.map(i => domains[i].domain_name);

                setSeries(filteredSeries);
                setLabels(filteredLabels);

            } catch (error) {
                console.error("Error fetching data:", error);
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
        stroke: {
            colors: ['#fff'],
            width: 1
        },
        // Varied palette: Blue, Cyan, Sky, Indigo, Violet
        colors: ['#2563EB', '#0891B2', '#0EA5E9', '#4F46E5', '#7C3AED'],
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
        dataLabels: { enabled: false },
        tooltip: {
            theme: 'light',
            style: { fontSize: '12px' }
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
                    <h2 className="text-base font-bold text-gray-900">Email Domains</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Users by email provider</p>
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
export default DomainChart;