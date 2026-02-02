import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Attendance from './Attendance';

const AttendanceTab = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("attendance");
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "attendance", label: "Attendance" }]);

    const getToken = () => {
        const token = sessionStorage.getItem('token');
        return token;
    };
    const token = getToken();

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`https://devdemo.softtrails.net/users/id_user/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (response.data) {
                        const user = response.data;
                        setUserData(user);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [token, userId]);

    useEffect(() => {
        const checkAMSAccess = async () => {
            setLoading(true);
            try {
                const userId = sessionStorage.getItem('userId');
                const token = sessionStorage.getItem('token');
                if (!userId || !token) {
                    console.error('userId or token is missing');
                    return;
                }
                const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userAccess = response.data;
                const hasAttendanceAccess = userAccess.some(access => access.api_name === 'Attendance');
                // Dynamically build tabs
                const accessibleTabs = [];
                if (hasAttendanceAccess) accessibleTabs.push({ id: "attendance", label: "Attendance" });
                setTabs(accessibleTabs);
                setActiveTab(accessibleTabs[0].id);
            } catch (error) {
                console.error('Error during API call: ', error);
            } finally {
                setLoading(false);
            }
        };
        checkAMSAccess();
    }, []);

    const tabRefs = useRef({});
    const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

    useEffect(() => {
        const currentTab = tabRefs.current[activeTab];
        if (currentTab) {
            const { offsetLeft, offsetWidth } = currentTab;
            setIndicatorStyle({ width: offsetWidth, left: offsetLeft });
        }
    }, [activeTab]);

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col w-full">
                <div className="flex flex-col">
                    {/* Tab Bar */}
                    <div className="relative overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 w-max px-1 py-1 rounded-full relative whitespace-nowrap">
                            {/* Animated Indicator */}
                            <motion.div
                                layout
                                className="absolute bg-gradient-to-r from-blue-500 to-blue-800 rounded-full h-10 top-0 z-0"
                                animate={indicatorStyle}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />

                            {/* Tab Buttons */}
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    ref={(el) => (tabRefs.current[tab.id] = el)}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${activeTab === tab.id ? "text-white" : "text-black"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-grow border-gray-300">
                        {activeTab === "attendance" && <Attendance />}
                    </div>
                </div>
            </div>
        </div>

    );
};
export default AttendanceTab;