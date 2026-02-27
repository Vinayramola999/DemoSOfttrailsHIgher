import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import RegularizationTab from './RegularizationTab';
import IndividualAttendance from './IndividualAttendance';
import TimeManagement from './TimeManagement';
import VerifyToken from '../../NewComponents/VerifyToken';
import {MAIN_API_BASE} from "../../config/apiBase";
const AMSTab = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("TimeManagement");
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "TimeManagement", label: "Time Management" }]);
    VerifyToken("/AMSTab");

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
                    const response = await axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    // accept either { user: {...} } or {...} responses
                    const user = response?.data?.user ?? response?.data;
                    if (user) setUserData(user);
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
                const response = await axios.get(`${MAIN_API_BASE}/access/access/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}`, },
                });
                const userAccess = Array.isArray(response.data) ? response.data : [];
                const hasTimeManagementAccess = userAccess.some(access => access.api_name === 'TimeManagement');
                const hasAttendanceAccess = userAccess.some(access => access.api_name === 'Individual')
                const hasRegularizationTab = userAccess.some(access => access.api_name === 'RegularizationTab');
                const accessibleTabs = [];
                if (hasTimeManagementAccess) accessibleTabs.push({ id: "TimeManagement", label: "Time Management" });
                if (hasAttendanceAccess) accessibleTabs.push({ id: "Individual", label: "Attendance" });
                if (hasRegularizationTab) accessibleTabs.push({ id: "RegularizationTab", label: "Regularization" });
                if (accessibleTabs.length > 0) {
                    setTabs(accessibleTabs);
                    setActiveTab(accessibleTabs[0].id);
                } else {
                    const defaultTabs = [{ id: "TimeManagement", label: "Time Management" }];
                    setTabs(defaultTabs);
                    setActiveTab(defaultTabs[0].id);
                }
            } catch (error) {
                console.error('Error during API call: ', error);
            } finally {
                setLoading(false);
            }
        };
        checkAMSAccess();
    }, []);

    return (
        <div className='flex flex-col w-full'>
            <div className="flex flex-col w-[100%]">
                <div className="flex flex-col gap-4">
                    <div className="sticky top-0 z-20 backdrop-blur-sm">
                        <div className="flex gap-2 w-[60%] rounded-full p-1 relative">
                            <motion.div
                            layoutId="activeTab"
                            className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                            style={{
                                width: tabs.length ? `calc(100% / ${tabs.length})` : '100%',
                                left: tabs.length ? `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%` : '0%',
                            }}
                            transition={{ type: "spring", stiffness: 600, damping: 20, }}
                        />
                            {tabs.map((tab) => (
                                <button key={tab.id} className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-gray-700"}`} onClick={() => setActiveTab(tab.id)} > {tab.label} </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-grow h-screen">
                        {activeTab === "TimeManagement" && <TimeManagement />}
                        {activeTab === "Individual" && <IndividualAttendance />}
                        {activeTab === "RegularizationTab" && <RegularizationTab />}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AMSTab;