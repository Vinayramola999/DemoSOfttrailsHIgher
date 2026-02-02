import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import User from './Usermng';
import Group from './Role';
import { MAIN_API_BASE } from '../config/apiBase';
import VerifyToken from '../NewComponents/VerifyToken';

const Users = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(null);
    const [activeTab, setActiveTab] = useState("summary");
    const navigate = useNavigate();
    const userId = sessionStorage.getItem('userId');
    const [tabs, setTabs] = useState([{ id: "user", label: "Users" }]);
    VerifyToken("/Users");

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
                    const response = await axios.get(
                        `${MAIN_API_BASE}/users/id_user/${userId}`,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );

                    if (response.data.user) {
                        setUserData(response.data.user);
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
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                const userAccess = response.data;
                const hasUserAccess = userAccess.some(access => access.api_name === 'UM');
                const hasGroupAccess = userAccess.some(access => access.api_name === 'Role');
                const accessibleTabs = [];
                if (hasUserAccess) accessibleTabs.push({ id: "user", label: "Users" });
                if (hasGroupAccess) accessibleTabs.push({ id: "group", label: "Group" });
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
                <div className="flex flex-col  gap-4">
                    <div className="flex gap-2 w-[20%] rounded-full p-1 relative">
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
                            <button key={tab.id} className={`relative flex-1 px-4 py-2 rounded-full text-center font-medium transition-all duration-300 z-10 ${activeTab === tab.id ? "text-white" : "text-black"}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-grow border-gray-300 h-screen">
                        {activeTab === "user" && <User />}
                        {activeTab === "group" && <Group />}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Users;