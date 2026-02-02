import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../Sidebar/HRMSidebar';
import ProfileDropdown from '../ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import UCS3 from './UCS';
import UCS from './UCS';    
import UCS2 from './Ucs2';
import { FaHome, FaSignOutAlt } from 'react-icons/fa';

const Organization = () => {
    const [userData, setUserData] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("UCS3");
    const navigate = useNavigate();
    const userId = localStorage.getItem('userId');

    const tabs = [
        { id: "UCS3", label: "setup" },    
        { id: "UCS", label: "Add Template" },
        { id: "UCS2", label: "Select Template" },
    ];

    const handleHome = () => {
        navigate('/Cards');
    };

    const getToken = () => {
        const token = localStorage.getItem('token');
        return token;
    };
    const token = getToken();

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`http://13.204.15.86:8336/users/id_user/${userId}`, {
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

    const verifyToken = async () => {
        if (!token) {
            // navigate('/');
            return;
        }
        try {
            await axios.post('http://35.154.158.192:3006/verify-token', { token });
            navigate('/AllTabs');
        } catch (error) {
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiry');
            // navigate('/');
        }
    };

    useEffect(() => {
        verifyToken();
    }, []);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsDropdownOpen(false);
        }
    };

    const dropdownRef = useRef(null);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        // Example logic
        localStorage.clear();
        window.location.href = '/login'; // or use useNavigate() from react-router
    };

    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className='p-6 w-full'>
                <div className="bg-custome-blue rounded-lg w-full p-3 flex justify-between items-center shadow-lg">
                    {/* Home Button */}
                    <button
                        onClick={handleHome}
                        type="button"
                        className="flex items-center p-2 rounded-full"
                    >
                        <FaHome className="text-white mr-2" size={25} />
                    </button>
                    {/* Title */}
                    <h1 className="text-white text-2xl font-bold text-center flex-1">
                        Unified Communication Service
                    </h1>

                    <button
                        onClick={handleLogout}
                        type="button"
                        className="bg-white flex items-center p-2 rounded-full"
                    >
                        <FaSignOutAlt className="text-black mr-2" size={20} />
                    </button>
                </div>                <div className="ml-[61%] w-[50%] fixed z-20">
                    {isDropdownOpen && (
                        <div ref={dropdownRef}>
                            <ProfileDropdown className="absolute z-10 right-0" />
                        </div>
                    )}
                </div>

                {/* Tab Navigation */}
                <div className="flex flex-col w-[100%] mt-2">
                    <div className="flex flex-col  ">
                        <div className="flex gap-2 w-[60%] rounded-full p-1 relative">
                            <motion.div
                                layoutId="activeTab"
                                className="absolute top-1 bottom-1 left-0 bg-gradient-to-r from-blue-500 to-blue-800 rounded-full transition-all duration-300"
                                style={{
                                    width: `calc(100% / ${tabs.length})`,
                                    left: `${(tabs.findIndex((t) => t.id === activeTab) * 100) / tabs.length}%`,
                                }}
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

                        {/* Tab Content */}
                        <div className="mt-1">
                            {activeTab === "UCS3" && <UCS3 />}
                            {activeTab === "UCS" && <UCS />}
                            {activeTab === "UCS2" && <UCS2 />}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
export default Organization;
