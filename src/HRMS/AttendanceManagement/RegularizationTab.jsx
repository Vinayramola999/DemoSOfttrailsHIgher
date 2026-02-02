import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ManualInput from './ManualInput';
import ManagerApproval from './ManagerApproval';

const AttendanceTab = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("Regularization");
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "Regularization", label: "Regularization" }]);

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
                const response = await axios.get(`https://devdemo.softtrails.net/access/access/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userAccess = response.data;
                const hasRegularizationAccess = userAccess.some(access => access.api_name === 'Regularization');
                const hasManagerApprovalAccess = userAccess.some(access => access.api_name === 'ManagerApproval');
                // Dynamically build tabs
                const accessibleTabs = [];
                if (hasRegularizationAccess) accessibleTabs.push({ id: "Regularization", label: "Regularization" });
                if (hasManagerApprovalAccess) accessibleTabs.push({ id: "managerapproval", label: "Manager Approval" });
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

    // return (
    //     <div className="flex flex-col w-full">
    //         <div className="flex flex-col w-full">
    //             <div className="flex flex-col">
    //                 {/* Tab Bar */}
    //                 <div className="relative overflow-x-auto no-scrollbar">
    //                     <div className="flex gap-2 w-max px-1 py-1 rounded-full relative whitespace-nowrap">
    //                         {/* Animated Indicator */}
    //                         <motion.div
    //                             layout
    //                             className="absolute bg-gradient-to-r from-blue-500 to-blue-800 rounded-full h-10 top-0 z-0"
    //                             animate={indicatorStyle}
    //                             transition={{ type: "spring", stiffness: 500, damping: 30 }}
    //                         />

    //                         {/* Tab Buttons */}
    //                         {tabs.map((tab) => (
    //                             <button
    //                                 key={tab.id}
    //                                 ref={(el) => (tabRefs.current[tab.id] = el)}
    //                                 onClick={() => setActiveTab(tab.id)}
    //                                 className={`relative z-10 px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${activeTab === tab.id ? "text-white" : "text-black"
    //                                     }`}
    //                             >
    //                                 {tab.label}
    //                             </button>
    //                         ))}
    //                     </div>
    //                 </div>

    //                 {/* Tab Content */}
    //                 <div className="flex-grow border-gray-300">
    //                     {activeTab === "Regularization" && <ManualInput />}
    //                     {activeTab === "managerapproval" && <ManagerApproval />}
    //                 </div>
    //             </div>
    //         </div>
    //     </div>

    // );

    return (
        <div className="flex flex-col w-full">
            <div className="flex flex-col w-full">
                <div className="flex flex-col">

                    {/* ✅ Show tabs only if more than one */}
                    {tabs.length > 1 && (
                        <div className="relative overflow-x-auto no-scrollbar">
                            <div className="flex gap-2 w-max px-1 py-1 rounded-full relative whitespace-nowrap">
                                {/* Animated Tab Indicator */}
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
                    )}

                    {/* ✅ Content rendering */}
                    <div className="flex-grow border-gray-300">
                        {tabs.length === 1 && tabs[0].id === "Regularization" && <ManualInput />}
                        {tabs.length === 1 && tabs[0].id === "managerapproval" && <ManagerApproval />}
                        {tabs.length > 1 && activeTab === "Regularization" && <ManualInput />}
                        {tabs.length > 1 && activeTab === "managerapproval" && <ManagerApproval />}
                    </div>

                </div>
            </div>
        </div>
    );
};
export default AttendanceTab;