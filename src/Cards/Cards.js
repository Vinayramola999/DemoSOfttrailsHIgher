import React, { useState, useEffect } from "react";
import CardsImagePart from './CardsImagePart';
import ProfileDropdown from './ProfileDropdown';
import { useNavigate } from 'react-router-dom';
import logo from '../assests/Logo.png';
import axios from 'axios';
import ProfilePart from './ProfilePart';
import {MAIN_API_BASE} from '../config/apiBase';
const Cards = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const userId = sessionStorage.getItem('userId');
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/');
            return;
        }
        const verifyToken = async () => {
            try {
                await axios.post(`${MAIN_API_BASE}/users/verify-token`, { token });
            } catch (error) {
                sessionStorage.removeItem('token');
                navigate('/');
            }
        };
        verifyToken();
    }, [token, navigate]);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!userId) return;
            try {
                const response = await axios.get(
                    `${MAIN_API_BASE}/users/id_user/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (response.data.user) {
                    setUserData(response.data.user);
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setUserData({ first_name: "User", last_name: "" });
            }
        };
        fetchUserData();
    }, [token, userId]);

    return (
        <div className="p-6">
            {/* Sticky Header */}
            <div className="bg-custome-blue rounded-lg w-full px-3 py-3 flex flex-col sm:flex-row justify-between items-center shadow-lg sticky top-0 z-10">
                <h1 className="text-white bg-white text-2xl sm:text-3xl font-bold flex items-center">
                    <img src={logo} alt="Logo" className="w-30 sm:w-30 h-10 sm:h-12" />
                </h1>
                {userData && (
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="bg-white flex items-center rounded-full mt-2 sm:mt-0 sm:mr-5 px-2 py-2"
                    >
                        <img
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/8839e5a86c91c744ae902ecbb75ae11121a15ba11a67d20ec56f825e116dd9ef"
                            alt="Profile"
                            className="h-6 w-6 sm:h-8 sm:w-8 rounded-full"
                        />
                        <div className="ml-2">
                            <h3 className="text-xs sm:text-sm font-semibold text-custome-black">
                                {userData.first_name} {userData.last_name}
                            </h3>
                        </div>
                    </button>
                )}
            </div>
            {/* Dropdown */}
            {isDropdownOpen && (
                <div className="fixed right-6 top-[70px] sm:top-[90px] z-20">
                    <ProfileDropdown />
                </div>
            )}
            {/* Main Content */}
            <div className="flex flex-col md:flex-row p-5 h-[calc(100vh-120px)] gap-5">
                {/* Left Fixed Profile (20%) */}
                <div className="md:w-1/5 w-full overflow-hidden rounded-xl bg-white">
                    <ProfilePart />
                </div>

                {/* Right Scrollable Cards */}
                <div className="md:w-4/5 w-full bg-white rounded-xl overflow-y-auto scrollbar-hide">
                    <CardsImagePart />
                </div>
            </div>
        </div>
    );
};
export default Cards;