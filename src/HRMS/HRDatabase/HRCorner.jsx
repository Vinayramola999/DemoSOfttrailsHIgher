import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import EmployeeData from '../employee data/EmployeeData';
import Recruitment from './RecruitmentTab';
import HRPolicies from './HRPolicies';
import BulkAttendance from './BulkAttendance';
import VerifyToken from '../../NewComponents/VerifyToken';
import { MAIN_API_BASE } from '../../config/apiBase';

const HRCorner = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("EmployeeData");
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "EmployeeData", label: "Employees" }]);
    VerifyToken("/HRCorner");

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
                    if (response.data.user) {
                        const user = response.data.user;
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
                const response = await axios.get(`${MAIN_API_BASE}/access/access/${userId}`, {
                    headers: {'Authorization': `Bearer ${token}`,},
                });
                const userAccess = response.data;
                const hasEmployeeDataAccess = userAccess.some(access => access.api_name === 'EmployeeData');
                const hasRecruitmentAccess = userAccess.some(access => access.api_name === 'Recruitment');
                const hasPolicyAccess = userAccess.some(access => access.api_name === 'HRPolicies');
                const hasBulkAttendanceAccess = userAccess.some(access => access.api_name === 'BulkAttendance');
                const accessibleTabs = [];
                if (hasEmployeeDataAccess) accessibleTabs.push({ id: "EmployeeData", label: "Employees" });
                if (hasRecruitmentAccess) accessibleTabs.push({ id: "Recruitment", label: "Recruitment Activity" });
                if (hasPolicyAccess) accessibleTabs.push({ id: "HRPolicies", label: "HR Policies" });
                if (hasBulkAttendanceAccess) accessibleTabs.push({ id: "BulkAttendance", label: "Attendance" });
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

    return (
        <div className='flex flex-col w-full'>
            <div className="flex flex-col w-[100%]">
                <div className="flex flex-col gap-4">
                    <div className="flex gap-2 w-[60%] rounded-full p-1 relative">
                        <motion.div
                            layoutId="activeTab"
                            className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                            style={{ width: `calc(100% / ${tabs.length})`, left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`, }}
                            transition={{
                                type: "spring",
                                stiffness: 600,
                                damping: 20,
                            }}
                        />
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-gray-700"
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex-grow h-screen">
                        {activeTab === "EmployeeData" && <EmployeeData />}
                        {activeTab === "Recruitment" && <Recruitment />}
                        {activeTab === "HRPolicies" && <HRPolicies />}
                        {activeTab === "BulkAttendance" && <BulkAttendance />}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default HRCorner;