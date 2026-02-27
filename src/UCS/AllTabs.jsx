
import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../NewComponents/HRMSidebar';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UCS3 from './UCS3';
import UCS from './UCS';
import UCS2 from './Ucs2';
import Devapi from './Devapi';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';
import UserAddition from './UserAddition';
import { DBSetup } from './DBSetup'; // Importing the DBSetup component
const Organization = () => {
    const [userData, setUserData] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("UCS3");

    // State for Dev API's child tabs
    const [childActiveTab, setChildActiveTab] = useState("MyAPI");
    
    // === NEW STATE FOR GATEWAY SETUP's CHILD TABS ===
    const [gatewayActiveTab, setGatewayActiveTab] = useState("Setup");

    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const tabs = [
        { id: "UCS3", label: "Gateway Setup" },
        { id: "UCS", label: "Add Template" },
        { id: "UCS2", label: "Select Template" },
        { id: "UA", label: "Add Modules" },
        { id: "DA", label: "Dev API" }
    ];

    const handleHome = () => {
        navigate('/Cards');
    };

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
                    const response = await axios.get(`https://saaspro.softtrails.net/saas/main/pro/users/id_user/${userId}`, {
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

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="flex">
            <div className='w-full'>
                <div className="flex flex-col w-full mt-2">
                    <div className="flex flex-col ">
                        <div className="flex gap-2 w-[70%] rounded-full p-1 relative">
                            {/* Framer Motion for main tabs */}
                            <motion.div
                                layoutId="activeTab"
                                className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                                style={{
                                    width: `calc(100% / ${tabs.length})`,
                                    left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`,
                                }}
                                transition={{ type: "spring", stiffness: 600, damping: 20 }}
                            />
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 ${activeTab === tab.id ? "text-white" : "text-gray-700"}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className='mt-4'>
                            {/* === UPDATED: Gateway Setup Tab with Child Tabs === */}
                            {activeTab === "UCS3" && (
                                <div>
                                    {/* Gateway Child Tabs */}
                                    <div className="flex gap-2 my-4">
                                        <button
                                            onClick={() => setGatewayActiveTab("Setup")}
                                            className={`px-4 py-2 rounded-full ${gatewayActiveTab === "Setup" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
                                        >
                                            Setup
                                        </button>
                                        <button
                                            onClick={() => setGatewayActiveTab("DB Setup")}
                                            className={`px-4 py-2 rounded-full ${gatewayActiveTab === "DB Setup" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
                                        >
                                            DB Setup
                                        </button>
                                    </div>
                                    {/* Gateway Child Tab Content */}
                                    <div>
                                        {gatewayActiveTab === "Setup" && <UCS3 />}
                                        {gatewayActiveTab === "DB Setup" && <DBSetup />}
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === "UCS" && <UCS />}
                            {activeTab === "UCS2" && <UCS2 />}
                            {activeTab === "UA" && <div><UserAddition /></div>}
                            
                            {/* Dev API Tab with its child tabs */}
                            {activeTab === "DA" && (
                                <div>
                                    {/* Dev API Child Tabs */}
                                    <div className="flex gap-2 my-4">
                                        <button
                                            onClick={() => setChildActiveTab("MyAPI")}
                                            className={`px-4 py-2 rounded-full ${childActiveTab === "MyAPI" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
                                        >
                                            My API
                                        </button>
                                        <button
                                            onClick={() => setChildActiveTab("MessageLogs")}
                                            className={`px-4 py-2 rounded-full ${childActiveTab === "MessageLogs" ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}
                                        >
                                            Message Logs
                                        </button>
                                    </div>

                                    {/* Dev API Child Tab Content */}
                                    <div>
                                        {childActiveTab === "MyAPI" && <Devapi />}
                                        {childActiveTab === "MessageLogs" && (
                                            <div>
                                                <h2 className="text-xl font-semibold mb-4">Message Logs</h2>
                                                <p>This is the Message Logs tab content. Add your UI or API data here.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Organization;