import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaUmbrellaBeach, FaUserTie, FaClock, FaChartLine, FaArrowRight } from 'react-icons/fa';
import ProfileDropdown from './ProfileDropdown';
import ProfilePart from './ProfilePart';
import axios from 'axios';
import { MAIN_API_BASE } from '../config/apiBase';
import logo from '../assests/Logo.png'; // Add logo import if needed

const HRMSCard = ({ title, icon, onClick, colorClass }) => (
    <button
        onClick={onClick}
        className="group relative flex flex-col items-start justify-between p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 w-full text-left overflow-hidden min-h-[180px]"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
        
        <div className={`p-4 rounded-xl bg-gradient-to-br ${colorClass} bg-opacity-10 text-white mb-4 shadow-sm`}>
             <div className="text-3xl text-white">{icon}</div>
        </div>
        
        <div className="z-10">
            <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Click to manage</p>
        </div>

        <div className="absolute bottom-6 right-6 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-500">
            <FaArrowRight />
        </div>
    </button>
);

const CardPage = () => {
    const [availableBtn, setAvailableBtn] = useState({});
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');
    const [userData, setUserData] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    
    const navigate = useNavigate();
    const location = useLocation();

    // Verify Token & Auth
    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                navigate('/');
                return;
            }
            try {
                await axios.post(`${MAIN_API_BASE}/users/verify-token`, { token });
            } catch (error) {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('tokenExpiry');
                navigate('/');
            }
        };
        verifyToken();
    }, [token, navigate]);

    // Fetch User Data
    useEffect(() => {
        if (userId) {
            const fetchUserData = async () => {
                try {
                    const response = await axios.get(`${MAIN_API_BASE}/users/id_user/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.data.user) {
                        setUserData(response.data.user);
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            };
            fetchUserData();
        }
    }, [userId, token]);

    // Fetch Accessible Cards
    useEffect(() => {
        const getUserAccessibleCard = async () => {
            const cardTitles = ['LMC', 'HR', 'AttendanceTab', 'PMS'];
            if (!token) return;
            
            try {
                const response = await fetch(`${MAIN_API_BASE}/access/verify-access`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        user_id: parseInt(userId),
                        pages: cardTitles
                    })
                });
                
                const data = await response.json();
                const available = {};
                Object.entries(data).forEach(([key, value]) => {
                    if (value) available[key] = key;
                });
                setAvailableBtn(available);
            } catch (error) {
                console.error(error.message);
            }
        };
        getUserAccessibleCard();
    }, [userId, token]);

    const getCardConfig = (key) => {
        switch (key) {
            case "LMC": 
                return { title: "Leave Management", icon: <FaUmbrellaBeach />, color: "from-blue-500 to-cyan-400", path: "Leave" };
            case "HR": 
                return { title: "HR Corner", icon: <FaUserTie />, color: "from-purple-500 to-pink-400", path: "HRCorner" };
            case "AttendanceTab": 
                return { title: "Attendance", icon: <FaClock />, color: "from-green-500 to-emerald-400", path: "AMSTab" };
            case "PMS": 
                return { title: "Performance", icon: <FaChartLine />, color: "from-orange-500 to-amber-400", path: "PMSTab" };
            default: 
                return { title: key, icon: <FaHome />, color: "from-gray-500 to-gray-400", path: "#" };
        }
    }

    const handleHome = () => navigate('/Cards');

    // Handle back button popstate
    useEffect(() => {
        const handlePopState = () => {
            if (location.pathname !== '/Cards') {
                navigate('/Cards', { replace: true });
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [location, navigate]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen font-sans">
             {/* Sticky Header - Consistent with Cards.js */}
             <div className="bg-custome-blue rounded-lg w-full px-4 py-3 flex justify-between items-center shadow-lg sticky top-0 z-20 mb-6">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={handleHome} 
                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white backdrop-blur-sm"
                        title="Back to Dashboard"
                    >
                        <FaHome size={20} />
                    </button>
                    <div className="h-8 w-[1px] bg-white/30"></div>
                    <h1 className="text-white text-xl sm:text-2xl font-bold tracking-wide">HRMS</h1>
                </div>

                {userData && (
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="bg-white flex items-center rounded-full pl-1 pr-3 py-1 transition-all hover:shadow-md active:scale-95"
                        >
                            <img
                                src="https://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef"
                                alt="Profile"
                                className="h-8 w-8 rounded-full border border-gray-100 object-cover"
                            />
                             <div className="ml-2 hidden sm:block text-left">
                                <h3 className="text-xs font-bold text-gray-800 leading-tight">
                                    {userData.first_name} {userData.last_name}
                                </h3>
                                <p className="text-[10px] text-gray-500 leading-none mt-0.5">Online</p>
                            </div>
                        </button>
                        {/* Dropdown should naturally be positioned relative to this container if possible, or fixed */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5">
                                <ProfileDropdown /> 
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Layout */}
            <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] gap-6">
                {/* Left Fixed Profile (Same as Cards.js) */}
                <div className="hidden md:block md:w-1/4 lg:w-1/5 h-full">
                    <div className="h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <ProfilePart />
                    </div>
                </div>

                {/* Right Content Area */}
                <div className="w-full md:w-3/4 lg:w-4/5 flex flex-col">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full overflow-y-auto custom-scrollbar">
                        <div className="mb-8 border-b border-gray-100 pb-4">
                            <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">HR Modules</h2>
                            <p className="text-gray-500 mt-2 text-lg">Select a module to proceed with your tasks.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                            {Object.entries(availableBtn).map(([key, value]) => {
                                const config = getCardConfig(value);
                                return (
                                    <HRMSCard
                                        key={key}
                                        title={config.title}
                                        icon={config.icon}
                                        colorClass={config.color}
                                        onClick={() => navigate(`/${config.path}`)}
                                    />
                                );
                            })}
                        </div>

                        {Object.keys(availableBtn).length === 0 && (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                <p className="text-lg font-medium">No HR modules available.</p>
                                <p className="text-sm">Please contact your administrator for access.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardPage;
